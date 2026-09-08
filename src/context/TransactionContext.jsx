import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { INITIAL_TRANSACTIONS } from "../mock/mockData";
import { formatINR } from "../utils/formatters";

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const { user, role: authRole, canManageFinance: authCanManage } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoRole, setDemoRole] = useState("admin");
  const [toasts, setToasts] = useState([]);

  // Determine effective role & permissions
  const role = user ? authRole : demoRole;
  const canManageFinance = user ? authCanManage : (demoRole === "admin" || demoRole === "committee");

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
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Fetch on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Supabase Realtime Listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("public:transactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          console.log("⚡ Realtime event received:", payload.eventType, payload);

          if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            setTransactions((prev) => {
              if (prev.some((t) => t.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });

            if (newRow.type === "donation") {
              addToast({
                type: "donation",
                title: "🟢 New Donation",
                message: `${newRow.name} donated ${formatINR(newRow.amount)}`,
                subMessage: "Thank you for the contribution! 🙏",
              });
            } else if (newRow.type === "expense") {
              addToast({
                type: "expense",
                title: "🔴 New Expense",
                message: `${newRow.name} spent ${formatINR(newRow.amount)}`,
                subMessage: newRow.description,
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new;
            setTransactions((prev) =>
              prev.map((t) => (t.id === updatedRow.id ? updatedRow : t))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
            } else {
              fetchTransactions();
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log("⚡ Realtime subscription status:", status, err || "");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast, fetchTransactions]);

  // Purely Derived Financial Metrics
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

  // Add Transaction (Admin or Committee)
  const addTransaction = async (data) => {
    if (!canManageFinance) {
      throw new Error("Unauthorized: Only Admin and Committee members can record transactions.");
    }

    const amount = Number(data.amount);
    if (!amount || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    if (data.type === "expense" && amount > currentHolding) {
      throw new Error(`Insufficient funds. Current holding is ${formatINR(currentHolding)}.`);
    }

    if (isSupabaseConfigured && supabase) {
      const payload = {
        type: data.type,
        name: data.name.trim(),
        amount: amount,
        description: data.description.trim(),
        created_by: user?.id || null,
      };

      const { data: newRow, error: insertErr } = await supabase
        .from("transactions")
        .insert([payload])
        .select()
        .single();

      if (insertErr) {
        console.error("Supabase insert error:", insertErr);
        throw new Error(insertErr.message || "Database failed to save transaction.");
      }

      setTransactions((prev) => {
        if (prev.some((t) => t.id === newRow.id)) return prev;
        return [newRow, ...prev];
      });

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

  // Update Transaction (Admin or Committee)
  const updateTransaction = async (id, updatedData) => {
    if (!canManageFinance) {
      throw new Error("Unauthorized: Only Admin and Committee members can edit transactions.");
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
        updated_by: user?.id || null,
      };

      const { data: updatedRow, error: updateErr } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateErr) {
        console.error("Supabase update error:", updateErr);
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

  // Delete Transaction (Admin or Committee)
  const deleteTransaction = async (id) => {
    if (!canManageFinance) {
      throw new Error("Unauthorized: Only Admin and Committee members can delete transactions.");
    }

    const targetTx = transactions.find((t) => t.id === id);

    if (isSupabaseConfigured && supabase) {
      const { error: deleteErr } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (deleteErr) {
        console.error("Supabase delete error:", deleteErr);
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
    setDemoRole((prev) => (prev === "admin" ? "devotee" : "admin"));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        role,
        canManageFinance,
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