// src/components/DayPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayPage.css";

const DayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate(); // useNavigate がインポートされているか確認
  const [events, setEvents] = useState([]);

  // --- ダミーイベントデータ (バックエンドの代わり) ---
  // EventDetailPage.jsx の allDummyEvents と同期させる必要がありますが、
  // 現時点では、EventDetailPage.jsx の allDummyEvents が最新の情報を持っているため、
  // DayPage の dummyEvents は、テスト用として残しておいても問題ありません。
  const dummyEvents = {
    "2025-06-24": [
      { id: "1", title: "チームミーティング", start: "10:00", end: "11:30" },
      { id: "2", title: "資料作成", start: "14:00", end: "16:00" },
      { id: "3", title: "クライアント連絡", start: "17:00", end: "17:30" },
      { id: "4", title: "緊急A会議", start: "10:30", end: "12:00" },
      { id: "5", title: "緊急B会議", start: "10:45", end: "11:45" },
      { id: "6", title: "夕食の準備", start: "18:00", end: "19:00" },
      { id: "7", title: "オンラインレッスン", start: "18:30", end: "20:00" },
    ],
    "2025-06-25": [
      { id: "8", title: "企画会議", start: "09:30", end: "12:00" },
      { id: "9", title: "ランチ", start: "12:00", end: "13:00" },
    ],
  };

  useEffect(() => {
    const selectedDateEvents = dummyEvents[date] || [];
    // IDが数値型の場合、EventDetailPageのallDummyEventsは文字列型にしているので注意が必要です
    // 例: { id: "1", ... } と { id: 1, ... } は別物とみなされます。
    // DayPageのdummyEventsもIDを文字列型に統一することを推奨します。
    setEvents(selectedDateEvents.map(event => ({ ...event, id: String(event.id) }))); // IDを文字列に変換
  }, [date]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

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
        return (startMin < aEndMin && endMin > aStartMin);
      });

      let maxOverlapCount = 0;
      let availableColumn = 0;

      if (collidingEvents.length > 0) {
        const columnsOccupied = new Set();
        collidingEvents.forEach(colEvent => {
          if (colEvent.column !== undefined) {
            columnsOccupied.add(colEvent.column);
          }
        });

        while (columnsOccupied.has(availableColumn)) {
          availableColumn++;
        }

        maxOverlapCount = Math.max(maxOverlapCount, availableColumn + 1);
        collidingEvents.forEach(colEvent => {
          maxOverlapCount = Math.max(maxOverlapCount, colEvent.totalColumns);
        });

      } else {
        maxOverlapCount = 1;
        availableColumn = 0;
      }

      event.column = availableColumn;
      event.totalColumns = maxOverlapCount;
      arrangedEvents.push(event);

      arrangedEvents.forEach(aEvent => {
        if (startMin < timeToMinutes(aEvent.end) && endMin > timeToMinutes(aEvent.start)) {
          aEvent.totalColumns = Math.max(aEvent.totalColumns || 1, maxOverlapCount);
        }
      });
    });

    const pxPerHour = 60;

    return arrangedEvents.map((event) => {
      const startMin = timeToMinutes(event.start);
      const endMin = timeToMinutes(event.end);
      const durationInMinutes = endMin - startMin;

      const top = (startMin / 60) * pxPerHour;
      const height = (durationInMinutes / 60) * pxPerHour;

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

  // ★★★ この handleEventClick 関数を追加！ ★★★
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleAddEventClick = () => {
    navigate(`/event/new?date=${date}`);
  };

  return (
    <div className="day-page-container">
      <div className="day-page-header">
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button onClick={handleAddEventClick} className="add-event-button">予定を追加</button>
      </div>

      <div className="day-view-grid">
        <div className="time-axis">
          {timeSlots.map((time, index) => (
            <div key={index} className="time-slot-label">
              {time}
            </div>
          ))}
        </div>
        <div className="event-area">
          {arrangedEvents.length === 0 ? (
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            arrangedEvents.map((event) => (
              <div
                key={event.id}
                className="event-block"
                style={event.style}
                // ★★★ ここに onClick イベントハンドラを追加！ ★★★
                onClick={() => handleEventClick(event.id)}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">
                  {event.start} - {event.end}
                </div>
              </div>
            ))
          )}
          {/* 1時間ごとの区切り線 */}
          {timeSlots.map((_, index) => (
            <div key={`line-${index}`} className="hour-line" style={{ top: `${index * 60}px` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayPage;