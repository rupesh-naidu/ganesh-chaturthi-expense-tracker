import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { X, Users, ShieldCheck, UserCheck, Loader2, AlertCircle, RefreshCw, Crown, Shield } from "lucide-react";

export default function ManageUsersModal({ isOpen, onClose }) {
  const { user, isAdmin, fetchProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfiles = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: true });

      if (err) throw err;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error loading profiles:", err);
      setError(err.message || "Failed to load registered members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetId, newRole, targetEmail) => {
    setUpdatingId(targetId);
    setError("");
    setSuccess("");

    try {
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetId);

      if (updateErr) throw updateErr;

      setProfiles((prev) =>
        prev.map((p) => (p.id === targetId ? { ...p, role: newRole } : p))
      );

      setSuccess(
        newRole === "committee"
          ? `Promoted ${targetEmail} to Committee Member! They can now record & edit transactions.`
          : `Demoted ${targetEmail} to Devotee (Read-only).`
      );

      if (targetId === user?.id) {
        await fetchProfile(user.id);
      }
    } catch (err) {
      console.error("Error updating role:", err);
      if (err.message && err.message.includes("profiles_role_check")) {
        setError(
          "Database constraint error: The 3-tier role migration has not been run in your Supabase SQL Editor. Please run the SQL script in Supabase to allow 'committee' and 'devotee' roles."
        );
      } else {
        setError(err.message || "Failed to change user role.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl">
              👑
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Festival Committee Roles</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Admin controls: Promote Devotees to Committee members
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              {success}
            </div>
          )}

          {/* Role Hierarchy Legend */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs space-y-1.5 text-gray-700">
            <div className="font-bold text-orange-950">Role Permissions Guide:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="font-bold text-orange-800 block">👑 ADMIN (You)</span>
                Full tracker control + promote/demote powers.
              </div>
              <div className="bg-white p-2 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 block">🛡️ COMMITTEE</span>
                Can Add, Edit & Delete all financial records.
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block">🙏 DEVOTEE</span>
                Read-only transparent view of the fund.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 pb-1 border-b border-gray-100">
            <span>Registered Devotees & Committee ({profiles.length})</span>
            <button
              onClick={loadProfiles}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-xs font-semibold">Loading members...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              No registered profiles found yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {profiles.map((p) => {
                const isSelf = p.id === user?.id;
                const isUserAdmin = p.role === "admin";
                const isUserCommittee = p.role === "committee";
                const isUserDevotee = p.role === "devotee" || p.role === "viewer" || !p.role;
                const isBusy = updatingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">
                          {p.email || "No email"}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            You
                          </span>
                        )}
                      </div>

                      {/* Badge */}
                      <span
                        className={`inline-block text-[11px] font-extrabold uppercase mt-1 px-2.5 py-0.5 rounded-full border ${
                          isUserAdmin
                            ? "bg-amber-100 border-amber-300 text-amber-900"
                            : isUserCommittee
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}
                      >
                        {isUserAdmin
                          ? "👑 Admin (Lead)"
                          : isUserCommittee
                          ? "🛡️ Committee Member"
                          : "🙏 Devotee (Registered)"}
                      </span>
                    </div>

                    {/* Action buttons (Only for non-admin accounts) */}
                    <div className="flex items-center gap-2">
                      {isUserAdmin ? (
                        <span className="text-xs font-semibold text-amber-800 italic px-2">
                          Main Organizer
                        </span>
                      ) : isUserCommittee ? (
                        <button
                          onClick={() => handleRoleChange(p.id, "devotee", p.email)}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : "Demote to Devotee"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(p.id, "committee", p.email)}
                          disabled={isBusy}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isBusy ? "Promoting..." : "Promote to Committee"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-50/50 border-t border-amber-100 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}