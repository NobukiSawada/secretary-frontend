// src/components/MasculineDayPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MasculineDayPage.css"; // 漢モード用のCSSファイル

const MasculineDayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  // --- ダミーイベントデータ (EventDetailPage.jsx の allDummyEvents と同期させるべきですが、ここではコピー) ---
  const allDummyEvents = [
    {
      id: "1",
      title: "チームミーティング",
      start: "10:00",
      end: "11:30",
      date: "2025-06-24",
      description: "週次報告と進捗確認",
      location: "オンライン",
    },
    {
      id: "2",
      title: "資料作成",
      start: "14:00",
      end: "16:00",
      date: "2025-06-24",
      description: "新規プロジェクトの提案資料",
      location: "オフィス",
    },
    {
      id: "3",
      title: "クライアント連絡",
      start: "17:00",
      end: "17:30",
      date: "2025-06-24",
      description: "A社への進捗報告",
      location: "本社",
    },
    {
      id: "4",
      title: "緊急A会議",
      start: "10:30",
      end: "12:00",
      date: "2025-06-24",
      description: "緊急の課題について議論",
      location: "会議室A",
    },
    {
      id: "5",
      title: "緊急B会議",
      start: "10:45",
      end: "11:45",
      date: "2025-06-24",
      description: "追加の課題について議論",
      location: "会議室B",
    },
    {
      id: "6",
      title: "夕食の準備",
      start: "18:00",
      end: "19:00",
      date: "2025-06-24",
      description: "献立はカレー",
      location: "自宅",
    },
    {
      id: "7",
      title: "オンラインレッスン",
      start: "18:30",
      end: "20:00",
      date: "2025-06-24",
      description: "英語のオンラインレッスン",
      location: "オンライン",
    },
    {
      id: "8",
      title: "企画会議",
      start: "09:30",
      end: "12:00",
      date: "2025-06-25",
      description: "新企画のアイデア出し",
      location: "会議室C",
    },
    {
      id: "9",
      title: "ランチ",
      start: "12:00",
      end: "13:00",
      date: "2025-06-25",
      description: "同僚とランチ",
      location: "社食",
    },
  ];

  useEffect(() => {
    // URLの日付に基づいてダミーイベントをフィルタリング
    const selectedDateEvents = allDummyEvents.filter(
      (event) => event.date === date,
    );
    setEvents(
      selectedDateEvents.map((event) => ({ ...event, id: String(event.id) })),
    ); // IDを文字列に変換
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
          maxOverlapCount = Math.max(maxOverlapCount, colEvent.totalColumns);
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

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleAddEventClick = () => {
    navigate(`/event/new?date=${date}`);
  };

  return (
    <div className="masculine-day-page-container">
      {" "}
      {/* ★クラス名変更★ */}
      <div className="masculine-day-page-header">
        {" "}
        {/* ★クラス名変更★ */}
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button
          onClick={handleAddEventClick}
          className="masculine-add-event-button"
        >
          {" "}
          {/* ★クラス名変更★ */}
          予定を追加
        </button>
      </div>
      <div className="masculine-day-view-grid">
        {" "}
        {/* ★クラス名変更★ */}
        <div className="masculine-time-axis">
          {" "}
          {/* ★クラス名変更★ */}
          {timeSlots.map((time, index) => (
            <div key={index} className="masculine-time-slot-label">
              {" "}
              {/* ★クラス名変更★ */}
              {time}
            </div>
          ))}
        </div>
        <div className="masculine-event-area">
          {" "}
          {/* ★クラス名変更★ */}
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
                <div className="masculine-event-title">{event.title}</div>{" "}
                {/* ★クラス名変更★ */}
                <div className="masculine-event-time">
                  {" "}
                  {/* ★クラス名変更★ */}
                  {event.start} - {event.end}
                </div>
              </div>
            ))
          )}
          {/* 1時間ごとの区切り線 */}
          {timeSlots.map((_, index) => (
            <div
              key={`line-${index}`}
              className="masculine-hour-line"
              style={{ top: `${index * 60}px` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasculineDayPage;
