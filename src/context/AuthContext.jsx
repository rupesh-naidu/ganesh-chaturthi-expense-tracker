import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch role from profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch user profile:", error.message);
        setProfile({ role: "devotee" });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile({ role: "devotee" });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured yet.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured yet.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const role = profile?.role || "devotee";
  const isAdmin = role === "admin";
  const isCommittee = role === "committee";
  // Both Admin and Committee have full powers to Add, Edit, Delete transactions:
  const canManageFinance = isAdmin || isCommittee;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isCommittee,
        canManageFinance,
        loading,
        signIn,
        signUp,
        signOut,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}