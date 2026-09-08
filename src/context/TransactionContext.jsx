import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { INITIAL_TRANSACTIONS } from "../mock/mockData";
import { formatINR } from "../utils/formatters";

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("admin"); // Can be toggled or driven by auth
  const [toasts, setToasts] = useState([]);

  // Toast System
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase credentials not detected; using initial data.");
      setTransactions(INITIAL_TRANSACTIONS);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions.");
      // Fallback to initial transactions on network error
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Derived Financial Metrics (Never manually entered or stored)
  const { totalDonations, totalExpenses, currentHolding } = useMemo(() => {
    let donations = 0;
    let expenses = 0;

    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      if (t.type === "donation") {
        donations += amt;
      } else if (t.type === "expense") {
        expenses += amt;
      }
    }

    return {
      totalDonations: donations,
      totalExpenses: expenses,
      currentHolding: donations - expenses,
    };
  }, [transactions]);

  // Latest 5 Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [transactions]);

  // Add Transaction
  const addTransaction = async (data) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Only Admins can record transactions.");
    }

    const amount = Number(data.amount);
    if (!amount || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    // Client-side quick check
    if (data.type === "expense" && amount > currentHolding) {
      throw new Error(`Insufficient funds. Current holding is ${formatINR(currentHolding)}.`);
    }

    if (isSupabaseConfigured && supabase) {
      const payload = {
        type: data.type,
        name: data.name.trim(),
        amount: amount,
        description: data.description.trim(),
      };

      const { data: newRow, error: insertErr } = await supabase
        .from("transactions")
        .insert([payload])
        .select()
        .single();

      if (insertErr) {
        throw new Error(insertErr.message || "Database failed to save transaction.");
      }

      setTransactions((prev) => [newRow, ...prev]);

      // Show Toast
      if (newRow.type === "donation") {
        addToast({
          type: "donation",
          title: "🟢 New Donation",
          message: `${newRow.name} donated ${formatINR(newRow.amount)}`,
          subMessage: "Thank you for the contribution! 🙏",
        });
      } else {
        addToast({
          type: "expense",
          title: "🔴 New Expense",
          message: `${newRow.name} spent ${formatINR(newRow.amount)}`,
          subMessage: newRow.description,
        });
      }

      return newRow;
    } else {
      // Offline / Local mock fallback
      const localRow = {
        id: `tx-${Date.now()}`,
        type: data.type,
        name: data.name.trim(),
        amount: amount,
        description: data.description.trim(),
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [localRow, ...prev]);
      return localRow;
    }
  };

  // Update Transaction
  const updateTransaction = async (id, updatedData) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Only Admins can edit transactions.");
    }

    const amount = Number(updatedData.amount);
    if (!amount || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    if (isSupabaseConfigured && supabase) {
      const payload = {
        type: updatedData.type,
        name: updatedData.name.trim(),
        amount: amount,
        description: updatedData.description.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRow, error: updateErr } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateErr) {
        throw new Error(updateErr.message || "Database failed to update transaction.");
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedRow : t))
      );

      addToast({
        type: "info",
        title: "Transaction Updated",
        message: `Updated record for ${updatedData.name}`,
      });

      return updatedRow;
    } else {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updatedData, amount, updated_at: new Date().toISOString() }
            : t
        )
      );
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Only Admins can delete transactions.");
    }

    const targetTx = transactions.find((t) => t.id === id);

    if (isSupabaseConfigured && supabase) {
      const { error: deleteErr } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (deleteErr) {
        throw new Error(deleteErr.message || "Database failed to delete transaction.");
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));

      if (targetTx) {
        addToast({
          type: "info",
          title: "Transaction Removed",
          message: `Deleted record of ${formatINR(targetTx.amount)}`,
        });
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleRole = () => {
    setRole((prev) => (prev === "admin" ? "viewer" : "admin"));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        role,
        setRole,
        toggleRole,
        totalDonations,
        totalExpenses,
        currentHolding,
        recentTransactions,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}
