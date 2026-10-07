import React, { useCallback } from 'react';

import { formatTime } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/postUtils';

import { performanceMonitor } from '../../performance/performanceMonitor';

import './CalendarEvent.css';

function CalendarEvent({
  post,
  onClick,
  draggable = true,
  onDragStart,
}) {
  /*
   * Record an actual execution of this component function.
   *
   * The ID contains the post ID, so the monitor can distinguish
   * between different CalendarEvent instances.
   */
  performanceMonitor.recordRender(
    `CalendarEvent · ${post.id}`
  );

  const color =
    STATUS_COLORS[post.status] || '#64748b';

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(post.id);
    }
  }, [onClick, post.id]);

  const handleDragStart = useCallback(
    (event) => {
      if (onDragStart) {
        onDragStart(event, post.id);
      }
    },
    [onDragStart, post.id]
  );

  return (
    <button
      type="button"
      className="calendar-event"
      style={{
        borderLeftColor: color,
      }}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      aria-label={`${post.title}, ${post.platform}, ${post.status}`}
    >
      <span className="calendar-event__time">
        {formatTime(post.scheduledAt)}
      </span>

      <span className="calendar-event__title">
        {post.title}
      </span>

      <span className="calendar-event__platform">
        {post.platform}
      </span>
    </button>
  );
}

/*
 * OPTIMIZED VERSION
 *
 * React.memo prevents this component from rendering again
 * when its props have not changed.
 */
const MemoCalendarEvent = React.memo(
  CalendarEvent
);

/*
 * NON-OPTIMIZED VERSION
 *
 * Normal React component without memoization.
 */
const NonMemoCalendarEvent = CalendarEvent;

export {
  CalendarEvent,
  MemoCalendarEvent,
  NonMemoCalendarEvent,
};

export default MemoCalendarEvent;