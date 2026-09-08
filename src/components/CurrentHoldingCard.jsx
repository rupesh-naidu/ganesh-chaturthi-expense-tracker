import React from "react";
import { useTransactions } from "../context/TransactionContext";
import { formatINR } from "../utils/formatters";
import { Sparkles, Wallet, ShieldCheck } from "lucide-react";

export default function CurrentHoldingCard() {
  const { currentHolding, totalDonations, totalExpenses } = useTransactions();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8EE] via-white to-[#FEF3C7] border-2 border-amber-300/80 p-6 sm:p-8 shadow-festive-lg">
      {/* Subtle festive background glow effects */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-orange-400/10 to-amber-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Traditional Festival Diya & Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-orange-900/80">
            CURRENT HOLDING
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-[11px] font-semibold">
          <span>🪔</span>
          <span>Live Balance</span>
        </div>
      </div>

      {/* Dominant Currency Balance */}
      <div className="relative z-10 my-3">
        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-950 tracking-tight font-sans flex items-baseline gap-1">
          <span className="text-orange-600 font-extrabold select-none">₹</span>
          <span>{formatINR(currentHolding).replace("₹", "")}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-amber-900/70 mt-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          Available money right now in community fund
        </p>
      </div>

      {/* Micro Status Footnote */}
      <div className="relative z-10 pt-4 mt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 font-medium">
        <div className="flex items-center gap-1 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strictly calculated from verified transactions</span>
        </div>
        <div className="text-gray-400 italic">
          Formula: Total Donations - Total Spent
        </div>
      </div>
    </div>
  );
}
