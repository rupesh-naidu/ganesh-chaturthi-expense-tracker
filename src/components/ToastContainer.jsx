import React from "react";
import { useTransactions } from "../context/TransactionContext";
import { X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useTransactions();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const isDonation = toast.type === "donation";
        const isExpense = toast.type === "expense";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-festive-lg border backdrop-blur-md transform transition-all duration-300 animate-slide-in ${
              isDonation
                ? "bg-white/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10"
                : isExpense
                ? "bg-white/95 border-rose-300 text-rose-950 shadow-rose-500/10"
                : "bg-white/95 border-amber-300 text-amber-950 shadow-amber-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {isDonation ? "🟢" : isExpense ? "🔴" : "ℹ️"}
                </span>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{toast.title}</h4>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{toast.message}</p>
                  {toast.subMessage && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">{toast.subMessage}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
