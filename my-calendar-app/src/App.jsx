// src/App.jsx
import React, { useState } from "react";
// BrowserRouter, Routes, Route をインポート
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage";
import CalendarPage from "./components/CalendarPage";
import DayPage from "./components/DayPage"; // DayPageをインポート

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 開発中は true にしてもOK

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      {" "}
      {/* アプリ全体を <Router> でラップ */}
      <div className="App">
        <Routes>
          {" "}
          {/* ルートの定義 */}
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
          <Route path="/day/:date" element={<DayPage />} />{" "}
          {/* DayPageへのルート */}
          {/* 他のルートもここに追加できます */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
