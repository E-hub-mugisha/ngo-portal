/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback } from 'react';

// Hook: useToast() — returns { toasts, toast }
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'default') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return { toasts, toast };
}

// Component: renders the toast stack
export function ToastContainer({ toasts }) {
  const icons = { success: '✅', error: '❌', default: 'ℹ️' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type !== 'default' ? t.type : ''}`}>
          <span>{icons[t.type] || 'ℹ️'}</span>
          <span dangerouslySetInnerHTML={{ __html: t.msg }} />
        </div>
      ))}
    </div>
  );
}