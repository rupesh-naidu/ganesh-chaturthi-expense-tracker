import React from "react";
import { useTransactions } from "../context/TransactionContext";
import { formatINR } from "../utils/formatters";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function StatCards() {
  const { totalDonations, totalExpenses, transactions } = useTransactions();

  const donationCount = transactions.filter((t) => t.type === "donation").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Total Donations Card */}
      <div className="rounded-3xl bg-white border border-emerald-200/80 p-5 sm:p-6 shadow-festive hover:shadow-festive-lg transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />

        <div className="relative z-10 flex items-start justify-between mb-2">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800/80 block">
              TOTAL DONATIONS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-sans block mt-1">
              {formatINR(totalDonations)}
            </span>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-emerald-700 pt-3 border-t border-emerald-100/60 mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{donationCount} contributions recorded</span>
        </div>
      </div>

      {/* Total Money Spent Card */}
      <div className="rounded-3xl bg-white border border-rose-200/80 p-5 sm:p-6 shadow-festive hover:shadow-festive-lg transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />

        <div className="relative z-10 flex items-start justify-between mb-2">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-800/80 block">
              TOTAL MONEY SPENT
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-950 font-sans block mt-1">
              {formatINR(totalExpenses)}
            </span>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shadow-sm">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-rose-700 pt-3 border-t border-rose-100/60 mt-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{expenseCount} festival expenses incurred</span>
        </div>
      </div>
    </div>
  );
}
