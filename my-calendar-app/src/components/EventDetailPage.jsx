// src/components/EventDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./EventDetailPage.css";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStart, setEditedStart] = useState("");
  const [editedEnd, setEditedEnd] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedLocation, setEditedLocation] = useState(""); // ★追加: 場所のステート ★

  const [isNewEvent, setIsNewEvent] = useState(false);

  const [allDummyEvents, setAllDummyEvents] = useState([
    {
      id: "1",
      title: "チームミーティング",
      start: "10:00",
      end: "11:30",
      date: "2025-06-24",
      description: "週次報告と進捗確認",
      location: "オンライン",
    }, // ★変更: location追加 ★
    {
      id: "2",
      title: "資料作成",
      start: "14:00",
      end: "16:00",
      date: "2025-06-24",
      description: "新規プロジェクトの提案資料",
      location: "オフィス",
    }, // ★変更: location追加 ★
    {
      id: "3",
      title: "クライアント連絡",
      start: "17:00",
      end: "17:30",
      date: "2025-06-24",
      description: "A社への進捗報告",
      location: "本社",
    }, // ★変更: location追加 ★
    {
      id: "4",
      title: "緊急A会議",
      start: "10:30",
      end: "12:00",
      date: "2025-06-24",
      description: "緊急の課題について議論",
      location: "会議室A",
    }, // ★変更: location追加 ★
    {
      id: "5",
      title: "緊急B会議",
      start: "10:45",
      end: "11:45",
      date: "2025-06-24",
      description: "追加の課題について議論",
      location: "会議室B",
    }, // ★変更: location追加 ★
    {
      id: "6",
      title: "夕食の準備",
      start: "18:00",
      end: "19:00",
      date: "2025-06-24",
      description: "献立はカレー",
      location: "自宅",
    }, // ★変更: location追加 ★
    {
      id: "7",
      title: "オンラインレッスン",
      start: "18:30",
      end: "20:00",
      date: "2025-06-24",
      description: "英語のオンラインレッスン",
      location: "オンライン",
    }, // ★変更: location追加 ★
    {
      id: "8",
      title: "企画会議",
      start: "09:30",
      end: "12:00",
      date: "2025-06-25",
      description: "新企画のアイデア出し",
      location: "会議室C",
    }, // ★変更: location追加 ★
    {
      id: "9",
      title: "ランチ",
      start: "12:00",
      end: "13:00",
      date: "2025-06-25",
      description: "同僚とランチ",
      location: "社食",
    }, // ★変更: location追加 ★
  ]);

  useEffect(() => {
    const isNew = eventId === "new";
    setIsNewEvent(isNew);
    setIsEditing(isNew);

    if (isNew) {
      const prefilledDate = searchParams.get("date") || "";
      setEvent({
        id: "temp-" + Date.now(),
        title: "",
        start: "",
        end: "",
        date: prefilledDate,
        description: "",
        location: "", // ★追加: 新規イベントの初期値にlocationを設定 ★
      });
      setEditedTitle("");
      setEditedStart("");
      setEditedEnd("");
      setEditedDescription("");
      setEditedLocation(""); // ★追加: editedLocationも初期化 ★
    } else {
      const foundEvent = allDummyEvents.find((e) => e.id === eventId);
      setEvent(foundEvent);
      if (foundEvent) {
        setEditedTitle(foundEvent.title);
        setEditedStart(foundEvent.start);
        setEditedEnd(foundEvent.end);
        setEditedDescription(foundEvent.description || "");
        setEditedLocation(foundEvent.location || ""); // ★追加: 既存イベントのlocationをセット ★
      } else {
        // イベントが見つからない場合
        // navigate(-1);
      }
    }
  }, [eventId, searchParams, allDummyEvents]);

  const handleSave = (e) => {
    e.preventDefault();

    if (!editedTitle || !editedStart || !editedEnd) {
      alert("タイトルと開始/終了時刻は必須です。");
      return;
    }

    const startMin =
      parseInt(editedStart.split(":")[0]) * 60 +
      parseInt(editedStart.split(":")[1]);
    const endMin =
      parseInt(editedEnd.split(":")[0]) * 60 +
      parseInt(editedEnd.split(":")[1]);

    if (startMin >= endMin) {
      alert("終了時刻は開始時刻より後に設定してください。");
      return;
    }

    const newOrUpdatedEvent = {
      ...event,
      id: isNewEvent ? String(Date.now()) : event.id,
      title: editedTitle,
      start: editedStart,
      end: editedEnd,
      description: editedDescription,
      location: editedLocation, // ★変更: locationを追加 ★
      date: isNewEvent ? searchParams.get("date") : event.date,
    };

    if (isNewEvent) {
      console.log("新規イベントを追加:", newOrUpdatedEvent);
      setAllDummyEvents((prevEvents) => [...prevEvents, newOrUpdatedEvent]);
      alert("新しいイベントを追加しました (ダミー)！");
      navigate(`/day/${newOrUpdatedEvent.date}`);
    } else {
      console.log("イベントを更新:", newOrUpdatedEvent);
      setAllDummyEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === newOrUpdatedEvent.id ? newOrUpdatedEvent : e
        )
      );
      alert("イベントを更新しました (ダミー)！");
      setEvent(newOrUpdatedEvent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm("この予定を本当に削除しますか？")) {
      return;
    }
    console.log("イベントを削除:", event.id);
    setAllDummyEvents((prevEvents) =>
      prevEvents.filter((e) => e.id !== event.id)
    );
    alert("イベントを削除しました (ダミー)！");
    navigate(`/day/${event.date}`);
  };

  if (!event && !isNewEvent) {
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
        <button onClick={() => navigate(-1)}>
          &lt; {isNewEvent ? "日表示" : "日表示"}に戻る
        </button>
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
          {/* ★追加: 場所の入力フィールド ★ */}
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
        <div className="event-display-details">
          <h3>{event.title}</h3>
          <p>
            <strong>日付:</strong> {event.date}
          </p>
          <p>
            <strong>時間:</strong> {event.start} - {event.end}
          </p>
          {/* ★追加: 場所の表示 ★ */}
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
