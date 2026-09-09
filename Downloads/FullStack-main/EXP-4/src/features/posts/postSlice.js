import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import * as postService from '../../services/postService';

/**
 * postSlice is the single source of truth for all posts in the app.
 * Redux Toolkit's createSlice uses Immer internally, so the "mutating"
 * code inside each reducer is safe — Immer produces a new immutable
 * state object behind the scenes. We never mutate state outside a reducer.
 */

const initialState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  return await postService.getPosts();
});

export const createPostAsync = createAsyncThunk('posts/createPostAsync', async (postData) => {
  return await postService.createPost(postData);
});

export const updatePostAsync = createAsyncThunk(
  'posts/updatePostAsync',
  async ({ id, changes }) => {
    return await postService.updatePost(id, changes);
  }
);

export const deletePostAsync = createAsyncThunk('posts/deletePostAsync', async (id) => {
  await postService.deletePost(id);
  return id;
});

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action) {
      state.posts = action.payload;
    },
    addPost(state, action) {
      state.posts.unshift(action.payload);
    },
    updatePost(state, action) {
      const { id, changes } = action.payload;
      const post = state.posts.find((p) => p.id === id);
      if (post) {
        Object.assign(post, changes, { updatedAt: new Date().toISOString() });
      }
    },
    deletePost(state, action) {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    // Used by drag-and-drop: moves a post to a new scheduled date/time.
    movePost(state, action) {
      const { id, newScheduledAt } = action.payload;
      const post = state.posts.find((p) => p.id === id);
      if (post) {
        post.scheduledAt = newScheduledAt;
        post.updatedAt = new Date().toISOString();
      }
    },
    duplicatePost(state, action) {
      const original = state.posts.find((p) => p.id === action.payload);
      if (original) {
        const now = new Date().toISOString();
        state.posts.unshift({
          ...original,
          id: `post-${nanoid()}`,
          title: `${original.title} (Copy)`,
          status: 'Draft',
          createdAt: now,
          updatedAt: now,
        });
      }
    },
    publishPost(state, action) {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.status = 'Published';
        post.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load posts.';
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.posts[index] = action.payload;
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePostAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete post.';
      });
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  movePost,
  duplicatePost,
  publishPost,
} = postSlice.actions;

export default postSlice.reducer;
