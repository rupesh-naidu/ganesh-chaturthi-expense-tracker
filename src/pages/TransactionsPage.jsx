import React, { useState, useMemo } from "react";
import { useTransactions } from "../context/TransactionContext";
import { formatINR } from "../utils/formatters";
import TransactionModal from "../components/TransactionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function TransactionsPage() {
  const { transactions, role } = useTransactions();

  const [filterType, setFilterType] = useState("all"); // "all" | "donations" | "expenses"
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  // Filtered & Sorted Transactions (Newest first)
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (filterType === "donations" && tx.type !== "donation") return false;
        if (filterType === "expenses" && tx.type !== "expense") return false;

        // Search filter (name or description)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = tx.name.toLowerCase().includes(query);
          const matchDesc = (tx.description || "").toLowerCase().includes(query);
          return matchName || matchDesc;
        }

        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactions, filterType, searchQuery]);

  // Formats date nicely e.g. "Sep 8, 2026"
  const formatTxDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>TRANSACTION HISTORY</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              {filteredTransactions.length} records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Complete digital ledger of donations collected and expenses incurred
          </p>
        </div>

        {/* Admin Add Transaction Button */}
        {role === "admin" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-festive active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Transaction</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/80 shadow-festive space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-xs sm:text-sm font-medium transition-all"
            />
          </div>

          {/* Filter Tabs: [ All ] [ Donations ] [ Expenses ] */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border border-amber-200/60 self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-white text-orange-950 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("donations")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "donations"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setFilterType("expenses")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === "expenses"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-amber-200/70 shadow-festive text-center">
          <div className="text-4xl mb-2">🐘</div>
          <h3 className="text-base font-bold text-gray-800">No transactions found.</h3>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search query or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const isDonation = tx.type === "donation";

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-amber-200/70 p-4 sm:p-5 shadow-festive hover:shadow-festive-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                      isDonation
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isDonation ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-gray-950 truncate">
                        {tx.name}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          isDonation
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {isDonation ? "Donation" : "Expense"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
                      {tx.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mt-1.5">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{formatTxDate(tx.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-amber-100">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-lg sm:text-xl font-black font-sans ${
                        isDonation ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isDonation ? "+" : "-"}
                      {formatINR(tx.amount)}
                    </span>
                  </div>

                  {/* ADMIN Controls: [ Edit ] [ Delete ] */}
                  {role === "admin" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className="p-2 rounded-xl text-gray-500 hover:text-amber-700 hover:bg-amber-50 border border-gray-200/80 transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingTransaction(tx)}
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-700 hover:bg-rose-50 border border-gray-200/80 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        transactionToEdit={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
      />
    </div>
  );
}
