import React, { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { formatINR } from "../utils/formatters";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, transaction }) {
  const { deleteTransaction } = useTransactions();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      if (err.message && err.message.includes("row-level security")) {
        setError("Unauthorized: You must be logged in as an Admin or Committee member to delete database records.");
      } else {
        setError(err.message || "Failed to delete transaction.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-extrabold text-center text-gray-900 mb-1">
            Delete Transaction?
          </h3>
          <p className="text-xs sm:text-sm text-center text-gray-500 mb-4">
            Are you sure you want to delete this transaction from the database? This action cannot be undone.
          </p>

          {/* Transaction Summary Card */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 mb-4 text-xs space-y-1">
            <div className="flex justify-between font-bold text-gray-900">
              <span>{transaction.name}</span>
              <span className="font-mono">
                {transaction.type === "donation" ? "🟢 +" : "🔴 -"}
                {formatINR(transaction.amount)}
              </span>
            </div>
            <p className="text-gray-500 italic truncate">{transaction.description}</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setError("");
                onClose();
              }}
              disabled={isDeleting}
              className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
