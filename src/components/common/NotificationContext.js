import { createContext, useContext } from 'react';

export const NotificationContext = createContext(null);

/**
 * Hook untuk menampilkan Custom Alert Popup, Confirmation Modal, Prompt Modal,
 * dan Toast Notification bertema Light Editorial Stocko.
 */
export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      showAlert: () => Promise.resolve(),
      showConfirm: () => Promise.resolve(false),
      showPrompt: () => Promise.resolve(null),
      showToast: () => {}
    };
  }
  return ctx;
}
