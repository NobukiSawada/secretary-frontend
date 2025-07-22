// src/components/SuggestionModal.jsx
import React from "react";
import "./SuggestionModal.css";

const SuggestionModal = ({
  isOpen,
  onClose,
  suggestions,
  onSelectPlan,
  mode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className={`modal-content ${mode === "masculine" ? "masculine-mode" : ""}`}
      >
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>AIからの行動プラン提案</h2>
        {suggestions.length === 0 ? (
          <p>提案がありません。</p>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((plan, index) => (
              <div key={index} className="suggestion-card">
                <h3>{plan.pattern_description}</h3>
                <div className="plan-events">
                  {plan.events.map((event, eventIndex) => (
                    <div key={eventIndex} className="plan-event-item">
                      <strong>{event.title}</strong>
                      <p>
                        {event.start_time.substring(11, 16)} - {event.end_time.substring(11, 16)}
                      </p>
                      {event.location && <p>場所: {event.location}</p>}
                      {event.description && <p>{event.description}</p>}
                    </div>
                  ))}
                </div>
                <button
                  className="select-plan-button"
                  onClick={() => onSelectPlan(plan.events)}
                >
                  このプランを追加
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;
