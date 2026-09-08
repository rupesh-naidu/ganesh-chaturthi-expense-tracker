import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CheckCircle2, Sparkles, IndianRupee, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import { formatINR } from "./utils/formatters";

function Phase1Welcome() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between p-4 sm:p-6 md:p-10">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-amber-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-festive">
            🐘
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              GANESH CHATURTHI 2026
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                Phase 1 Verified
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Community Fund & Ledger Tracker</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Vite + Tailwind + React Ready
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-4xl mx-auto w-full my-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-festive border border-amber-100/80 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Phase 1 Foundation Complete
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Project Setup Successful & Running
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            The foundation for the <strong>Ganesh Chaturthi Donation & Expense Tracker</strong> has been established in your project folder with React, Vite, Tailwind CSS with the festive color palette, React Router, and Lucide icons.
          </p>

          {/* Currency Formatter & Theme verification preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50/70 border border-orange-200/70 rounded-2xl p-4">
              <span className="text-xs font-medium text-orange-700 block mb-1">TEST CURRENT HOLDING</span>
              <span className="text-2xl font-bold text-orange-950 font-mono">
                {formatINR(48750)}
              </span>
              <span className="text-[11px] text-orange-600/80 block mt-1">Available money right now</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-700 mb-1">
                <span>TOTAL DONATIONS</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl font-bold text-emerald-950 font-mono">
                {formatINR(72500)}
              </span>
              <span className="text-[11px] text-emerald-600/80 block mt-1">Indian formatting: ₹72,500</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-rose-700 mb-1">
                <span>TOTAL SPENT</span>
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xl font-bold text-rose-950 font-mono">
                {formatINR(23750)}
              </span>
              <span className="text-[11px] text-rose-600/80 block mt-1">Indian formatting: ₹23,750</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="border-t border-amber-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Phase 1 Deliverables Checked
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>React 19 + Vite 8 scaffolded</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tailwind CSS configured with festive theme</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Lucide React icons & React Router v6 integrated</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Indian Rupee (<span className="font-mono">₹</span>) formatting utility ready</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Mobile-first responsive layout verified</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero database dependencies yet (ready for Phase 2 UI)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Phase 2 Preview Callout */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-festive flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base flex items-center gap-2">
              Next Up: Phase 2 — Dashboard UI with Mock Data
            </h4>
            <p className="text-orange-100 text-xs sm:text-sm mt-0.5">
              Complete UI with Hero Holding Card, Recent 5 Activities, Add Transaction modal with validations, and full Transaction History page.
            </p>
          </div>
          <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-default">
            Ready for your confirmation
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 border-t border-amber-100/60 pt-4">
        Ganesh Chaturthi Community Fund • Production-Grade Digital Financial Ledger
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Phase1Welcome />} />
      </Routes>
    </Router>
  );
}
