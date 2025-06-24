// src/components/CalendarPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ★追加: useNavigate をインポート★
import "./CalendarPage.css";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const navigate = useNavigate(); // ★追加: useNavigate フックを初期化★

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

  // ★追加: handleDayClick 関数を再導入★
  const handleDayClick = (dayObject) => {
    if (dayObject.isCurrentMonth) {
      // YYYY-MM-DD 形式の文字列を生成 (月は1ベースなので+1する)
      const dateString = `${dayObject.year}-${String(
        dayObject.month + 1,
      ).padStart(2, "0")}-${String(dayObject.date).padStart(2, "0")}`;
      navigate(`/day/${dateString}`);
    }
  };

  // カレンダーの日付データを生成する関数 (変更なし、以前に修正済み)
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
      });
    }

    const today = new Date();
    for (let i = 1; i <= lastDayOfMonth; i++) {
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
      </div>
      <div className="calendar-grid">
        <div className="week-days">
          {dayNames.map((day, index) => (
            <div key={index} className="day-name">
              {day}
            </div>
          ))}
        </div>
        {/* 日付セルを描画 */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            // ★追加: onClick イベントハンドラで handleDayClick を呼び出す★
            onClick={() => handleDayClick(day)}
            className={`day-cell ${day.isCurrentMonth ? "current-month" : "other-month"} ${day.isToday ? "today" : ""}`}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
