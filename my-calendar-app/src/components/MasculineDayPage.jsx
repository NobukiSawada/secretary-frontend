// src/components/MasculineDayPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MasculineDayPage.css";
import apiClient from "../api/apiClient"; // APIクライアントをインポート

const MasculineDayPage = () => {
  const { date } = useParams(); // 'YYYY-MM-DD' 形式
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const eventAreaRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [dragCurrentPos, setDragCurrentPos] = useState(null);

  // --- イベントデータの取得 ---
  useEffect(() => {
    const fetchEventsForDay = async () => { // 関数名を明確にする
      try {
        const startOfDay = `${date}T00:00:00Z`; // UTCとして送信
        const endOfDay = `${date}T23:59:59Z`;   // UTCとして送信

        const response = await apiClient.get('/events/', { // GET /events/
          params: { start: startOfDay, end: endOfDay }
        });

        setEvents(response.data.map(event => ({
          ...event,
          id: String(event.id), // IDを文字列に変換
          start: new Date(event.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
          end: new Date(event.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
        })));
      } catch (error) {
        console.error("イベントの取得に失敗しました:", error.response?.data || error.message);
        alert(`イベントの取得に失敗しました: ${error.response?.data?.detail || error.message}`);
        setEvents([]);
      }
    };

    fetchEventsForDay(); // 修正後の関数を呼び出す
  }, [date]); // date が変更されるたびにイベントを再取得

  // --- 時間とピクセルの変換定数 ---
  const PX_PER_HOUR = 60;
  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // --- イベントレイアウト計算ロジック ---
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

  // --- timeSlotsLabels の定義 ---
  const timeSlotsLabels = Array.from({ length: 24 }, (_, i) => {
    return i === 0 ? '' : `${String(i).padStart(2, "0")}:00`;
  });

  // --- ドラッグ操作のイベントハンドラ ---
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

      const freeTimeStart = `${date}T${startTimeStr}:00Z`; // UTCとして送信
      const freeTimeEnd = `${date}T${endTimeStr}:00Z`;     // UTCとして送信

      const suggestionRequestData = {
        free_time_start: freeTimeStart,
        free_time_end: freeTimeEnd,
      };

      console.log("送信する提案リクエスト:", JSON.stringify(suggestionRequestData, null, 2));

      try {
        const response = await apiClient.post('/suggestions/', suggestionRequestData); // POST /suggestions/
        console.log("提案結果:", response.data);
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          const suggestion = response.data.suggestions[0];
          alert(`AIからの提案: \nタイトル: ${suggestion.title}\n説明: ${suggestion.description}\n場所: ${suggestion.location || '不明'}\n費用: ${suggestion.estimated_cost || '不明'}\n関連リンク: ${suggestion.source_link || 'なし'}`);
        } else {
          alert("提案が見つかりませんでした。");
        }
      } catch (error) {
        console.error("提案の取得に失敗しました:", error.response?.data || error.message);
        alert(`提案の取得に失敗しました: ${error.response?.data?.detail || error.message}`);
      }
    }

    setIsDragging(false);
    setDragStartPos(null);
    setDragCurrentPos(null);
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
    <div className="masculine-day-page-container">
      <div className="masculine-day-page-header">
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button onClick={handleAddEventClick} className="masculine-add-event-button">
          予定を追加
        </button>
      </div>
      <div className="masculine-day-view-grid">
        <div className="masculine-time-axis">
          {timeSlotsLabels.map((time, index) => (
            <div key={index} className={`masculine-time-slot-label ${index === 0 ? 'masculine-hour-label-zero' : ''}`}>
              {time}
            </div>
          ))}
        </div>
        <div
          className="masculine-event-area"
          ref={eventAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="masculine-selection-box" style={getSelectionBoxStyle()}></div>

          {arrangedEvents.length === 0 ? (
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            arrangedEvents.map((event) => (
              <div
                key={event.id}
                className="masculine-event-block"
                style={event.style}
                onClick={() => handleEventClick(event.id)}
              >
                <div className="masculine-event-title">{event.title}</div>
                <div className="masculine-event-time">
                  {event.start} - {event.end}
                </div>
              </div>
            ))
          )}
          {timeSlotsLabels.map((_, index) => (
            <div
              key={`line-${index}`}
              className="masculine-hour-line"
              style={{ top: `${index * PX_PER_HOUR}px` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasculineDayPage;