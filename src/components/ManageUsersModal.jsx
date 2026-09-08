import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { X, Users, ShieldCheck, UserCheck, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function ManageUsersModal({ isOpen, onClose }) {
  const { user, fetchProfile } = useAuth();
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
      setError(err.message || "Failed to load registered users.");
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

  const handleRoleChange = async (targetId, newRole) => {
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

      setSuccess(`Role updated to ${newRole.toUpperCase()} successfully!`);

      // Refresh current user's profile if self updated
      if (targetId === user?.id) {
        await fetchProfile(user.id);
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err.message || "Failed to change user role.");
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
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Committee Role Management
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Grant Admin permissions to authorized committee members
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

          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <span>Registered Members ({profiles.length})</span>
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
              <span className="text-xs font-semibold">Loading committee members...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              No registered profiles found in database.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {profiles.map((p) => {
                const isSelf = p.id === user?.id;
                const isAdmin = p.role === "admin";
                const isBusy = updatingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">
                          {p.email || "No email provided"}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            You
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block text-[11px] font-bold uppercase mt-1 px-2.5 py-0.5 rounded-full border ${
                          isAdmin
                            ? "bg-orange-50 border-orange-200 text-orange-800"
                            : "bg-gray-100 border-gray-200 text-gray-600"
                        }`}
                      >
                        {isAdmin ? "Admin (Full Access)" : "Viewer (Read Only)"}
                      </span>
                    </div>

                    {/* Role Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <button
                          onClick={() => handleRoleChange(p.id, "viewer")}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : "Demote to Viewer"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(p.id, "admin")}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-festive active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : "Promote to Admin"}
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