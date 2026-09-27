import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { signIn, signUp, user, signOut } = useAuth();
  const { displayRole } = useTransactions();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in
  if (user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-amber-200 shadow-festive text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mx-auto">
          🐘
        </div>
        <h2 className="text-xl font-black text-gray-900">Already Authenticated</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Logged in as <strong>{user.email}</strong>
        </p>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
          Role: {displayRole}
        </div>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-festive transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => signOut()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate("/");
      } else {
        const res = await signUp(email.trim(), password);
        if (res?.user && !res?.session) {
          setInfoMessage("Registration submitted! Please check your email to confirm your account (or sign in if email confirmation is disabled in Supabase).");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 animate-fade-in px-4">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-orange-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-festive-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header (Prompt Section 18) */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-3xl shadow-festive mx-auto mb-3">
            🐘
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            GANESH CHATURTHI
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mt-0.5">
            Expense Tracker Authentication
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-amber-50 p-1 rounded-2xl border border-amber-200/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setInfoMessage("");
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "signin"
                ? "bg-white text-orange-950 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setInfoMessage("");
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "signup"
                ? "bg-white text-orange-950 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ganeshchaturthi.org"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-festive active:scale-[0.98] disabled:opacity-60 transition-all mt-2"
          >
            {isSubmitting
              ? "Authenticating..."
              : mode === "signin"
              ? "Login"
              : "Register Account"}
          </button>
        </form>

        {/* Security / Role Callout */}
        <div className="mt-6 pt-4 border-t border-amber-100 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            Protected by Supabase Auth & PostgreSQL Row Level Security (RLS).
          </p>
          {mode === "signup" && (
            <p className="text-[11px] text-orange-700 font-semibold mt-1">
              New accounts start as <strong>DEVOTEES</strong>. A committee administrator can grant committee access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
