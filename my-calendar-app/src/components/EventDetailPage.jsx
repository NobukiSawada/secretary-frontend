// src/components/EventDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // ★変更: useSearchParamsを追加★
import "./EventDetailPage.css";

const EventDetailPage = () => {
  const { eventId } = useParams(); // URLからイベントIDを取得
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ★追加: クエリパラメータを取得★

  const [event, setEvent] = useState(null); // 選択されたイベントの情報を格納
  const [isEditing, setIsEditing] = useState(false); // 編集モードかどうか
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStart, setEditedStart] = useState("");
  const [editedEnd, setEditedEnd] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const [isNewEvent, setIsNewEvent] = useState(false); // ★追加: 新規イベントかどうかを判定★

  // --- ダミーイベントデータ (全てのイベントを保持) ---
  // 実際はバックエンドから取得します。IDはユニークな文字列を使用
  // 新規追加時にIDが重複しないように、より複雑なID生成が必要になるでしょう
  const [allDummyEvents, setAllDummyEvents] = useState([
    { id: "1", title: "チームミーティング", start: "10:00", end: "11:30", date: "2025-06-24", description: "週次報告と進捗確認" },
    { id: "2", title: "資料作成", start: "14:00", end: "16:00", date: "2025-06-24", description: "新規プロジェクトの提案資料" },
    { id: "3", title: "クライアント連絡", start: "17:00", end: "17:30", date: "2025-06-24", description: "A社への進捗報告" },
    { id: "4", title: "緊急A会議", start: "10:30", end: "12:00", date: "2025-06-24", description: "緊急の課題について議論" },
    { id: "5", title: "緊急B会議", start: "10:45", end: "11:45", date: "2025-06-24", description: "追加の課題について議論" },
    { id: "6", title: "夕食の準備", start: "18:00", end: "19:00", date: "2025-06-24", description: "献立はカレー" },
    { id: "7", title: "オンラインレッスン", start: "18:30", end: "20:00", date: "2025-06-24", description: "英語のオンラインレッスン" },
    { id: "8", title: "企画会議", start: "09:30", end: "12:00", date: "2025-06-25", description: "新企画のアイデア出し" },
    { id: "9", title: "ランチ", start: "12:00", end: "13:00", date: "2025-06-25", description: "同僚とランチ" },
  ]);

  useEffect(() => {
    // URLパラメータから新規イベントかどうかを判定
    const isNew = eventId === "new";
    setIsNewEvent(isNew);
    setIsEditing(isNew); // 新規イベントの場合は最初から編集モード

    if (isNew) {
      // 新規イベントの場合、URLのdateクエリパラメータから日付を取得
      const prefilledDate = searchParams.get('date') || '';
      // 新規イベントの初期値を設定 (日付はURLから、時刻とタイトルは空)
      setEvent({
        id: "temp-" + Date.now(), // 一時的なIDを生成（実際のIDはバックエンドが生成）
        title: "",
        start: "",
        end: "",
        date: prefilledDate,
        description: "",
      });
      setEditedTitle("");
      setEditedStart("");
      setEditedEnd("");
      setEditedDescription("");
    } else {
      // 既存イベントの場合、IDで検索
      const foundEvent = allDummyEvents.find((e) => e.id === eventId);
      setEvent(foundEvent);
      if (foundEvent) {
        setEditedTitle(foundEvent.title);
        setEditedStart(foundEvent.start);
        setEditedEnd(foundEvent.end);
        setEditedDescription(foundEvent.description || "");
      } else {
        // イベントが見つからない場合
        // navigate(-1); // 前のページに戻るなどの処理
      }
    }
  }, [eventId, searchParams, allDummyEvents]); // allDummyEvents を依存配列に追加

  // ★新規追加と更新を処理する関数 (今はダミー) ★
  const handleSave = (e) => {
    e.preventDefault();

    // --- 入力検証 (簡易版) ---
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
    // -------------------------

    const newOrUpdatedEvent = {
      ...event, // 既存イベントの場合は既存のプロパティを保持
      id: isNewEvent ? String(Date.now()) : event.id, // 新規の場合は新しいID、既存はそのまま
      title: editedTitle,
      start: editedStart,
      end: editedEnd,
      description: editedDescription,
      date: isNewEvent ? searchParams.get('date') : event.date, // 新規の場合はURLから取得した日付
    };

    if (isNewEvent) {
      // 新規イベントの追加 (ダミー)
      // ここでバックエンドにPOSTリクエストを送信します
      console.log("新規イベントを追加:", newOrUpdatedEvent);
      setAllDummyEvents((prevEvents) => [...prevEvents, newOrUpdatedEvent]); // ダミーデータを更新
      alert("新しいイベントを追加しました (ダミー)！");
      navigate(`/day/${newOrUpdatedEvent.date}`); // DayPageに戻る
    } else {
      // 既存イベントの更新 (ダミー)
      // ここでバックエンドにPUT/PATCHリクエストを送信します
      console.log("イベントを更新:", newOrUpdatedEvent);
      setAllDummyEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === newOrUpdatedEvent.id ? newOrUpdatedEvent : e))
      ); // ダミーデータを更新
      alert("イベントを更新しました (ダミー)！");
      setEvent(newOrUpdatedEvent); // 現在のイベントStateも更新
      setIsEditing(false); // 表示モードに戻る
    }
  };

  // ★追加: イベントの削除を処理する関数 (今はダミー) ★
  const handleDelete = () => {
    if (!window.confirm("この予定を本当に削除しますか？")) {
      return;
    }
    // ここでバックエンドにDELETEリクエストを送信します
    console.log("イベントを削除:", event.id);
    setAllDummyEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id)); // ダミーデータを更新
    alert("イベントを削除しました (ダミー)！");
    // 削除後、日表示ページに戻る
    navigate(`/day/${event.date}`);
  };


  if (!event && !isNewEvent) { // 既存イベントが見つからず、新規でもない場合
    return <div className="event-detail-container">イベントが見つかりません。</div>;
  }

  // 新規作成時と編集時のタイトルを動的に変更
  const pageTitle = isNewEvent ? `新しい予定 (${event?.date || ''})` : "予定詳細";


  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button onClick={() => navigate(-1)}>&lt; {isNewEvent ? '日表示' : '日表示'}に戻る</button> {/* 新規作成時も戻るボタンは有効 */}
        <h2>{pageTitle}</h2>
        {/* 新規イベント作成時は「編集」ボタンを表示しない */}
        {!isNewEvent && (
          <button onClick={() => setIsEditing(!isEditing)} className="edit-toggle-button">
            {isEditing ? "表示モード" : "編集"}
          </button>
        )}
      </div>

      {isEditing ? (
        // 編集・新規作成フォーム
        <form onSubmit={handleSave} className="event-edit-form"> {/* handleUpdateからhandleSaveに変更 */}
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
            <label htmlFor="description">説明:</label>
            <textarea
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="save-button">
            {isNewEvent ? "予定を作成" : "保存"} {/* ボタンのテキストを動的に変更 */}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="cancel-button"> {/* キャンセルボタンは日表示に戻るように */}
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
            <strong>説明:</strong> {event.description || "説明はありません。"}
          </p>
          <button onClick={handleDelete} className="delete-button">削除</button> {/* ★追加: 削除ボタン★ */}
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;