// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage'; // LoginPageをインポート
import CalendarPage from './components/CalendarPage'; // 後で作成するCalendarPageもインポート

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ログイン状態を管理するstate

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // ログイン成功したらisLoggedInをtrueにする
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        // ログインしていたらカレンダー画面
        <CalendarPage /> // 後でCalendarPageを作成します
      ) : (
        // ログインしていなければログイン画面
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;