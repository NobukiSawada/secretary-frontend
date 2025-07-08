// src/components/DayPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayPage.css";

const DayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const eventAreaRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [dragCurrentPos, setDragCurrentPos] = useState(null);

  const dummyEvents = {
    "2025-07-01": [
      { id: "1", title: "チームミーティング", start: "10:00", end: "11:30" },
      { id: "2", title: "資料作成", start: "14:00", end: "16:00" },
    ],
    "2025-07-08": [
      { id: "8", title: "企画会議", start: "09:30", end: "12:00" },
      { id: "9", title: "ランチ", start: "12:00", end: "13:00" },
      // ここに他のテストイベントを追加できます。例:
      // { id: "10", title: "休憩", start: "15:00", end: "15:30" }
    ],
    // EventDetailPage.jsx の allDummyEvents も参照し、必要に応じてダミーデータを追加してください。
  };

  useEffect(() => {
    const selectedDateEvents = dummyEvents[date] || [];
    setEvents(
      selectedDateEvents.map((event) => ({ ...event, id: String(event.id) })),
    );
  }, [date]);

  const PX_PER_HOUR = 60;
  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const calculateEventLayout = (allEvents) => {
    const sortedEvents = [...allEvents].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
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

  // ★重要: timeSlotsLabels の定義をこちらに統一します。これ以外の timeSlots 定義は削除します。
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

  const handleMouseUp = () => {
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
    } else if (endMin - startMin > 1) {
      const formatTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes / 60); // minutesは60で割るのではなく、分そのものを表示
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      };
      const startTimeStr = formatTime(startMin);
      const endTimeStr = formatTime(endMin);

      const getJSTISOString = (timeStr) => {
        return `${date}T${timeStr}:00+09:00`;
      };

      const freeTimeStart = getJSTISOString(startTimeStr);
      const freeTimeEnd = getJSTISOString(endTimeStr);

      const jsonData = [
        { free_time_start: freeTimeStart },
        { free_time_end: freeTimeEnd },
      ];
      console.log("送信するJSON:", JSON.stringify(jsonData, null, 2));
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
          {/* ★変更: timeSlotsLabels を使用し、0:00 非表示クラスを追加 ★ */}
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
          onMouseLeave={handleMouseUp}
        >
          <div className="selection-box" style={getSelectionBoxStyle()}></div>

          {arrangedEvents.length === 0 ? (
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            arrangedEvents.map((event) => (
              <div
                key={event.id}
                className="event-block"
                style={event.style}
                onClick={() => handleEventClick(event.id)}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.start} - {event.end}</div> {/* ★変更: event.time を追加 ★ */}
              </div>
            ))
          )}
          {/* 1時間ごとの区切り線 */}
          {timeSlotsLabels.map((_, index) => ( // ★変更: timeSlotsLabels を使用 ★
            <div
              key={`line-${index}`}
              className="hour-line"
              style={{ top: `${index * PX_PER_HOUR}px` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayPage;