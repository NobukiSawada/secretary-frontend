// src/components/LoginPage.jsx
import React from 'react';
import './LoginPage.css'; // 必要であれば、コンポーネントごとにCSSファイルも作成

const LoginPage = ({ onLoginSuccess }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // ここにログイン処理（ユーザー名、パスワードの検証など）を記述

    // 今回は仮で、ボタンを押したらすぐにカレンダー画面に遷移するようにします
    onLoginSuccess();
  };

  return (
    <div className="login-container">
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">ユーザー名:</label>
          <input type="text" id="username" name="username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default LoginPage;