import React, { createContext, useContext, useState, useMemo } from "react";
import { INITIAL_TRANSACTIONS } from "../mock/mockData";
import { formatINR } from "../utils/formatters";

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [role, setRole] = useState("admin"); // "admin" or "viewer"
  const [toasts, setToasts] = useState([]);

  // Toast Management
  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Strictly Derived Financial Metrics (NEVER manually edited)
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

  // Recent 5 Transactions ordered by created_at DESC
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [transactions]);

  // Add Transaction with Expense Protection
  const addTransaction = (data) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Viewers cannot create transactions.");
    }

    const amount = Number(data.amount);
    if (!amount || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    // Expense protection: forbid negative balance
    if (data.type === "expense" && amount > currentHolding) {
      throw new Error(`Insufficient funds. Current holding is ${formatINR(currentHolding)}.`);
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      type: data.type,
      name: data.name.trim(),
      amount: amount,
      description: data.description.trim(),
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Visually appealing toast notification
    if (newTx.type === "donation") {
      addToast({
        type: "donation",
        title: "🟢 New Donation",
        message: `${newTx.name} donated ${formatINR(newTx.amount)}`,
        subMessage: "Thank you for the contribution! 🙏",
      });
    } else {
      addToast({
        type: "expense",
        title: "🔴 New Expense",
        message: `${newTx.name} spent ${formatINR(newTx.amount)}`,
        subMessage: newTx.description,
      });
    }

    return newTx;
  };

  // Edit Transaction with Financial Integrity & Balance Validation
  const updateTransaction = (id, updatedData) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Viewers cannot edit transactions.");
    }

    const amount = Number(updatedData.amount);
    if (!amount || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    // Calculate hypothetical balance if this edit is applied
    let hypDonations = 0;
    let hypExpenses = 0;

    for (const t of transactions) {
      if (t.id === id) {
        if (updatedData.type === "donation") hypDonations += amount;
        else hypExpenses += amount;
      } else {
        if (t.type === "donation") hypDonations += Number(t.amount);
        else hypExpenses += Number(t.amount);
      }
    }

    if (hypDonations - hypExpenses < 0) {
      throw new Error(
        `Insufficient funds. This change would result in a negative holding balance (${formatINR(hypDonations - hypExpenses)}).`
      );
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              type: updatedData.type,
              name: updatedData.name.trim(),
              amount: amount,
              description: updatedData.description.trim(),
              updated_at: new Date().toISOString(),
            }
          : t
      )
    );

    addToast({
      type: "info",
      title: "Transaction Updated",
      message: `Updated record for ${updatedData.name}`,
    });
  };

  // Delete Transaction with Negative Balance Prevention
  const deleteTransaction = (id) => {
    if (role !== "admin") {
      throw new Error("Unauthorized: Viewers cannot delete transactions.");
    }

    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return;

    // If deleting a donation, ensure remaining donations cover total expenses
    if (targetTx.type === "donation") {
      const remainingDonations = totalDonations - Number(targetTx.amount);
      if (remainingDonations < totalExpenses) {
        throw new Error(
          `Cannot delete this donation. Current expenses (${formatINR(totalExpenses)}) would exceed the remaining funds (${formatINR(remainingDonations)}).`
        );
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    addToast({
      type: "info",
      title: "Transaction Removed",
      message: `Deleted transaction of ${formatINR(targetTx.amount)}`,
    });
  };

  const toggleRole = () => {
    setRole((prev) => (prev === "admin" ? "viewer" : "admin"));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        role,
        setRole,
        toggleRole,
        totalDonations,
        totalExpenses,
        currentHolding,
        recentTransactions,
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
