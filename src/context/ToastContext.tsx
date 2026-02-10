import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import Toast from '@/components/ui/Toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  errors?: string[];
  duration?: number;
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string, errors?: string[]) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'success', message, title });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title?: string, errors?: string[]) => {
      showToast({ type: 'error', message, title, errors, duration: 8000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'warning', message, title });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'info', message, title });
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-[1700] flex flex-col gap-2 pointer-events-none max-w-md min-w-[320px]"
        style={{ zIndex: 'var(--z-toast)' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            errors={toast.errors}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
