// src/components/GentleLoadingModal.jsx
import React from "react";
import "./GentleLoadingModal.css";

const GentleLoadingModal = ({ isOpen }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="gentle-loading-modal-overlay">
      <div className="gentle-loading-modal-content">
        <div className="gentle-loading-spinner"></div>
        <p>予定を生成中です。少々お待ちください。</p>
      </div>
    </div>
  );
};

export default GentleLoadingModal;
