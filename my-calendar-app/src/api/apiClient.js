// src/api/apiClient.js
import axios from "axios";

// .env ファイルから API ベース URL を取得
// `import.meta.env` は Vite が提供する環境変数へのアクセス方法
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 必要であれば認証トークンなどをここで設定
  // withCredentials: true, // Cookie を含める場合
});

export default apiClient;
