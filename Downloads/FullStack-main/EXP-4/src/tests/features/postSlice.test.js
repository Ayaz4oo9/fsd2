import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import postReducer, {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  movePost,
  duplicatePost,
  publishPost,
  fetchPosts,
  createPostAsync,
  updatePostAsync,
  deletePostAsync,
} from '../../features/posts/postSlice';

// The async thunks call into services/postService — mock the whole module
// so slice tests never touch localStorage or real timers, and stay focused
// purely on reducer behaviour.
vi.mock('../../services/postService', () => ({
  getPosts: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

import * as postService from '../../services/postService';

function makePost(overrides = {}) {
  return {
    id: 'post-1',
    title: 'Original title',
    content: 'Original content',
    platform: 'Instagram',
    status: 'Draft',
    category: 'Marketing',
    tags: ['react'],
    scheduledAt: '2026-09-10T09:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildStore(preloadedPosts = []) {
  return configureStore({
    reducer: { posts: postReducer },
    preloadedState: { posts: { posts: preloadedPosts, loading: false, error: null } },
  });
}

describe('postSlice reducers', () => {
  it('returns the correct initial state', () => {
    expect(postReducer(undefined, { type: '@@INIT' })).toEqual({
      posts: [],
      loading: false,
      error: null,
    });
  });

  it('setPosts replaces the entire posts array', () => {
    const posts = [makePost({ id: 'a' }), makePost({ id: 'b' })];
    const state = postReducer(undefined, setPosts(posts));
    expect(state.posts).toHaveLength(2);
    expect(state.posts.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('addPost prepends a new post (most recent first)', () => {
    const existing = { posts: [makePost({ id: 'old' })], loading: false, error: null };
    const state = postReducer(existing, addPost(makePost({ id: 'new' })));
    expect(state.posts[0].id).toBe('new');
    expect(state.posts).toHaveLength(2);
  });

  it('updatePost merges changes into the matching post and bumps updatedAt', () => {
    const existing = {
      posts: [makePost({ id: 'p1', updatedAt: '2000-01-01T00:00:00.000Z' })],
      loading: false,
      error: null,
    };
    const state = postReducer(
      existing,
      updatePost({ id: 'p1', changes: { title: 'Edited title' } })
    );
    expect(state.posts[0].title).toBe('Edited title');
    expect(state.posts[0].updatedAt).not.toBe('2000-01-01T00:00:00.000Z');
  });

  it('updatePost is a no-op when the id does not exist', () => {
    const existing = { posts: [makePost({ id: 'p1' })], loading: false, error: null };
    const state = postReducer(existing, updatePost({ id: 'missing', changes: { title: 'X' } }));
    expect(state.posts[0].title).toBe('Original title');
  });

  it('deletePost removes the matching post only', () => {
    const existing = {
      posts: [makePost({ id: 'keep' }), makePost({ id: 'remove' })],
      loading: false,
      error: null,
    };
    const state = postReducer(existing, deletePost('remove'));
    expect(state.posts).toHaveLength(1);
    expect(state.posts[0].id).toBe('keep');
  });

  it('movePost updates scheduledAt for drag-and-drop rescheduling', () => {
    const existing = { posts: [makePost({ id: 'p1' })], loading: false, error: null };
    const newTime = '2026-10-01T12:00:00.000Z';
    const state = postReducer(existing, movePost({ id: 'p1', newScheduledAt: newTime }));
    expect(state.posts[0].scheduledAt).toBe(newTime);
  });

  it('duplicatePost inserts a copy with a new id, "(Copy)" title, and Draft status', () => {
    const existing = {
      posts: [makePost({ id: 'p1', title: 'Weekly update', status: 'Published' })],
      loading: false,
      error: null,
    };
    const state = postReducer(existing, duplicatePost('p1'));
    expect(state.posts).toHaveLength(2);
    const copy = state.posts.find((p) => p.id !== 'p1');
    expect(copy.title).toBe('Weekly update (Copy)');
    expect(copy.status).toBe('Draft');
    expect(copy.id).not.toBe('p1');
  });

  it('duplicatePost is a no-op when the original id does not exist', () => {
    const existing = { posts: [makePost({ id: 'p1' })], loading: false, error: null };
    const state = postReducer(existing, duplicatePost('missing'));
    expect(state.posts).toHaveLength(1);
  });

  it('publishPost flips status to Published', () => {
    const existing = {
      posts: [makePost({ id: 'p1', status: 'Scheduled' })],
      loading: false,
      error: null,
    };
    const state = postReducer(existing, publishPost('p1'));
    expect(state.posts[0].status).toBe('Published');
  });
});

describe('postSlice async thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchPosts: pending sets loading true and clears error', () => {
    const store = buildStore();
    store.dispatch({ type: fetchPosts.pending.type });
    expect(store.getState().posts.loading).toBe(true);
    expect(store.getState().posts.error).toBeNull();
  });

  it('fetchPosts: fulfilled populates posts and clears loading', async () => {
    const seeded = [makePost({ id: 'a' }), makePost({ id: 'b' })];
    postService.getPosts.mockResolvedValueOnce(seeded);

    const store = buildStore();
    await store.dispatch(fetchPosts());

    expect(store.getState().posts.loading).toBe(false);
    expect(store.getState().posts.posts).toHaveLength(2);
  });

  it('fetchPosts: rejected sets an error message and clears loading', async () => {
    postService.getPosts.mockRejectedValueOnce(new Error('Network down'));

    const store = buildStore();
    await store.dispatch(fetchPosts());

    expect(store.getState().posts.loading).toBe(false);
    expect(store.getState().posts.error).toBe('Network down');
  });

  it('createPostAsync: fulfilled prepends the created post', async () => {
    const created = makePost({ id: 'new-post' });
    postService.createPost.mockResolvedValueOnce(created);

    const store = buildStore([makePost({ id: 'existing' })]);
    await store.dispatch(createPostAsync({ title: 'New Post' }));

    expect(store.getState().posts.posts[0].id).toBe('new-post');
    expect(store.getState().posts.posts).toHaveLength(2);
  });

  it('updatePostAsync: fulfilled replaces the matching post in place', async () => {
    const updated = makePost({ id: 'p1', title: 'Server-confirmed title' });
    postService.updatePost.mockResolvedValueOnce(updated);

    const store = buildStore([makePost({ id: 'p1', title: 'Old title' })]);
    await store.dispatch(updatePostAsync({ id: 'p1', changes: { title: 'Server-confirmed title' } }));

    expect(store.getState().posts.posts[0].title).toBe('Server-confirmed title');
  });

  it('deletePostAsync: fulfilled removes the post by id', async () => {
    postService.deletePost.mockResolvedValueOnce(undefined);

    const store = buildStore([makePost({ id: 'p1' }), makePost({ id: 'p2' })]);
    await store.dispatch(deletePostAsync('p1'));

    expect(store.getState().posts.posts).toHaveLength(1);
    expect(store.getState().posts.posts[0].id).toBe('p2');
  });

  it('deletePostAsync: rejected records an error but leaves posts untouched', async () => {
    postService.deletePost.mockRejectedValueOnce(new Error('Cannot delete: post "p1" does not exist.'));

    const store = buildStore([makePost({ id: 'p1' })]);
    await store.dispatch(deletePostAsync('p1'));

    expect(store.getState().posts.error).toBe('Cannot delete: post "p1" does not exist.');
    expect(store.getState().posts.posts).toHaveLength(1);
  });
});
