import React, { useRef } from 'react';
import { formatDateTime } from '../../utils/dateUtils';
import { PLATFORM_COLORS, STATUS_COLORS } from '../../utils/postUtils';
import './PostCard.css';

/**
 * PostCard renders once per post in lists that can contain hundreds of
 * items (PostsPage, Dashboard "recent/upcoming" lists). Without React.memo,
 * every post card would re-render whenever ANY post in the list changes
 * (e.g. editing one post causes the whole posts array to change reference),
 * because the parent list component re-renders and passes new post objects.
 *
 * React.memo does a shallow prop comparison and skips re-rendering a card
 * whose own `post` object and callback props haven't changed. This only
 * works because PostsPage/Dashboard wrap their onEdit/onDelete/onDuplicate
 * handlers in useCallback — otherwise a new function reference would be
 * created every render, defeating the memoization.
 *
 * The renderCount ref + console.log below is a dev-only aid so a student
 * can open devtools and see how few PostCards actually re-render when
 * a single post is duplicated or deleted elsewhere in the list.
 */
function PostCard({ post, onEdit, onDelete, onDuplicate, onPublish }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`PostCard[${post.id}] render #${renderCount.current}`);
  }

  const platformColor = PLATFORM_COLORS[post.platform] || '#64748b';
  const statusColor = STATUS_COLORS[post.status] || '#64748b';

  return (
    <article className="post-card" aria-label={`${post.title} post card`}>
      <header className="post-card__header">
        <span
          className="post-card__platform"
          style={{ backgroundColor: platformColor }}
        >
          {post.platform}
        </span>
        {/* Status is shown as both color AND text so it never relies on color alone. */}
        <span
          className={`post-card__status post-card__status--${post.status}`}
          style={{ color: statusColor }}
        >
          ● {post.status}
        </span>
      </header>

      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__content">{post.content}</p>

      <p className="post-card__meta">
        {formatDateTime(post.scheduledAt)} · {post.category}
      </p>

      {post.tags?.length > 0 && (
        <ul className="post-card__tags" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      )}

      <div className="post-card__actions">
        <button type="button" onClick={() => onEdit(post.id)}>
          Edit
        </button>
        <button type="button" onClick={() => onDuplicate(post.id)}>
          Duplicate
        </button>
        {post.status === 'Scheduled' && (
          <button
            type="button"
            className="post-card__publish"
            onClick={() => onPublish(post.id)}
          >
            Publish
          </button>
        )}
        <button
          type="button"
          className="post-card__delete"
          onClick={() => onDelete(post.id)}
          aria-label={`Delete ${post.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

// Custom comparator: only re-render if this specific post object or the
// handler references changed. Default shallow comparison would already
// do this since all props here are primitives/objects compared by
// reference, but being explicit makes the intent clear to a student.
function areEqual(prevProps, nextProps) {
  return (
    prevProps.post === nextProps.post &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onDuplicate === nextProps.onDuplicate &&
    prevProps.onPublish === nextProps.onPublish
  );
}

export default React.memo(PostCard, areEqual);
