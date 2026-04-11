import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal animate-scale-up">
        <div className="confirm-scanner" />
        
        <div className="confirm-header">
          <div className="alert-icon-wrap">
            <AlertCircle className="alert-icon" />
          </div>
          <h3>{title}</h3>
        </div>

        <div className="confirm-body">
          <p>{message}</p>
        </div>

        <div className="confirm-footer">
          <button className="confirm-btn cancel" onClick={onCancel}>
            <X size={16} /> NEGATIVO
          </button>
          <button className="confirm-btn success" onClick={onConfirm}>
            <Check size={16} /> CONFIRMAR
          </button>
        </div>

        <div className="confirm-brackets">
          <div className="b-corner tl" />
          <div className="b-corner tr" />
          <div className="b-corner bl" />
          <div className="b-corner br" />
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
