const now = new Date();

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx-1",
    type: "donation",
    name: "Ravi",
    amount: 1000,
    description: "Ganesh Chaturthi contribution",
    created_at: new Date(now.getTime() - 1000 * 20).toISOString(), // 20s ago
  },
  {
    id: "tx-2",
    type: "expense",
    name: "Suresh",
    amount: 2500,
    description: "Flowers and decoration",
    created_at: new Date(now.getTime() - 1000 * 60 * 12).toISOString(), // 12m ago
  },
  {
    id: "tx-3",
    type: "donation",
    name: "Anil",
    amount: 500,
    description: "Contribution",
    created_at: new Date(now.getTime() - 1000 * 60 * 25).toISOString(), // 25m ago
  },
  {
    id: "tx-4",
    type: "donation",
    name: "Priya",
    amount: 2000,
    description: "Contribution",
    created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1h ago
  },
  {
    id: "tx-5",
    type: "expense",
    name: "Rahul",
    amount: 800,
    description: "Pooja materials",
    created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(), // 2h ago
  },
  {
    id: "tx-6",
    type: "expense",
    name: "Vikram (Decorator)",
    amount: 14000,
    description: "Mandap & Tent decoration advance",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(), // 18h ago
  },
  {
    id: "tx-7",
    type: "donation",
    name: "Society Building A & B",
    amount: 25000,
    description: "Collective wing donation",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "tx-8",
    type: "expense",
    name: "Sound System Vendor",
    amount: 6450,
    description: "Audio speakers and lighting rental",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(), // 1.2 days ago
  },
  {
    id: "tx-9",
    type: "donation",
    name: "Anand Sharma",
    amount: 44000,
    description: "Principal idol sponsor contribution",
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
  },
];
