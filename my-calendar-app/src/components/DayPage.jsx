// src/components/DayPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayPage.css";

const DayPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  // --- ダミーイベントデータ (バックエンドの代わり) ---
  const dummyEvents = {
    "2025-06-24": [
      { id: 1, title: "チームミーティング", start: "10:00", end: "11:30" },
      { id: 2, title: "資料作成", start: "14:00", end: "16:00" },
      { id: 3, title: "クライアント連絡", start: "17:00", end: "17:30" },
      { id: 4, title: "緊急A会議", start: "10:30", end: "12:00" }, // チームミーティングと重複
      { id: 5, title: "緊急B会議", start: "10:45", end: "11:45" }, // チームミーティング、緊急A会議と重複
      { id: 6, title: "夕食の準備", start: "18:00", end: "19:00" }, // 新規追加
      { id: 7, title: "オンラインレッスン", start: "18:30", end: "20:00" }, // 夕食の準備と重複
    ],
    "2025-06-25": [
      { id: 4, title: "企画会議", start: "09:30", end: "12:00" },
      { id: 5, title: "ランチ", start: "12:00", end: "13:00" },
    ],
    // その他の日付のイベントもここに追加できます
  };

  useEffect(() => {
    const selectedDateEvents = dummyEvents[date] || [];
    setEvents(selectedDateEvents);
  }, [date]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  // 時間換算ヘルパー関数 (hh:mm を分に変換)
  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // ★★★ 衝突解決ロジックを追加 ★★★
  const calculateEventLayout = (allEvents) => {
    // イベントを時間でソート
    const sortedEvents = [...allEvents].sort((a, b) => {
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    });

    const arrangedEvents = []; // レイアウト情報が追加されたイベントの配列

    // 各イベントに対して衝突情報を計算
    sortedEvents.forEach((event) => {
      const startMin = timeToMinutes(event.start);
      const endMin = timeToMinutes(event.end);

      // このイベントが重なっている既存の配置済みイベントを探す
      const collidingEvents = arrangedEvents.filter((aEvent) => {
        const aStartMin = timeToMinutes(aEvent.start);
        const aEndMin = timeToMinutes(aEvent.end);
        // 時間が重なっているかどうかの判定
        return (startMin < aEndMin && endMin > aStartMin);
      });

      // 衝突しているイベントの数が最大となるグループを見つける
      let maxOverlapCount = 0;
      let availableColumn = 0; // このイベントを配置できる最初のカラム

      if (collidingEvents.length > 0) {
        // 重複するイベントの中で、最も多くのイベントが重なっている「列」を特定
        // そして、このイベントを配置できる空き列を探す
        const columnsOccupied = new Set();
        collidingEvents.forEach(colEvent => {
          if (colEvent.column !== undefined) {
            columnsOccupied.add(colEvent.column);
          }
        });

        // 0から順に、空いているカラムを探す
        while (columnsOccupied.has(availableColumn)) {
          availableColumn++;
        }

        // このイベントを含む衝突グループの最大重複数を計算
        // （シンプル化のため、このイベントが加わることで増える列数で代用）
        maxOverlapCount = Math.max(maxOverlapCount, availableColumn + 1);
        collidingEvents.forEach(colEvent => {
          maxOverlapCount = Math.max(maxOverlapCount, colEvent.totalColumns);
        });

      } else {
        // 衝突がない場合は1列
        maxOverlapCount = 1;
        availableColumn = 0;
      }

      // レイアウト情報をイベントに追加
      event.column = availableColumn; // 何列目に配置するか
      event.totalColumns = maxOverlapCount; // 最大で何列必要か
      arrangedEvents.push(event);

      // 衝突が発生したイベント（自分自身と衝突相手）の totalColumns を更新
      // このイベントが既存の衝突グループに参加した場合、そのグループ全体の totalColumns を更新する必要がある
      arrangedEvents.forEach(aEvent => {
        if (startMin < timeToMinutes(aEvent.end) && endMin > timeToMinutes(aEvent.start)) {
          aEvent.totalColumns = Math.max(aEvent.totalColumns || 1, maxOverlapCount);
        }
      });
    });

    // 最終的なレイアウト情報を計算して返す
    const pxPerHour = 60; // CSSで1時間分の高さを60pxに設定すると仮定

    return arrangedEvents.map((event) => {
      const startMin = timeToMinutes(event.start);
      const endMin = timeToMinutes(event.end);
      const durationInMinutes = endMin - startMin;

      const top = (startMin / 60) * pxPerHour;
      const height = (durationInMinutes / 60) * pxPerHour;

      const totalColumns = event.totalColumns || 1; // 少なくとも1列
      const columnWidth = 100 / totalColumns; // 全体幅を列数で割る (パーセント)
      const leftPosition = event.column * columnWidth; // カラム位置をパーセントで計算

      return {
        ...event,
        style: {
          top: `${top}px`,
          height: `${height}px`,
          width: `${columnWidth}%`, // 横幅を設定
          left: `${leftPosition}%`, // 左からの位置を設定
        },
      };
    });
  };

  // レイアウト情報付きのイベントを取得
  const arrangedEvents = calculateEventLayout(events);


  return (
    <div className="day-page-container">
      <div className="day-page-header">
        <button onClick={() => navigate(-1)}>&lt; カレンダーに戻る</button>
        <h2>{date} の予定</h2>
        <button className="add-event-button">予定を追加</button>
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
          {arrangedEvents.length === 0 ? ( // eventsからarrangedEventsに変更
            <p className="no-events">この日にはまだ予定がありません。</p>
          ) : (
            arrangedEvents.map((event) => ( // arrangedEvents をマップ
              <div
                key={event.id}
                className="event-block"
                style={event.style} // calculateEventStyleからevent.styleに変更
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