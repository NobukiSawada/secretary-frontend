// src/components/DayPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayPage.css"; // DayPage用のCSSファイル

const DayPage = () => {
  const { date } = useParams(); // URLから日付パラメータを取得 (例: 2023-10-26)
  const navigate = useNavigate();
  const [events, setEvents] = useState([]); // その日のイベントを格納するState

  // --- ダミーイベントデータ (バックエンドの代わり) ---
  const dummyEvents = {
    "2025-06-24": [
      { id: 1, title: "チームミーティング", start: "10:00", end: "11:30" },
      { id: 2, title: "資料作成", start: "14:00", end: "16:00" },
      { id: 3, title: "クライアント連絡", start: "17:00", end: "17:30" },
    ],
    "2025-06-25": [
      { id: 4, title: "企画会議", start: "09:30", end: "12:00" },
      { id: 5, title: "ランチ", start: "12:00", end: "13:00" },
    ],
    // その他の日付のイベントもここに追加できます
  };

  useEffect(() => {
    // URLの日付に基づいてダミーイベントをフィルタリング
    const selectedDateEvents = dummyEvents[date] || [];
    setEvents(selectedDateEvents);
  }, [date]); // URLの日付が変わるたびに実行

  // 時間軸表示用の配列を生成 (0:00 - 23:00)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  // イベントブロックのスタイルを計算するヘルパー関数
  const calculateEventStyle = (event) => {
    const startHour = parseInt(event.start.split(":")[0]);
    const startMinute = parseInt(event.start.split(":")[1]);
    const endHour = parseInt(event.end.split(":")[0]);
    const endMinute = parseInt(event.end.split(":")[1]);

    // 開始時刻を分の単位で計算 (例: 10:30 -> 10 * 60 + 30 = 630分)
    const startTimeInMinutes = startHour * 60 + startMinute;
    // 終了時刻を分の単位で計算
    const endTimeInMinutes = endHour * 60 + endMinute;

    // 1時間あたりのピクセル数 (例: 100px と仮定)
    const pxPerHour = 60; // CSSで1時間分の高さを60pxに設定すると仮定

    // top (開始位置): 0:00 からの経過時間(分) / 60分 * pxPerHour
    const top = (startTimeInMinutes / 60) * pxPerHour;

    // height (高さ): 継続時間(分) / 60分 * pxPerHour
    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    const height = (durationInMinutes / 60) * pxPerHour;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="day-page-container">
      <div className="day-page-header">
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button className="add-event-button">予定を追加</button> {/* 将来的に使うボタン */}
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
          {events.length === 0 ? (
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="event-block"
                style={calculateEventStyle(event)} // スタイルを適用
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">
                  {event.start} - {event.end}
                </div>
              </div>
            ))
          )}
          {/* 1時間ごとの区切り線 (任意) */}
          {timeSlots.map((_, index) => (
            <div key={`line-${index}`} className="hour-line" style={{ top: `${index * 60}px` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayPage;