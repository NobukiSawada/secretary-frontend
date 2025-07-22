// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom"; // BrowserRouter をインポート

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* App コンポーネントを BrowserRouter でラップする */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
