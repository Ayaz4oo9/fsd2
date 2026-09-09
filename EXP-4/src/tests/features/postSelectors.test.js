import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  selectScheduledPosts,
  selectDraftPosts,
  selectPublishedPosts,
  selectFailedPosts,
  selectPostsByPlatform,
  selectPostById,
  selectUpcomingPosts,
  selectRecentPosts,
  selectPlatformDistribution,
  selectDashboardStats,
} from '../../features/posts/postSelectors';

function makePost(overrides = {}) {
  return {
    id: 'post-1',
    title: 'Post',
    content: 'Content',
    platform: 'Instagram',
    status: 'Draft',
    category: 'Marketing',
    tags: [],
    scheduledAt: '2026-09-10T09:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

function stateWith(posts) {
  return { posts: { posts, loading: false, error: null } };
}

describe('postSelectors: status filters', () => {
  const posts = [
    makePost({ id: '1', status: 'Scheduled' }),
    makePost({ id: '2', status: 'Draft' }),
    makePost({ id: '3', status: 'Published' }),
    makePost({ id: '4', status: 'Failed' }),
    makePost({ id: '5', status: 'Scheduled' }),
  ];
  const state = stateWith(posts);

  it('selectScheduledPosts returns only Scheduled posts', () => {
    expect(selectScheduledPosts(state).map((p) => p.id)).toEqual(['1', '5']);
  });

  it('selectDraftPosts returns only Draft posts', () => {
    expect(selectDraftPosts(state).map((p) => p.id)).toEqual(['2']);
  });

  it('selectPublishedPosts returns only Published posts', () => {
    expect(selectPublishedPosts(state).map((p) => p.id)).toEqual(['3']);
  });

  it('selectFailedPosts returns only Failed posts', () => {
    expect(selectFailedPosts(state).map((p) => p.id)).toEqual(['4']);
  });
});

describe('postSelectors: memoization', () => {
  it('returns the same array reference when the posts slice has not changed', () => {
    const state = stateWith([makePost({ id: '1', status: 'Scheduled' })]);
    const first = selectScheduledPosts(state);
    const second = selectScheduledPosts(state);
    expect(first).toBe(second);
  });

  it('recomputes when the underlying posts array reference changes', () => {
    const stateA = stateWith([makePost({ id: '1', status: 'Scheduled' })]);
    const stateB = stateWith([
      makePost({ id: '1', status: 'Scheduled' }),
      makePost({ id: '2', status: 'Scheduled' }),
    ]);
    const first = selectScheduledPosts(stateA);
    const second = selectScheduledPosts(stateB);
    expect(first).not.toBe(second);
    expect(second).toHaveLength(2);
  });
});

describe('postSelectors: parameterized selectors', () => {
  it('selectPostsByPlatform filters by the given platform', () => {
    const posts = [
      makePost({ id: '1', platform: 'Instagram' }),
      makePost({ id: '2', platform: 'LinkedIn' }),
    ];
    const state = stateWith(posts);
    const result = selectPostsByPlatform('LinkedIn')(state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('selectPostById returns the matching post or undefined', () => {
    const posts = [makePost({ id: 'abc' })];
    const state = stateWith(posts);
    expect(selectPostById('abc')(state).id).toBe('abc');
    expect(selectPostById('does-not-exist')(state)).toBeUndefined();
  });
});

describe('postSelectors: derived/time-based selectors', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('selectUpcomingPosts returns only future Scheduled posts, soonest first, capped at 5', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T00:00:00.000Z'));

    const posts = [
      makePost({ id: 'past', status: 'Scheduled', scheduledAt: '2026-09-01T00:00:00.000Z' }),
      makePost({ id: 'far-future', status: 'Scheduled', scheduledAt: '2026-09-20T00:00:00.000Z' }),
      makePost({ id: 'near-future', status: 'Scheduled', scheduledAt: '2026-09-11T00:00:00.000Z' }),
      makePost({ id: 'draft-future', status: 'Draft', scheduledAt: '2026-09-12T00:00:00.000Z' }),
    ];
    const result = selectUpcomingPosts(stateWith(posts));

    expect(result.map((p) => p.id)).toEqual(['near-future', 'far-future']);
  });

  it('selectRecentPosts sorts by updatedAt descending and caps at 5', () => {
    const posts = [
      makePost({ id: 'oldest', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'newest', updatedAt: '2026-06-01T00:00:00.000Z' }),
      makePost({ id: 'middle', updatedAt: '2026-03-01T00:00:00.000Z' }),
    ];
    const result = selectRecentPosts(stateWith(posts));
    expect(result.map((p) => p.id)).toEqual(['newest', 'middle', 'oldest']);
  });
});

describe('postSelectors: aggregate stats', () => {
  const posts = [
    makePost({ id: '1', platform: 'Instagram', status: 'Scheduled' }),
    makePost({ id: '2', platform: 'Instagram', status: 'Published' }),
    makePost({ id: '3', platform: 'LinkedIn', status: 'Draft' }),
    makePost({ id: '4', platform: 'LinkedIn', status: 'Failed' }),
  ];
  const state = stateWith(posts);

  it('selectPlatformDistribution counts posts per platform', () => {
    expect(selectPlatformDistribution(state)).toEqual({ Instagram: 2, LinkedIn: 2 });
  });

  it('selectDashboardStats tallies totals by status', () => {
    expect(selectDashboardStats(state)).toEqual({
      total: 4,
      scheduled: 1,
      published: 1,
      draft: 1,
      failed: 1,
    });
  });
});
