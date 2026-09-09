import { describe, it, expect } from 'vitest';
import uiReducer, {
  showToast,
  clearToast,
  openConfirmDialog,
  closeConfirmDialog,
  toggleSidebar,
} from '../../features/ui/uiSlice';

const initialState = {
  toast: null,
  confirmDialog: null,
  sidebarOpen: true,
};

describe('uiSlice', () => {
  it('returns the correct initial state', () => {
    expect(uiReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('showToast stores the toast payload', () => {
    const toast = { message: 'Post saved', type: 'success' };
    const state = uiReducer(initialState, showToast(toast));
    expect(state.toast).toEqual(toast);
  });

  it('clearToast resets the toast to null', () => {
    const dirty = { ...initialState, toast: { message: 'x', type: 'error' } };
    expect(uiReducer(dirty, clearToast()).toast).toBeNull();
  });

  it('openConfirmDialog stores the dialog payload', () => {
    const dialog = { message: 'Delete this post?', onConfirmActionType: 'posts/deletePost', payload: 'p1' };
    const state = uiReducer(initialState, openConfirmDialog(dialog));
    expect(state.confirmDialog).toEqual(dialog);
  });

  it('closeConfirmDialog resets the dialog to null', () => {
    const dirty = { ...initialState, confirmDialog: { message: 'x' } };
    expect(uiReducer(dirty, closeConfirmDialog()).confirmDialog).toBeNull();
  });

  it('toggleSidebar flips sidebarOpen each time it is called', () => {
    const once = uiReducer(initialState, toggleSidebar());
    expect(once.sidebarOpen).toBe(false);
    const twice = uiReducer(once, toggleSidebar());
    expect(twice.sidebarOpen).toBe(true);
  });
});
