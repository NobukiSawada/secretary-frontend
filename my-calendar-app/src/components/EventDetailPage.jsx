// src/components/EventDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./EventDetailPage.css";
import apiClient from "../api/apiClient"; // APIクライアントをインポート

const EventDetailPage = () => {
  const { eventId } = useParams(); // URLからイベントIDを取得
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // クエリパラメータを取得

  const [event, setEvent] = useState(null); // 選択されたイベントの情報を格納
  const [isEditing, setIsEditing] = useState(false); // 編集モードかどうか
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStart, setEditedStart] = useState("");
  const [editedEnd, setEditedEnd] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedLocation, setEditedLocation] = useState("");

  const [isNewEvent, setIsNewEvent] = useState(false); // 新規イベントかどうかを判定

  // イベントIDが変更されたときにイベントデータを取得
  useEffect(() => {
    const fetchEvent = async () => {
      const isNew = eventId === "new";
      setIsNewEvent(isNew);
      setIsEditing(isNew); // 新規イベントの場合は最初から編集モード

      if (isNew) {
        const prefilledDate = searchParams.get('date') || '';
        setEvent({
          id: "temp-" + Date.now(), title: "", start: "", end: "", date: prefilledDate, description: "", location: "",
        });
        setEditedTitle(""); setEditedStart(""); setEditedEnd(""); setEditedDescription(""); setEditedLocation("");
      } else {
        // 既存イベントの場合、IDで検索し、バックエンドから取得
        try {
          const response = await apiClient.get(`/events/${eventId}`); // GET /events/{event_id}
          const fetchedEvent = response.data;
          const d = new Date(fetchedEvent.start_time);
          const localDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          setEvent({
            ...fetchedEvent,
            id: String(fetchedEvent.id),
            start: new Date(fetchedEvent.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
            end: new Date(fetchedEvent.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
            date: localDateString, // 修正後の日付
          });
          setEditedTitle(fetchedEvent.title);
          setEditedStart(new Date(fetchedEvent.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }));
          setEditedEnd(new Date(fetchedEvent.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }));
          setEditedDescription(fetchedEvent.description || "");
          setEditedLocation(fetchedEvent.location || "");
        } catch (error) {
          console.error("イベントの読み込みに失敗しました:", error.response?.data || error.message);
          alert(`イベントの読み込みに失敗しました: ${error.response?.data?.detail || error.message}`);
          setEvent(null); // イベントが見つからない場合やエラー時
        }
      }
    };
    fetchEvent();
  }, [eventId, searchParams, navigate]);

  // 新規追加と更新を処理する関数
  const handleSave = async (e) => {
    e.preventDefault();

    // --- 入力検証 ---
    if (!editedTitle || !editedStart || !editedEnd) {
      alert("タイトルと開始/終了時刻は必須です。");
      return;
    }

    const startMin = parseInt(editedStart.split(":")[0]) * 60 + parseInt(editedStart.split(":")[1]);
    const endMin = parseInt(editedEnd.split(":")[0]) * 60 + parseInt(editedEnd.split(":")[1]);

    if (startMin >= endMin) {
      alert("終了時刻は開始時刻より後に設定してください。");
      return;
    }

    // 日付と時刻を結合して ISO 8601 形式の文字列を生成
    const eventDate = isNewEvent ? searchParams.get('date') : event.date; // 新規作成時は URL から日付を取得
    const startDateTime = `${eventDate}T${editedStart}:00Z`; // UTCとして送信
    const endDateTime = `${eventDate}T${editedEnd}:00Z`;     // UTCとして送信

    const eventData = {
      title: editedTitle,
      start_time: startDateTime,
      end_time: endDateTime,
      location: editedLocation || null, // null を送信 (FastAPIのOptionalに合わせる)
      description: editedDescription || null,
    };

    try {
      if (isNewEvent) {
        const response = await apiClient.post('/events/', eventData); // POST /events/
        console.log("新規イベントを追加:", response.data);
        alert("新しいイベントを追加しました！");
        navigate(`/day/${eventDate}`); // DayPageに戻る
      } else {
        const response = await apiClient.put(`/events/${event.id}`, eventData); // PUT /events/{event_id}
        console.log("イベントを更新:", response.data);
        alert("イベントを更新しました！");
        setEvent({
          ...event, // 更新されたデータで event state を更新
          title: response.data.title,
          start: new Date(response.data.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
          end: new Date(response.data.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false }),
          description: response.data.description,
          location: response.data.location,
        });
        setIsEditing(false); // 表示モードに戻る
      }
    } catch (error) {
      console.error("APIリクエストに失敗しました:", error.response?.data || error.message);
      alert(`保存に失敗しました: ${error.response?.data?.detail || error.message}`);
    }
  };

  // イベントの削除を処理する関数
  const handleDelete = async () => {
    if (!window.confirm("この予定を本当に削除しますか？")) {
      return;
    }
    try {
      await apiClient.delete(`/events/${event.id}`); // DELETE /events/{event_id}
      console.log("イベントを削除:", event.id);
      alert("イベントを削除しました！");

      // ★変更: navigate に { replace: true } を追加 ★
      // これにより、現在のURLを置き換え、履歴スタックに新しいエントリを追加しません。
      // 削除後のページ遷移で履歴をクリーンに保つ効果があります。
      navigate(`/day/${event.date}`, { replace: true });

    } catch (error) {
      console.error("イベントの削除に失敗しました:", error.response?.data || error.message);
      alert(`削除に失敗しました: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (!event && !isNewEvent) { // 既存イベントが見つからず、新規でもない場合
    return (
      <div className="event-detail-container">イベントが見つかりません。</div>
    );
  }

  const pageTitle = isNewEvent
    ? `新しい予定 (${event?.date || ""})`
    : "予定詳細";

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button onClick={() => navigate(-1)}>&lt; {isNewEvent ? '日表示' : '日表示'}に戻る</button>
        <h2>{pageTitle}</h2>
        {!isNewEvent && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="edit-toggle-button"
          >
            {isEditing ? "表示モード" : "編集"}
          </button>
        )}
      </div>

      {isEditing ? (
        // 編集・新規作成フォーム
        <form onSubmit={handleSave} className="event-edit-form">
          <div className="form-group">
            <label htmlFor="title">タイトル:</label>
            <input
              type="text"
              id="title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="start-time">開始時刻:</label>
            <input
              type="time"
              id="start-time"
              value={editedStart}
              onChange={(e) => setEditedStart(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-time">終了時刻:</label>
            <input
              type="time"
              id="end-time"
              value={editedEnd}
              onChange={(e) => setEditedEnd(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">場所:</label>
            <input
              type="text"
              id="location"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">説明:</label>
            <textarea
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="save-button">
            {isNewEvent ? "予定を作成" : "保存"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-button"
          >
            キャンセル
          </button>
        </form>
      ) : (
        // 表示モードのUI
        <div className="event-display-details">
          <h3>{event.title}</h3>
          <p>
            <strong>日付:</strong> {event.date}
          </p>
          <p>
            <strong>時間:</strong> {event.start} - {event.end}
          </p>
          <p>
            <strong>場所:</strong> {event.location || "場所の指定なし"}
          </p>
          <p>
            <strong>説明:</strong> {event.description || "説明はありません。"}
          </p>
          <button onClick={handleDelete} className="delete-button">
            削除
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;