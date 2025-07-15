// src/components/LoadingModal.jsx
import React from "react";
import "./LoadingModal.css";

const LoadingModal = ({ isOpen }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-spinner"></div>
        <p>予定を生成中です</p>
      </div>
    </div>
  );
};

export default LoadingModal;
