import React from 'react';
import './EmptyState.css';

function EmptyState({ title = 'Nothing here yet', message = '', actionLabel, onAction }) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__message">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
