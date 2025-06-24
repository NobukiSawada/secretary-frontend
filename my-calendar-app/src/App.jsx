// src/App.jsx
import React, { useState } from "react";
// BrowserRouter, Routes, Route をインポート
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage";
import CalendarPage from "./components/CalendarPage";
import DayPage from "./components/DayPage";
import EventDetailPage from "./components/EventDetailPage"; // EventDetailPageもインポート

function App() {
  // 開発中は isLoggedIn を true にして、ログインをスキップして直接カレンダーを見ることも可能です
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router> {/* アプリ全体を BrowserRouter でラップ */}
      <div className="App"> {/* 全てのルートを含む親コンポーネント */}
        <Routes> {/* ルートの定義を開始 */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <CalendarPage />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          {/* DayPageへのルート */}
          <Route path="/day/:date" element={<DayPage />} />
          {/* EventDetailPageへのルート */}
          <Route path="/event/:eventId" element={<EventDetailPage />} />
          {/* 他のルートを追加する場合はここに記述 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;