// src/components/LoadingAnimationPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoadingAnimationPage.css";

const LoadingAnimationPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 現在のURLの情報を取得

  useEffect(() => {
    // クエリパラメータから遷移先のパスを取得
    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get("to"); // 例: ?to=/masculine-calendar

    // アニメーション表示時間 (例: 1500ms = 1.5秒)
    const animationDuration = 1500;

    const timer = setTimeout(() => {
      if (redirectTo) {
        navigate(redirectTo, { replace: true }); // アニメーション終了後、指定されたパスへ遷移
      } else {
        // デフォルトの遷移先（例えばホームに戻るなど）
        navigate("/", { replace: true });
      }
    }, animationDuration);

    // コンポーネントがアンマウントされる際にタイマーをクリア
    return () => clearTimeout(timer);
  }, [navigate, location]);

  return (
    <div className="loading-animation-container">
      <div className="fire-animation"></div> {/* 炎のアニメーション要素 */}
      <p className="loading-text">Loading Masculine Energy...</p>{" "}
      {/* ローディングテキスト */}
    </div>
  );
};

export default LoadingAnimationPage;
