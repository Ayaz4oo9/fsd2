import React, { useEffect, useRef } from 'react';
import { formatDateTime } from '../../utils/dateUtils';
import './PostModal.css';

function PostModal({ post, onClose, onEdit }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!post) return null;

  return (
    <div className="post-modal__overlay" onClick={onClose}>
      <div
        className="post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="post-modal__close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="post-modal-title">{post.title}</h2>
        <p className="post-modal__meta">
          {post.platform} · {post.status} · {formatDateTime(post.scheduledAt)}
        </p>
        <p>{post.content}</p>
        <div className="post-modal__actions">
          <button type="button" className="btn btn--primary" onClick={() => onEdit(post.id)}>
            Edit Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
