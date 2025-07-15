// src/components/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // axios の代わりに apiClient を使用
import "./CalendarPage.css";

// APIからイベントを取得する関数
const fetchEventsForMonth = async (year, month) => {
  try {
    // 月の初めと終わりを ISO 8601 形式で作成
    const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00Z`;
    // 次の月の0日目 = 現在の月の最終日
    const endOfMonth = `${year}-${String(month + 2).padStart(2, "0")}-01T00:00:00Z`;

    const response = await apiClient.get('/events/', {
      params: { start: startOfMonth, end: endOfMonth }
    });

    // 日付 (YYYY-MM-DD) をキーとしたオブジェクトに変換
    const organizedEvents = {};
    response.data.forEach(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      if (!organizedEvents[eventDate]) {
        organizedEvents[eventDate] = [];
      }
      organizedEvents[eventDate].push({
        id: String(event.id), // IDを文字列に変換
        title: event.title,
        start: event.start_time, // ここではISO文字列のまま保持
        end: event.end_time,     // ここではISO文字列のまま保持
      });
    });
    return organizedEvents;
  } catch (error) {
    console.error("イベントの取得に失敗しました:", error.response?.data || error.message);
    return {}; // エラー発生時は空のオブジェクトを返す
  }
};

const CalendarPage = ({ onToggleMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); // イベントを保持するためのstate
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // コンポーネントのマウント時、または年月が変更された際にイベントを取得
  useEffect(() => {
    const getEvents = async () => {
      const fetchedEvents = await fetchEventsForMonth(year, month);
      setEvents(fetchedEvents);
    };
    getEvents();
  }, [year, month]); // year または month が変更されたら再取得

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayObject) => {
    if (dayObject.isCurrentMonth) {
      const dateString = `${dayObject.year}-${String(dayObject.month + 1).padStart(2, "0")}-${String(dayObject.date).padStart(2, "0")}`;
      navigate(`/day/${dateString}`);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // その月の1日の曜日 (0:日, 6:土)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // その月の最終日

    // 前月の空白日を埋める
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    for (let i = firstDayOfMonth; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      const dateString = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        date: day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
        isToday: false,
        events: events[dateString] || [], // イベントデータを追加
      });
    }

    // 現在の月の日付を追加
    const today = new Date();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayEvents = events[dateString] || []; // イベントデータを追加
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        i === today.getDate();
      days.push({
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isToday: isToday,
        events: dayEvents, // イベントデータを追加
      });
    }

    // 次月の空白日を埋める (カレンダーを6週分表示するために最大42セル)
    const totalCells = days.length > 35 ? 42 : 35; // 5週か6週か
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let i = 1; days.length < totalCells; i++) {
      const dateString = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
        isToday: false,
        events: events[dateString] || [], // イベントデータを追加
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar-container">
      <div className="calendar-message">Just Do It</div>
      <h2>私のカレンダー</h2>
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>&lt; 前の月</button>
        <h3>
          {year}年 {monthNames[month]}
        </h3>
        <button onClick={goToNextMonth}>次の月 &gt;</button>
        <button onClick={onToggleMode}>漢モードへ</button>
      </div>
      <div className="calendar-grid">
        <div className="week-days">
          {dayNames.map((day, index) => (
            <div key={index} className="day-name">
              {day}
            </div>
          ))}
        </div>
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`day-cell ${day.isCurrentMonth ? "current-month" : "other-month"} ${day.isToday ? "today" : ""}`}
          >
            <div className="day-number">{day.date}</div> {/* 日付の数字 */}
            <div className="events-on-day"> {/* その日のイベントを表示するコンテナ */}
              {day.events.slice(0, 2).map(event => ( // 最初の2つだけ表示 (Overflow対策)
                <div key={event.id} className="event-on-day-item">
                  {event.title}
                </div>
              ))}
              {day.events.length > 2 && ( // 3つ以上ある場合は「...」を表示
                <div className="event-on-day-more">...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;