import { createSelector } from '@reduxjs/toolkit';
import { getPostsForDate, getWeekPosts, isToday } from '../../utils/dateUtils';

/**
 * createSelector memoizes derived data: it only recomputes when its inputs
 * (posts) actually change reference. Components that read these selectors
 * avoid re-filtering/re-sorting on every render, which matters once the
 * dataset grows into the hundreds of posts.
 */

export const selectAllPosts = (state) => state.posts.posts;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;

export const selectScheduledPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'Scheduled')
);

export const selectDraftPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'Draft')
);

export const selectPublishedPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'Published')
);

export const selectFailedPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => p.status === 'Failed')
);

export const selectPostsByPlatform = (platform) =>
  createSelector(selectAllPosts, (posts) => posts.filter((p) => p.platform === platform));

export const selectPostsByDate = (date) =>
  createSelector(selectAllPosts, (posts) => getPostsForDate(posts, date));

export const selectPostById = (id) =>
  createSelector(selectAllPosts, (posts) => posts.find((p) => p.id === id));

export const selectTodayPosts = createSelector(selectAllPosts, (posts) =>
  posts.filter((p) => isToday(p.scheduledAt))
);

export const selectWeekPosts = createSelector(selectAllPosts, (posts) => getWeekPosts(posts));

export const selectUpcomingPosts = createSelector(selectAllPosts, (posts) =>
  posts
    .filter((p) => p.status === 'Scheduled' && new Date(p.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 5)
);

export const selectRecentPosts = createSelector(selectAllPosts, (posts) =>
  [...posts]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
);

export const selectPlatformDistribution = createSelector(selectAllPosts, (posts) => {
  const counts = {};
  posts.forEach((p) => {
    counts[p.platform] = (counts[p.platform] || 0) + 1;
  });
  return counts;
});

export const selectDashboardStats = createSelector(selectAllPosts, (posts) => ({
  total: posts.length,
  scheduled: posts.filter((p) => p.status === 'Scheduled').length,
  published: posts.filter((p) => p.status === 'Published').length,
  draft: posts.filter((p) => p.status === 'Draft').length,
  failed: posts.filter((p) => p.status === 'Failed').length,
}));
