// src/components/MasculineLoadingModal.jsx
import React from "react";
import "./MasculineLoadingModal.css";

const MasculineLoadingModal = ({ isOpen }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="masculine-loading-modal-overlay">
      <div className="masculine-loading-modal-content">
        <div className="masculine-loading-spinner"></div>
        <p>予定を生成中だ、待て。</p>
      </div>
    </div>
  );
};

export default MasculineLoadingModal;
