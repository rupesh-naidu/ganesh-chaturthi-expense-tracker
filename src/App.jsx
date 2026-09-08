import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionModal from "./components/TransactionModal";

function AppContent() {
  const [isNavAddModalOpen, setIsNavAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Dynamic Toast Notifications */}
      <ToastContainer />

      {/* Navbar with Role Switcher & Modal trigger */}
      <Navbar onOpenAddModal={() => setIsNavAddModalOpen(true)} />

      {/* Main App Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Add Modal (triggered from Navbar on desktop) */}
      <TransactionModal
        isOpen={isNavAddModalOpen}
        onClose={() => setIsNavAddModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-amber-200/70 bg-white/60 py-6 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-700">
            गणेश चतुर्थी २०२६ • उत्सव निधी व्यवस्थापन
          </p>
          <p className="text-gray-400">
            Production-Grade Community Ledger • Powered by React & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TransactionProvider>
      <Router>
        <AppContent />
      </Router>
    </TransactionProvider>
  );
}
