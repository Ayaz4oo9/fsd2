import { configureStore } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postSlice';
import filtersReducer from '../features/filters/filterSlice';
import uiReducer from '../features/ui/uiSlice';

// Central Redux store. Every slice owns one clearly-scoped piece of state.
// Keeping slices small keeps reducers easy to reason about and test.
export const store = configureStore({
  reducer: {
    posts: postsReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
});

export default store;
