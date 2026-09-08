import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";
import { LayoutDashboard, Receipt, Shield, ShieldCheck, UserCheck, Plus } from "lucide-react";

export default function Navbar({ onOpenAddModal }) {
  const { role, toggleRole } = useTransactions();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isTransactions = location.pathname === "/transactions";

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-amber-200/70 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-2xl shadow-festive group-hover:scale-105 transition-transform">
              🐘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-gray-950">
                  GANESH CHATURTHI 2026
                </span>
              </div>
              <p className="text-xs font-semibold text-orange-700/90 tracking-wide uppercase">
                Community Fund Ledger
              </p>
            </div>
          </Link>

          {/* Right Navigation & Role Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-amber-50/80 p-1 rounded-xl border border-amber-200/60">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isHome
                    ? "bg-white text-orange-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isTransactions
                    ? "bg-white text-orange-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Transactions
              </Link>
            </nav>

            {/* Quick Add Button for Admin (if modal opener provided) */}
            {role === "admin" && onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-festive hover:shadow-festive-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Record Entry</span>
              </button>
            )}

            {/* Role Switcher Pill (for interactive testing) */}
            <button
              onClick={toggleRole}
              title="Click to toggle between Admin and Viewer role"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                role === "admin"
                  ? "bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {role === "admin" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden xs:inline">Role:</span>
                  <span className="uppercase tracking-wider">ADMIN</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xs:inline">Role:</span>
                  <span className="uppercase tracking-wider">VIEWER</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-amber-200/50 py-2">
          <Link
            to="/"
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
              isHome ? "text-orange-700 bg-orange-100/70" : "text-gray-500"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/transactions"
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
              isTransactions ? "text-orange-700 bg-orange-100/70" : "text-gray-500"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Transactions
          </Link>
        </div>
      </div>
    </header>
  );
}
