'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-white';
            let borderColor = 'border-border';
            let textColor = 'text-foreground';
            let Icon = Info;

            switch (toast.type) {
              case 'success':
                bgColor = 'bg-emerald-50';
                borderColor = 'border-emerald-200';
                textColor = 'text-emerald-800';
                Icon = CheckCircle2;
                break;
              case 'error':
                bgColor = 'bg-rose-50';
                borderColor = 'border-rose-200';
                textColor = 'text-rose-800';
                Icon = AlertCircle;
                break;
              case 'warning':
                bgColor = 'bg-amber-50';
                borderColor = 'border-amber-200';
                textColor = 'text-amber-800';
                Icon = AlertTriangle;
                break;
              case 'info':
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-200';
                textColor = 'text-blue-800';
                Icon = Info;
                break;
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`pointer-events-auto w-full flex items-start gap-3 rounded-2xl border ${borderColor} ${bgColor} ${textColor} p-4 shadow-lg`}
              >
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs font-bold leading-normal">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 rounded-full p-0.5 hover:bg-black/5 text-current/60 hover:text-current transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
