// src/components/DayPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayPage.css";

import apiClient from "../api/apiClient";
import SuggestionModal from "./SuggestionModal";


const DayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const eventAreaRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [dragCurrentPos, setDragCurrentPos] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedPlans, setSuggestedPlans] = useState([]);

  // イベントデータの取得
  useEffect(() => {
    const fetchEventsForDay = async () => {
      try {
        const startOfDay = `${date}T00:00:00Z`;
        const endOfDay = `${date}T23:59:59Z`;

        const response = await apiClient.get('/events/', {
          params: { start: startOfDay, end: endOfDay }
        });

        setEvents(response.data.map(event => ({
          ...event,
          id: String(event.id),

          start: new Date(event.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
          end: new Date(event.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
          is_ai_generated: event.title && event.title.startsWith('AI提案:') ? true : false // AI生成フラグを付与（タイトルで識別）

        })));
      } catch (error) {
        console.error("イベントの取得に失敗しました:", error.response?.data || error.message);
        alert(`イベントの取得に失敗しました: ${error.response?.data?.detail || error.message}`);
        setEvents([]);
      }
    };

    fetchEventsForDay();
  }, [date]);

  const PX_PER_HOUR = 60;
  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const calculateEventLayout = (allEvents) => {
    const sortedEvents = [...allEvents].sort((a, b) => {
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    });
    const arrangedEvents = [];
    sortedEvents.forEach((event) => {
      const startMin = timeToMinutes(event.start);
      const endMin = timeToMinutes(event.end);
      const collidingEvents = arrangedEvents.filter((aEvent) => {
        const aStartMin = timeToMinutes(aEvent.start);
        const aEndMin = timeToMinutes(aEvent.end);
        return startMin < aEndMin && endMin > aStartMin;
      });
      let maxOverlapCount = 0;
      let availableColumn = 0;
      if (collidingEvents.length > 0) {
        const columnsOccupied = new Set();
        collidingEvents.forEach((colEvent) => {
          if (colEvent.column !== undefined) {
            columnsOccupied.add(colEvent.column);
          }
        });
        while (columnsOccupied.has(availableColumn)) {
          availableColumn++;
        }
        maxOverlapCount = Math.max(maxOverlapCount, availableColumn + 1);
        collidingEvents.forEach((colEvent) => {
          maxOverlapCount = Math.max(colEvent.totalColumns, maxOverlapCount);
        });
      } else {
        maxOverlapCount = 1;
        availableColumn = 0;
      }
      event.column = availableColumn;
      event.totalColumns = maxOverlapCount;
      arrangedEvents.push(event);
      arrangedEvents.forEach((aEvent) => {
        if (
          startMin < timeToMinutes(aEvent.end) &&
          endMin > timeToMinutes(aEvent.start)
        ) {
          aEvent.totalColumns = Math.max(
            aEvent.totalColumns || 1,
            maxOverlapCount,
          );
        }
      });
    });
    return arrangedEvents.map((event) => {
      const startMin = timeToMinutes(event.start);
      const endMin = timeToMinutes(event.end);
      const durationInMinutes = endMin - startMin;
      const top = (startMin / 60) * PX_PER_HOUR;
      const height = (durationInMinutes / 60) * PX_PER_HOUR;
      const totalColumns = event.totalColumns || 1;
      const columnWidth = 100 / totalColumns;
      const leftPosition = event.column * columnWidth;
      return {
        ...event,
        style: {
          top: `${top}px`,
          height: `${height}px`,
          width: `${columnWidth}%`,
          left: `${leftPosition}%`,
        },
      };
    });
  };

  const arrangedEvents = calculateEventLayout(events);

  const timeSlotsLabels = Array.from({ length: 24 }, (_, i) => {
    return i === 0 ? '' : `${String(i).padStart(2, "0")}:00`;
  });

  const handleMouseDown = (e) => {
    if (e.target !== eventAreaRef.current) return;
    setIsDragging(true);
    const rect = eventAreaRef.current.getBoundingClientRect();
    const posY = e.clientY - rect.top;
    setDragStartPos(posY);
    setDragCurrentPos(posY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = eventAreaRef.current.getBoundingClientRect();
    const posY = e.clientY - rect.top;
    setDragCurrentPos(posY);
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;

    const startY = Math.min(dragStartPos, dragCurrentPos);
    const endY = Math.max(dragStartPos, dragCurrentPos);

    const startMin = (startY / PX_PER_HOUR) * 60;
    const endMin = (endY / PX_PER_HOUR) * 60;

    const isOverlapping = arrangedEvents.some((event) => {
      const eventStartMin = timeToMinutes(event.start);
      const eventEndMin = timeToMinutes(event.end);
      return Math.max(startMin, eventStartMin) < Math.min(endMin, eventEndMin);
    });

    if (isOverlapping) {
      console.log("選択範囲に既存の予定が含まれています。");
      alert("選択範囲に既存の予定が含まれています。");
    } else if (endMin - startMin > 1) { // 1分以上の選択のみ有効
      const formatTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      };
      const startTimeStr = formatTime(startMin);
      const endTimeStr = formatTime(endMin);

      const freeTimeStartISO = `${date}T${startTimeStr}:00Z`;
      const freeTimeEndISO = `${date}T${endTimeStr}:00Z`;

      const plannerRequestData = {
        prev_event_location: "出発地",
        next_event_location: "目的地",
        prev_event_end_time: freeTimeStartISO,
        next_event_start_time: freeTimeEndISO,
        user_preferences: "短時間で楽しめること",
      };

      console.log("送信するプランナーリクエスト:", JSON.stringify(plannerRequestData, null, 2));

      try {
        const response = await apiClient.post('/planner/generate-plans', plannerRequestData);
        console.log("提案結果:", response.data);
        if (response.data.plans && response.data.plans.length > 0) {
          setSuggestedPlans(response.data.plans);
          setIsModalOpen(true);
        } else {
          alert("提案が見つかりませんでした。");
        }
      } catch (error) {
        console.error("提案の取得に失敗しました:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.detail || error.message;
        alert(`提案の取得に失敗しました: ${JSON.stringify(errorMessage)}`);
      }
    }

    setIsDragging(false);
    setDragStartPos(null);
    setDragCurrentPos(null);
  };

  const handleSelectPlan = async (planEvents) => {
    try {
      for (const event of planEvents) {
        const eventData = {

          title: `AI提案: ${event.title}`, // タイトルにプレフィックスを追加して識別を容易にする
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || null,
          description: event.description || null,
          is_ai_generated: true, // AI生成フラグを付与（バックエンドのスキーマにフィールドがない場合、DBには保存されない）

        };
        await apiClient.post('/events/', eventData); // イベント追加APIを呼び出し
      }
      alert("選択されたプランのイベントを追加しました！");
      setIsModalOpen(false);

      // イベント追加後、DayPageのイベントリストを再読み込み
      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;
      const response = await apiClient.get('/events/', { params: { start: startOfDay, end: endOfDay } });
      setEvents(response.data.map(event => ({
        ...event,
        id: String(event.id),
        start: new Date(event.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
        end: new Date(event.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
        is_ai_generated: event.title && event.title.startsWith('AI提案:') ? true : false // APIレスポンスから再識別

      })));

    } catch (error) {
      console.error("プランの追加に失敗しました:", error.response?.data || error.message);
      alert(`プランの追加に失敗しました: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getSelectionBoxStyle = () => {
    if (!isDragging) return { display: "none" };
    const startY = Math.min(dragStartPos, dragCurrentPos);
    const endY = Math.max(dragStartPos, dragCurrentPos);
    return {
      top: `${startY}px`,
      height: `${endY - startY}px`,
    };
  };

  const handleEventClick = (eventId) => navigate(`/event/${eventId}`);
  const handleAddEventClick = () => navigate(`/event/new?date=${date}`);

  return (
    <div className="day-page-container">
      <div className="day-page-header">
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button onClick={handleAddEventClick} className="add-event-button">
          予定を追加
        </button>
      </div>

      <div className="day-view-grid">
        <div className="time-axis">
          {timeSlotsLabels.map((time, index) => (
            <div key={index} className={`time-slot-label ${index === 0 ? 'hour-label-zero' : ''}`}>
              {time}
            </div>
          ))}
        </div>
        <div
          className="event-area"
          ref={eventAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // エリア外に出たらドラッグ終了
        >
          <div className="selection-box" style={getSelectionBoxStyle()}></div>

          {arrangedEvents.length === 0 ? (
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            arrangedEvents.map((event) => (
              <div
                key={event.id}
                className={`event-block ${event.is_ai_generated ? 'ai-event-block' : ''}`}
                style={event.style}
                onClick={() => handleEventClick(event.id)}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">
                  {event.start} - {event.end}
                </div>
              </div>
            ))
          )}
          {timeSlotsLabels.map((_, index) => ( // 区切り線も timeSlotsLabels を使用
            <div
              key={`line-${index}`}
              className="hour-line"
              style={{ top: `${index * PX_PER_HOUR}px` }}
            ></div>
          ))}
        </div>
      </div>

      <SuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suggestions={suggestedPlans}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
};

export default DayPage;