"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type Tone = "ok" | "error";
type Toast = { id: number; message: string; tone: Tone };
type ToastCtx = { notify: (message: string, tone?: Tone) => void };

const Context = createContext<ToastCtx | null>(null);

/** Bottom-right, auto-dismissing confirmations for actions that otherwise give no feedback. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const notify = useCallback((message: string, tone: Tone = "ok") => {
    if (!message) return;
    const id = ++counter.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), tone === "error" ? 5200 : 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <Context.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`toast ${toast.tone}`} key={toast.id} role="status" onClick={() => setToasts((c) => c.filter((t) => t.id !== toast.id))}>
            <i aria-hidden="true">{toast.tone === "error" ? "!" : "✓"}</i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}

export function useToast() {
  const value = useContext(Context);
  return value ?? { notify: () => undefined };
}
