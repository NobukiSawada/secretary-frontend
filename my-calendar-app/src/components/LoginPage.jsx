// src/components/LoginPage.jsx
import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // 新しいステートを追加：新規登録モードかどうかを管理
  const [isRegistering, setIsRegistering] = useState(false);
  // 新規登録用のパスワード確認フィールドのステートも追加
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    console.log("Login Attempt - Username:", username, "Password:", password);

    // --- 仮のログイン検証ロジック ---
    if (username === "testuser" && password === "password123") {
      alert("ログイン成功！");
      onLoginSuccess();
    } else {
      alert("ユーザー名またはパスワードが間違っています。");
      setPassword(""); // パスワードをクリア
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    console.log(
      "Register Attempt - Username:",
      username,
      "Password:",
      password,
      "Confirm Password:",
      confirmPassword,
    );

    // --- 仮の新規登録検証ロジック ---
    if (password !== confirmPassword) {
      alert("パスワードと確認用パスワードが一致しません。");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // ここに新規登録処理を記述（例: バックエンドへのAPIリクエスト）
    // 現状はバックエンドがないため、成功したと仮定してアラート表示
    alert(`ユーザー名: ${username} で新規登録しました！`);
    // 新規登録成功後、ログインフォームに戻る
    setIsRegistering(false);
    // 入力フィールドをクリアする
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-container">
      {/* isRegistering の値によって表示を切り替える */}
      {isRegistering ? (
        // 新規登録フォーム
        <>
          <h2>新規登録</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="reg-username">ユーザー名:</label>
              <input
                type="text"
                id="reg-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">パスワード:</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">パスワード（確認用）:</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">登録</button>
          </form>
          <p className="toggle-form-link">
            アカウントをお持ちですか？{" "}
            <button
              className="link-button"
              onClick={() => setIsRegistering(false)}
            >
              ログイン
            </button>
          </p>
        </>
      ) : (
        // ログインフォーム
        <>
          <h2>ログイン</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">ユーザー名:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">ログイン</button>
          </form>
          <p className="toggle-form-link">
            アカウントをお持ちではありませんか？{" "}
            <button
              className="link-button"
              onClick={() => setIsRegistering(true)}
            >
              新規登録
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default LoginPage;
