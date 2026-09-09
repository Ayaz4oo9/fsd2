import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

import {
  CalendarEvent,
  MemoCalendarEvent,
} from '../CalendarEvent/CalendarEvent';

import {
  getMonthGrid,
  getPostsForDate,
} from '../../utils/dateUtils';

import {
  performanceMonitor,
} from '../../performance/performanceMonitor';

import './Calendar.css';

function Calendar({
  posts = [],
  onEventClick,
  onDateClick,
  onEventDrop,
  optimized = true,
}) {
  const [view, setView] = useState('month');

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [dragOverDate, setDragOverDate] =
    useState(null);

  /*
   * Count Calendar render executions.
   *
   * This represents the Calendar component itself.
   */
  performanceMonitor.recordRender(
    'Calendar'
  );

  /*
   * Move to previous period.
   */
  const goPrevious = useCallback(() => {
    setCurrentDate((date) => {
      if (view === 'month') {
        return subMonths(date, 1);
      }

      if (view === 'week') {
        return subWeeks(date, 1);
      }

      return subDays(date, 1);
    });
  }, [view]);

  /*
   * Move to next period.
   */
  const goNext = useCallback(() => {
    setCurrentDate((date) => {
      if (view === 'month') {
        return addMonths(date, 1);
      }

      if (view === 'week') {
        return addWeeks(date, 1);
      }

      return addDays(date, 1);
    });
  }, [view]);

  /*
   * Jump to today.
   */
  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /*
   * Generate visible calendar days.
   *
   * useMemo prevents unnecessary recalculation when unrelated
   * state changes.
   */
  const days = useMemo(() => {
    if (view === 'month') {
      return getMonthGrid(currentDate);
    }

    if (view === 'week') {
      const weekStart = startOfWeek(
        currentDate,
        {
          weekStartsOn: 1,
        }
      );

      return Array.from(
        { length: 7 },
        (_, index) =>
          addDays(weekStart, index)
      );
    }

    return [currentDate];
  }, [currentDate, view]);

  /*
   * Drag start.
   */
  const handleDragStart = useCallback(
    (event, postId) => {
      event.dataTransfer.setData(
        'text/plain',
        String(postId)
      );

      event.dataTransfer.effectAllowed =
        'move';
    },
    []
  );

  /*
   * Drag over a calendar day.
   */
  const handleDragOver = useCallback(
    (event, date) => {
      event.preventDefault();

      event.dataTransfer.dropEffect =
        'move';

      setDragOverDate(date);
    },
    []
  );

  /*
   * Drag leaves a calendar day.
   */
  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  /*
   * Drop event.
   *
   * IMPORTANT:
   *
   * CalendarPage starts the actual measurement immediately
   * before dispatching the Redux movePost action.
   */
  const handleDrop = useCallback(
    (event, date) => {
      event.preventDefault();

      setDragOverDate(null);

      const postId =
        event.dataTransfer.getData(
          'text/plain'
        );

      if (!postId) {
        return;
      }

      if (onEventDrop) {
        onEventDrop(
          postId,
          date
        );
      }
    },
    [onEventDrop]
  );

  /*
   * Calendar date click.
   */
  const handleDateClick = useCallback(
    (date) => {
      if (onDateClick) {
        onDateClick(date);
      }
    },
    [onDateClick]
  );

  /*
   * Choose which CalendarEvent implementation to use.
   */
  const EventComponent = optimized
    ? MemoCalendarEvent
    : CalendarEvent;

  return (
    <div className="calendar">

      {/* ================================
          TOOLBAR
      ================================= */}

      <div className="calendar__toolbar">

        <div className="calendar__navigation">

          <button
            type="button"
            className="calendar__nav-button"
            onClick={goPrevious}
            aria-label="Previous"
          >
            ←
          </button>

          <button
            type="button"
            className="calendar__today-button"
            onClick={goToday}
          >
            Today
          </button>

          <button
            type="button"
            className="calendar__nav-button"
            onClick={goNext}
            aria-label="Next"
          >
            →
          </button>

        </div>

        <h2 className="calendar__title">
          {format(
            currentDate,
            'MMMM yyyy'
          )}
        </h2>

        <div className="calendar__view-switch">

          <button
            type="button"
            className={
              view === 'month'
                ? 'active'
                : ''
            }
            onClick={() =>
              setView('month')
            }
          >
            Month
          </button>

          <button
            type="button"
            className={
              view === 'week'
                ? 'active'
                : ''
            }
            onClick={() =>
              setView('week')
            }
          >
            Week
          </button>

          <button
            type="button"
            className={
              view === 'day'
                ? 'active'
                : ''
            }
            onClick={() =>
              setView('day')
            }
          >
            Day
          </button>

        </div>

      </div>

      {/* ================================
          PERFORMANCE MODE
      ================================= */}

      <div className="calendar__performance">

        <span>
          Rendering:
        </span>

        <strong>
          {optimized
            ? 'Optimized'
            : 'Non-optimized'}
        </strong>

      </div>

      {/* ================================
          WEEKDAYS
      ================================= */}

      {view !== 'day' && (
        <div className="calendar__weekdays">

          {[
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun',
          ].map((day) => (
            <div
              key={day}
              className="calendar__weekday"
            >
              {day}
            </div>
          ))}

        </div>
      )}

      {/* ================================
          CALENDAR GRID
      ================================= */}

      <div
        className={`calendar__grid calendar__grid--${view}`}
      >

        {days.map((day) => {

          const dayPosts =
            getPostsForDate(
              posts,
              day
            );

          const dateKey =
            format(
              day,
              'yyyy-MM-dd'
            );

          const isDragOver =
            dragOverDate &&
            format(
              dragOverDate,
              'yyyy-MM-dd'
            ) === dateKey;

          return (
            <div
              key={dateKey}
              className={`
                calendar__day
                ${isDragOver
                  ? 'calendar__day--drag-over'
                  : ''}
              `}
              onDragOver={(event) =>
                handleDragOver(
                  event,
                  day
                )
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={(event) =>
                handleDrop(
                  event,
                  day
                )
              }
              onClick={() =>
                handleDateClick(day)
              }
            >

              <div className="calendar__day-header">

                <span className="calendar__day-number">
                  {format(
                    day,
                    'd'
                  )}
                </span>

              </div>

              <div className="calendar__events">

                {dayPosts.map(
                  (post) => (
                    <EventComponent
                      key={post.id}
                      post={post}
                      onClick={
                        onEventClick
                      }
                      draggable={true}
                      onDragStart={
                        handleDragStart
                      }
                    />
                  )
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Calendar;