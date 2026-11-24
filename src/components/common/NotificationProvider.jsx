import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X
} from 'lucide-react';
import { NotificationContext } from './NotificationContext';

const VARIANT_CONFIG = {
  info: {
    badge: 'Informasi Sistem',
    dotColor: 'bg-[#F59E0B]',
    pillClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    iconWrap: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] ring-4 ring-[#FEF3C7]/60',
    topBar: 'bg-[#F59E0B]',
    toastBar: 'bg-[#F59E0B]',
    confirmBtn: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#141414]',
    Icon: Info
  },
  success: {
    badge: 'Berhasil',
    dotColor: 'bg-emerald-500',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconWrap: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-4 ring-emerald-50/80',
    topBar: 'bg-emerald-500',
    toastBar: 'bg-emerald-500',
    confirmBtn: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#141414]',
    Icon: CheckCircle2
  },
  warning: {
    badge: 'Peringatan',
    dotColor: 'bg-[#F59E0B]',
    pillClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    iconWrap: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] ring-4 ring-[#FEF3C7]/60',
    topBar: 'bg-[#F59E0B]',
    toastBar: 'bg-[#F59E0B]',
    confirmBtn: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#141414]',
    Icon: AlertTriangle
  },
  danger: {
    badge: 'Konfirmasi Kritis',
    dotColor: 'bg-red-600',
    pillClass: 'bg-red-50 text-red-700 border-red-200',
    iconWrap: 'bg-red-50 text-red-600 border-red-200 ring-4 ring-red-50/80',
    topBar: 'bg-red-600',
    toastBar: 'bg-red-600',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    Icon: ShieldAlert
  }
};

function PromptDialogBody({ dialog, dialogTheme, onCancel, onSubmit }) {
  const [promptValue, setPromptValue] = useState(dialog.defaultValue ?? '');
  const [promptError, setPromptError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = String(promptValue || '').trim();
    if (dialog.required && !trimmed) {
      setPromptError('Kolom ini wajib diisi sebelum melanjutkan.');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="px-6 pb-6 space-y-4">
        {dialog.message && (
          <p className="text-[13px] text-[#52525B] font-medium leading-relaxed">
            {dialog.message}
          </p>
        )}

        <div className="space-y-1.5">
          {dialog.label && (
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
              {dialog.label}
            </label>
          )}
          <input
            type={dialog.inputType || 'text'}
            autoFocus
            value={promptValue}
            onChange={(e) => {
              setPromptValue(e.target.value);
              if (promptError) setPromptError('');
            }}
            placeholder={dialog.placeholder}
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm font-semibold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15 transition-all"
          />
          {promptError && (
            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 pt-0.5">
              <AlertTriangle size={12} /> {promptError}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-between gap-3">
        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
          <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded text-[9px] font-bold text-zinc-500">
            ESC
          </kbd>
          <span>Batal</span>
        </span>
        <div className="flex items-center gap-2.5 flex-1 sm:flex-none justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white hover:bg-zinc-100 text-[#141414] text-xs font-bold cursor-pointer transition-colors"
          >
            {dialog.cancelText || 'Batal'}
          </button>
          <button
            type="submit"
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer shadow-sm active:scale-[0.98] transition-all ${dialogTheme.confirmBtn}`}
          >
            {dialog.confirmText || 'Simpan'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function NotificationProvider({ children }) {
  const [dialogQueue, setDialogQueue] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef(new Map());

  const activeDialog = dialogQueue[0] || null;

  const enqueueDialog = useCallback((config) => {
    return new Promise((resolve) => {
      const id = `DLG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setDialogQueue((prev) => [...prev, { id, ...config, resolve }]);
    });
  }, []);

  const closeActiveDialog = useCallback((result) => {
    setDialogQueue((prev) => {
      if (prev.length === 0) return prev;
      const [current, ...rest] = prev;
      current.resolve(result);
      return rest;
    });
  }, []);

  const showAlert = useCallback(
    (options) => {
      const normalized =
        typeof options === 'string'
          ? { title: 'Informasi', message: options, variant: 'info' }
          : options || {};
      return enqueueDialog({
        mode: 'alert',
        variant: normalized.variant || 'info',
        title: normalized.title || 'Perhatian',
        message: normalized.message || '',
        confirmText: normalized.confirmText || 'Mengerti',
        closeOnOverlay: normalized.closeOnOverlay ?? true
      });
    },
    [enqueueDialog]
  );

  const showConfirm = useCallback(
    (options) => {
      const normalized =
        typeof options === 'string'
          ? { title: 'Konfirmasi Aksi', message: options, variant: 'warning' }
          : options || {};
      return enqueueDialog({
        mode: 'confirm',
        variant: normalized.variant || 'warning',
        title: normalized.title || 'Konfirmasi Aksi',
        message: normalized.message || '',
        confirmText: normalized.confirmText || 'Konfirmasi',
        cancelText: normalized.cancelText || 'Batal',
        closeOnOverlay: normalized.closeOnOverlay ?? false
      });
    },
    [enqueueDialog]
  );

  const showPrompt = useCallback(
    (options = {}) => {
      const defaultVal = options.defaultValue ?? '';
      return enqueueDialog({
        mode: 'prompt',
        variant: options.variant || 'info',
        title: options.title || 'Masukkan Input',
        message: options.message || '',
        label: options.label || '',
        placeholder: options.placeholder || '',
        defaultValue: defaultVal,
        required: options.required ?? true,
        inputType: options.inputType || 'text',
        confirmText: options.confirmText || 'Simpan',
        cancelText: options.cancelText || 'Batal',
        closeOnOverlay: options.closeOnOverlay ?? false
      });
    },
    [enqueueDialog]
  );

  useEffect(() => {
    if (!activeDialog) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeDialog.mode === 'confirm') closeActiveDialog(false);
        else if (activeDialog.mode === 'prompt') closeActiveDialog(null);
        else closeActiveDialog(undefined);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog, closeActiveDialog]);

  const dismissToast = useCallback((id) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options) => {
      const normalized =
        typeof options === 'string'
          ? { title: 'Berhasil', message: options, variant: 'success' }
          : options || {};
      const id = `TST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duration = normalized.duration ?? 3200;

      const entry = {
        id,
        title: normalized.title || 'Notifikasi',
        message: normalized.message || '',
        variant: normalized.variant || 'success',
        duration
      };

      setToasts((prev) => [entry, ...prev].slice(0, 4));

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        toastTimersRef.current.set(id, timer);
      }
      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    const timersMap = toastTimersRef.current;
    return () => {
      timersMap.forEach((timer) => clearTimeout(timer));
      timersMap.clear();
    };
  }, []);

  const dialogTheme = VARIANT_CONFIG[activeDialog?.variant || 'info'] || VARIANT_CONFIG.info;
  const DialogIcon = dialogTheme.Icon;

  return (
    <NotificationContext.Provider
      value={{
        showAlert,
        showConfirm,
        showPrompt,
        showToast
      }}
    >
      {children}

      {/* NON-BLOCKING TOAST STACK (TOP-RIGHT) */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto z-[120] flex flex-col gap-2.5 sm:w-96 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = VARIANT_CONFIG[toast.variant || 'success'] || VARIANT_CONFIG.success;
            const ToastIcon = cfg.Icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="pointer-events-auto relative overflow-hidden bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_14px_34px_-10px_rgba(20,20,20,0.14)] px-4 pt-3.5 pb-4 flex items-start gap-3 text-[#141414]"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.pillClass}`}>
                  <ToastIcon size={16} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-extrabold text-[#141414] leading-snug">{toast.title}</p>
                  {toast.message && (
                    <p className="text-[11px] text-[#52525B] font-medium mt-0.5 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Tutup notifikasi"
                  className="w-7 h-7 rounded-full bg-[#FAFAFA] hover:bg-zinc-200/70 text-zinc-400 hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={13} />
                </button>
                {toast.duration > 0 && (
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                    className={`absolute left-0 right-0 bottom-0 h-[3px] ${cfg.toastBar}`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CUSTOM ALERT / CONFIRMATION / PROMPT MODAL */}
      <AnimatePresence>
        {activeDialog && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stocko-dialog-title"
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => {
                if (!activeDialog.closeOnOverlay) return;
                if (activeDialog.mode === 'confirm') closeActiveDialog(false);
                else if (activeDialog.mode === 'prompt') closeActiveDialog(null);
                else closeActiveDialog(undefined);
              }}
              className={`absolute inset-0 bg-[#141414]/40 backdrop-blur-[4px] ${
                activeDialog.closeOnOverlay ? 'cursor-pointer' : ''
              }`}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.85 }}
              className="relative w-full max-w-[420px] bg-white rounded-3xl border border-[#E5E5E5] shadow-[0_24px_64px_-16px_rgba(20,20,20,0.22)] overflow-hidden"
            >
              {/* Accent Top Bar */}
              <div className={`h-1.5 w-full ${dialogTheme.topBar}`} />

              {/* Top Pill & Close Control */}
              <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider ${dialogTheme.pillClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dialogTheme.dotColor}`} />
                  {dialogTheme.badge}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (activeDialog.mode === 'confirm') closeActiveDialog(false);
                    else if (activeDialog.mode === 'prompt') closeActiveDialog(null);
                    else closeActiveDialog(undefined);
                  }}
                  aria-label="Tutup dialog"
                  className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200/70 border border-[#E5E5E5] text-zinc-500 hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Hero Icon + Title */}
              <div className="px-6 pt-2 pb-4 flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${dialogTheme.iconWrap}`}
                >
                  <DialogIcon size={22} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3
                    id="stocko-dialog-title"
                    className="text-[17px] font-extrabold text-[#141414] tracking-tight leading-snug"
                  >
                    {activeDialog.title}
                  </h3>
                  {activeDialog.mode !== 'prompt' && (
                    <p className="text-[13px] text-[#52525B] font-medium leading-relaxed mt-1.5 whitespace-pre-line">
                      {activeDialog.message}
                    </p>
                  )}
                </div>
              </div>

              {activeDialog.mode === 'prompt' ? (
                <PromptDialogBody
                  key={activeDialog.id}
                  dialog={activeDialog}
                  dialogTheme={dialogTheme}
                  onCancel={() => closeActiveDialog(null)}
                  onSubmit={(val) => closeActiveDialog(val)}
                />
              ) : (
                <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-between gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                    <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded text-[9px] font-bold text-zinc-500">
                      ESC
                    </kbd>
                    <span>{activeDialog.mode === 'confirm' ? 'Batal' : 'Tutup'}</span>
                  </span>

                  <div className="flex items-center gap-2.5 flex-1 sm:flex-none justify-end">
                    {activeDialog.mode === 'confirm' && (
                      <button
                        type="button"
                        onClick={() => closeActiveDialog(false)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white hover:bg-zinc-100 text-[#141414] text-xs font-bold cursor-pointer transition-colors"
                      >
                        {activeDialog.cancelText || 'Batal'}
                      </button>
                    )}
                    <button
                      type="button"
                      autoFocus
                      onClick={() => closeActiveDialog(true)}
                      className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer shadow-sm active:scale-[0.98] transition-all ${dialogTheme.confirmBtn}`}
                    >
                      {activeDialog.confirmText || 'Mengerti'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
