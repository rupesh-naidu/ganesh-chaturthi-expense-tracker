import React from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";
import { formatINR, formatRelativeTime } from "../utils/formatters";
import { ArrowRight, Clock } from "lucide-react";

export default function RecentActivity() {
  const { recentTransactions } = useTransactions();

  return (
    <div className="rounded-3xl bg-white border border-amber-200/70 p-5 sm:p-7 shadow-festive">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-gray-900">
            RECENT ACTIVITY
          </h3>
          <span className="text-[11px] font-semibold text-gray-400 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            Latest 5
          </span>
        </div>

        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Empty State */}
      {recentTransactions.length === 0 ? (
        <div className="text-center py-10 px-4">
          <div className="text-4xl mb-2">🐘</div>
          <p className="text-base font-bold text-gray-800">No transactions yet.</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Be the first to add a contribution! 🙏
          </p>
        </div>
      ) : (
        /* Latest 5 List */
        <div className="divide-y divide-amber-100/60">
          {recentTransactions.map((tx) => {
            const isDonation = tx.type === "donation";

            return (
              <div
                key={tx.id}
                className="py-3.5 sm:py-4 flex items-start justify-between gap-3 hover:bg-amber-50/40 px-2 rounded-2xl transition-colors"
              >
                {/* Left Indicator & Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-base sm:text-lg flex-shrink-0 mt-0.5 select-none">
                    {isDonation ? "🟢" : "🔴"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {tx.name}{" "}
                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                        {isDonation ? "donated" : "spent"}
                      </span>{" "}
                      <span
                        className={`font-mono font-bold ${
                          isDonation ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {formatINR(tx.amount)}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate mt-0.5">
                      {tx.description}
                    </p>
                  </div>
                </div>

                {/* Relative Time Stamp */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-400">
                    {formatRelativeTime(tx.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
