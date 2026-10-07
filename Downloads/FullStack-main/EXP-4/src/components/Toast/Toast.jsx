import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToast, clearToast } from '../../features/ui/uiSlice';
import './Toast.css';

function Toast() {
  const toast = useSelector(selectToast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(clearToast()), 3000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.type || 'info'}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}

export default Toast;
