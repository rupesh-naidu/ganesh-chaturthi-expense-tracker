import React, { useState, useEffect } from "react";
import { useTransactions } from "../context/TransactionContext";
import { formatINR } from "../utils/formatters";
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";

export default function TransactionModal({ isOpen, onClose, transactionToEdit = null }) {
  const { addTransaction, updateTransaction, currentHolding } = useTransactions();

  const isEditing = Boolean(transactionToEdit);

  const [type, setType] = useState("donation");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || "donation");
      setName(transactionToEdit.name || "");
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : "");
      setDescription(transactionToEdit.description || "");
    } else {
      setType("donation");
      setName("");
      setAmount("");
      setDescription("");
    }
    setError("");
    setIsSubmitting(false);
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setError("Description / reason is required.");
      return;
    }

    // Client-side balance check for expenses
    if (type === "expense") {
      let maxAllowed = currentHolding;
      if (isEditing && transactionToEdit.type === "expense") {
        maxAllowed += Number(transactionToEdit.amount);
      }
      if (isEditing && transactionToEdit.type === "donation") {
        maxAllowed -= Number(transactionToEdit.amount);
      }

      if (numericAmount > maxAllowed) {
        setError(`Insufficient funds. Current holding is ${formatINR(currentHolding)}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateTransaction(transactionToEdit.id, {
          type,
          name: trimmedName,
          amount: numericAmount,
          description: trimmedDesc,
        });
      } else {
        await addTransaction({
          type,
          name: trimmedName,
          amount: numericAmount,
          description: trimmedDesc,
        });
      }
      onClose();
    } catch (err) {
      console.error("Save transaction error:", err);
      // User-friendly error mapping
      if (err.message && err.message.includes("row-level security")) {
        setError("Unauthorized by Database: You must log in as an Admin via 'Admin Login' to record entries into Supabase.");
      } else {
        setError(err.message || "Failed to save transaction.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐘</span>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                {isEditing ? "Edit Transaction" : "Record New Transaction"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {isEditing
                  ? "Update ledger entry details"
                  : "Add donation or expense to community fund"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Type Selector (Donation vs Expense) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("donation")}
                className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  type === "donation"
                    ? "border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-sm ring-2 ring-emerald-400/20"
                    : "border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300"
                }`}
              >
                <ArrowDownLeft
                  className={`w-4 h-4 ${
                    type === "donation" ? "text-emerald-600" : "text-gray-400"
                  }`}
                />
                <span>Donation (Incoming)</span>
              </button>

              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  type === "expense"
                    ? "border-rose-500 bg-rose-50/80 text-rose-800 shadow-sm ring-2 ring-rose-400/20"
                    : "border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300"
                }`}
              >
                <ArrowUpRight
                  className={`w-4 h-4 ${
                    type === "expense" ? "text-rose-600" : "text-gray-400"
                  }`}
                />
                <span>Expense (Outgoing)</span>
              </button>
            </div>
            {type === "expense" && (
              <p className="text-[11px] font-semibold text-rose-600/90 mt-1.5">
                * Maximum funds available for expense: {formatINR(currentHolding)}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {type === "donation" ? "Donor Name" : "Paid To / Spent By"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "donation" ? "e.g. Ravi Sharma" : "e.g. Suresh (Florist)"}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm font-medium transition-all"
              required
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base select-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-base font-bold font-mono transition-all"
                required
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <span className="text-[11px] font-semibold text-gray-400 block mt-1">
                Indian Format: {formatINR(parseFloat(amount))}
              </span>
            )}
          </div>

          {/* Description / Reason Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Description / Reason
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === "donation"
                  ? "e.g. Ganesh Chaturthi contribution / Flat 402"
                  : "e.g. Flowers, garland, and stage decoration"
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm font-medium resize-none transition-all"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-festive active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Saving to Database..."
                  : isEditing
                  ? "Save Changes"
                  : "Save Transaction"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
