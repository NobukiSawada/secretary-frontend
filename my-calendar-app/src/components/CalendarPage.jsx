// src/components/CalendarPage.jsx
import React, { useState } from "react";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
    // 現在の月の1日前を設定することで、前の月の最終日を取得し、その月へ移動
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    // 現在の月の次の月の1日を設定することで、次の月へ移動
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // --- ここから追加・修正する部分 ---

  // カレンダーの日付データを生成する関数
  const generateCalendarDays = () => {
    const days = [];

    // 1. 現在の月の1日の曜日 (0:日曜日, 6:土曜日)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // 2. 現在の月の最終日
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    // 3. 前月の末尾の日付を埋める
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDay = new Date(year, month, 0 - i).getDate();
      days.unshift({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 4. 現在の月の日付を追加
    const today = new Date();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        i === today.getDate();
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isToday,
      });
    }

    // 5. 次の月の初めの日付を埋める (カレンダーを6週分表示するために最大42セル)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;

    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays(); // カレンダーの日付データを生成

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
        {/* 日付セルを描画 --- ここも追加・修正する部分 ---*/}
        {calendarDays.map((day, index) => (
          <div
            key={index}
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
