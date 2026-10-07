import { createSlice } from '@reduxjs/toolkit';

// Ephemeral UI-only state (never persisted, never business data) lives here
// so it stays out of the postsSlice. This keeps postsSlice focused purely
// on domain data, per the "keep reducers pure and single-purpose" rule.
const initialState = {
  toast: null, // { message, type }
  confirmDialog: null, // { message, onConfirmActionType, payload }
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
    openConfirmDialog(state, action) {
      state.confirmDialog = action.payload;
    },
    closeConfirmDialog(state) {
      state.confirmDialog = null;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { showToast, clearToast, openConfirmDialog, closeConfirmDialog, toggleSidebar } =
  uiSlice.actions;

export const selectToast = (state) => state.ui.toast;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;

export default uiSlice.reducer;
