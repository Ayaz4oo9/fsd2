import {
  format,
  isToday as dfIsToday,
  isAfter,
  isBefore,
  addDays,
  startOfWeek,
  endOfWeek,
  parseISO,
  isValid,
} from 'date-fns';

/**
 * All date logic lives here so components never manipulate date strings
 * directly. This keeps formatting consistent and makes the logic unit
 * testable in isolation from React.
 */

export function toDate(value) {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  const d = toDate(value);
  return d ? format(d, pattern) : '';
}

export function formatTime(value, pattern = 'h:mm a') {
  const d = toDate(value);
  return d ? format(d, pattern) : '';
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? format(d, 'MMM d, yyyy · h:mm a') : '';
}

export function isToday(value) {
  const d = toDate(value);
  return d ? dfIsToday(d) : false;
}

export function isUpcoming(value) {
  const d = toDate(value);
  if (!d) return false;
  return isAfter(d, new Date());
}

export function isPast(value) {
  const d = toDate(value);
  if (!d) return false;
  return isBefore(d, new Date());
}

/** Returns the array of posts whose scheduledAt falls on the given day. */
export function getPostsForDate(posts, date) {
  const target = format(date, 'yyyy-MM-dd');
  return posts.filter((p) => {
    const d = toDate(p.scheduledAt);
    return d && format(d, 'yyyy-MM-dd') === target;
  });
}

/** Returns posts scheduled within the current Sun-Sat week. */
export function getWeekPosts(posts, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate);
  const end = endOfWeek(referenceDate);
  return posts.filter((p) => {
    const d = toDate(p.scheduledAt);
    return d && !isBefore(d, start) && !isAfter(d, end);
  });
}

/** Builds a 6x7 grid of dates covering the given month for a calendar view. */
export function getMonthGrid(monthDate) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  const days = [];
  let cursor = gridStart;
  for (let i = 0; i < 42; i += 1) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = timeStr || '00:00';
  return new Date(`${dateStr}T${time}:00`).toISOString();
}

export function splitDateAndTime(isoString) {
  const d = toDate(isoString);
  if (!d) return { date: '', time: '' };
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm'),
  };
}
