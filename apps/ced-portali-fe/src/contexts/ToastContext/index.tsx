import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastState {
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      setToast({ message, variant });
      window.setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            padding: "14px 18px",
            borderRadius: 14,
            color: "#fff",
            background:
              toast.variant === "error"
                ? "#b42318"
                : toast.variant === "success"
                  ? "#117a65"
                  : "#1c6dd0",
            boxShadow: "0 18px 40px rgba(28, 73, 127, 0.18)",
          }}
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
