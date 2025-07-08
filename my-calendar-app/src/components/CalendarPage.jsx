// src/components/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CalendarPage.css";

// APIから取得したイベントのダミーデータ。最終的には実際のAPI通信に置き換えます。
//const dummyEvents = {
//  "2025-07-15": [{ id: 1, title: "会議" }],
//  "2025-07-22": [
//    { id: 2, title: "誕生日会" },
//    { id: 3, title: "歯医者" },
//  ],
//};

const fetchEventsForMonth = async (year, month) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/events/${year}/${month + 1}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return {}; // エラー発生時は空のオブジェクトを返す
  }
};

const CalendarPage = ({ onToggleMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); // イベントを保持するためのstate
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // コンポーネントのマウント時、または年月が変更された際にイベントを取得
  useEffect(() => {
    const getEvents = async () => {
      const fetchedEvents = await fetchEventsForMonth(year, month);
      setEvents(fetchedEvents);
    };
    getEvents();
  }, [year, month]);

  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
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
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;

    for (let i = firstDayOfMonth; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      days.push({
        date: day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    const today = new Date();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayEvents = events[dateString] || [];
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
        events: dayEvents,
      });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let i = 1; days.length < totalCells; i++) {
      days.push({
        date: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendar-container">
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
            <div className="day-number">{day.date}</div>
            <div className="events">
              {day.events.map((event) => (
                <div key={event.id} className="event">
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
