// src/App.jsx
import React, { useState, useEffect } from "react";
// BrowserRouter は main.jsx に移動するため、ここでは Routes, Route, useNavigate だけをインポート
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import LoginPage from "./components/LoginPage";
import CalendarPage from "./components/CalendarPage";
import DayPage from "./components/DayPage";
import EventDetailPage from "./components/EventDetailPage";
import MasculineCalendarPage from "./components/MasculineCalendarPage";
import MasculineDayPage from "./components/MasculineDayPage";
import LoadingAnimationPage from "./components/LoadingAnimationPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を一旦 true に固定（テスト用）
  const [masculineMode, setMasculineMode] = useState(false); // 漢モードの状態管理

  // useNavigate を App コンポーネントのトップレベルで呼び出します
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const toggleMasculineMode = (targetMode) => {
    // 現在のモードと異なる場合のみ遷移をトリガー
    if (targetMode === 'masculine' && !masculineMode) {
      navigate('/loading?to=/masculine-calendar');
    } else if (targetMode === 'gentle' && masculineMode) {
      navigate('/loading?to=/');
    }
  };

  // masculineMode の状態を body クラスに反映し、URLパスに基づいて masculineMode を更新
  useEffect(() => {
    if (document.body) {
      if (masculineMode) {
        document.body.classList.add('masculine-mode');
      } else {
        document.body.classList.remove('masculine-mode');
      }
    }

    const currentPath = window.location.pathname;
    if (currentPath === '/masculine-calendar' && !masculineMode) {
      setMasculineMode(true);
    } else if (currentPath === '/' && masculineMode) {
      setMasculineMode(false);
    }
  }, [masculineMode, window.location.pathname]);

  return (
    // <Router> は main.jsx に移動したため、ここでは削除し、直下に <div> を配置
    <div className="App">
      <Routes> {/* Routes は App の中で使えます */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <CalendarPage onToggleMode={() => toggleMasculineMode('masculine')} />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/masculine-calendar"
          element={<MasculineCalendarPage onToggleMode={() => toggleMasculineMode('gentle')} />}
        />
        <Route path="/loading" element={<LoadingAnimationPage />} />
        <Route
          path="/day/:date"
          element={masculineMode ? <MasculineDayPage /> : <DayPage />}
        />
        <Route path="/event/:eventId" element={<EventDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;