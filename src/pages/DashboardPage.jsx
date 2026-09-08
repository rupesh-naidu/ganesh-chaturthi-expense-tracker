import React, { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import CurrentHoldingCard from "../components/CurrentHoldingCard";
import StatCards from "../components/StatCards";
import RecentActivity from "../components/RecentActivity";
import TransactionModal from "../components/TransactionModal";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { Plus, Sparkles, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { role, canManageFinance, isLoading, fetchTransactions } = useTransactions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-fade-in">
      {/* Subtle Festive Banner Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-amber-100/70 via-orange-100/60 to-amber-100/70 border border-amber-200/80 rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
          <span className="text-base">🚩</span>
          <span>श्री गणेशाय नमः • Ganesh Chaturthi Celebration Ledger</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-orange-800">
          <button
            onClick={() => fetchTransactions()}
            className="flex items-center gap-1 hover:text-orange-950 transition-colors"
            title="Refresh transactions from Supabase"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
          <span>•</span>
          <span>Active Role: <strong className="uppercase">{role}</strong></span>
        </div>
      </div>

      {/* 1. Visually Dominant Current Holding Card */}
      <CurrentHoldingCard />

      {/* 2. Total Donations & Total Money Spent Cards */}
      <StatCards />

      {/* 3. Action Section for ADMIN & COMMITTEE */}
      {canManageFinance && (
        <div className="flex justify-center sm:justify-start">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white font-extrabold px-6 py-4 rounded-2xl shadow-festive hover:shadow-festive-lg transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      )}

      {/* 4. Recent Activity (Latest 5 Transactions) */}
      <RecentActivity />

      {/* Mobile Floating Action Button for Admin & Committee */}
      {canManageFinance && (
        <div className="fixed bottom-5 right-5 sm:hidden z-30">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-festive-lg active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
