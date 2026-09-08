import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  UserCheck,
  Plus,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar({ onOpenAddModal }) {
  const { role: mockRole, setRole: setMockRole } = useTransactions();
  const { user, profile, role: authRole, signOut } = useAuth();
  const location = useLocation();

  // Active role: if user is logged in, use auth role from Supabase; otherwise use current state
  const effectiveRole = user ? authRole : mockRole;

  const isHome = location.pathname === "/";
  const isTransactions = location.pathname === "/transactions";
  const isLogin = location.pathname === "/login";

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

          {/* Right Navigation & Auth Actions */}
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

            {/* Quick Add Button for Admin */}
            {effectiveRole === "admin" && onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-festive hover:shadow-festive-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Record Entry</span>
              </button>
            )}

            {/* Role / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border shadow-sm ${
                    effectiveRole === "admin"
                      ? "bg-orange-50 border-orange-300 text-orange-800"
                      : "bg-emerald-50 border-emerald-300 text-emerald-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline">Role:</span>
                  <span className="uppercase">{effectiveRole}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Viewer badge */}
                <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>VIEWER</span>
                </div>

                {/* Admin Login Button */}
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                    isLogin
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white border-amber-300 text-orange-800 hover:bg-amber-50"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </Link>
              </div>
            )}
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
