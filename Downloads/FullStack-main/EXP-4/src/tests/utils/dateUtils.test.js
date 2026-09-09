import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  isToday,
  isUpcoming,
  getPostsForDate,
  getWeekPosts,
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  it('formatDate formats an ISO string into a readable date', () => {
    expect(formatDate('2026-09-10T10:30:00')).toBe('Sep 10, 2026');
  });

  it('formatTime formats an ISO string into a readable time', () => {
    expect(formatTime('2026-09-10T10:30:00')).toBe('10:30 AM');
  });

  it('isToday returns true for the current date', () => {
    const now = new Date().toISOString();
    expect(isToday(now)).toBe(true);
  });

  it('isToday returns false for a date far in the past', () => {
    expect(isToday('2020-01-01T00:00:00')).toBe(false);
  });

  it('isUpcoming returns true for a future date', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isUpcoming(future)).toBe(true);
  });

  it('isUpcoming returns false for a past date', () => {
    expect(isUpcoming('2020-01-01T00:00:00')).toBe(false);
  });

  it('getPostsForDate only returns posts scheduled on the given day', () => {
    const target = new Date(2026, 8, 10);
    const posts = [
      { id: '1', scheduledAt: '2026-09-10T09:00:00' },
      { id: '2', scheduledAt: '2026-09-11T09:00:00' },
    ];
    const result = getPostsForDate(posts, target);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('getWeekPosts returns posts within the current week', () => {
    const now = new Date();
    const posts = [{ id: '1', scheduledAt: now.toISOString() }];
    const result = getWeekPosts(posts, now);
    expect(result).toHaveLength(1);
  });
});
