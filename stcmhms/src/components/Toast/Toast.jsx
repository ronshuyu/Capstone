import React, { useEffect } from 'react';
import './Toast.css';

export const Toast = ({ id, message, type = 'default', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && (
          <span className="toast-icon">✓</span>
        )}
        {type === 'error' && (
          <span className="toast-icon">✕</span>
        )}
        {type === 'info' && (
          <span className="toast-icon">ℹ</span>
        )}
        {type === 'warning' && (
          <span className="toast-icon">⚠</span>
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
