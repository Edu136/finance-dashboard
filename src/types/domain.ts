// src/types/domain.ts

export type TransactionType = 'income' | 'expense' | 'investment';
export type TransactionStatus = 'confirmed' | 'pending' | 'cancelled';
export type ThemePref = 'light' | 'dark' | 'system';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;       // ISO 4217 (BRL, USD...)
  locale: string;
  theme: ThemePref;
  provider: 'email' | 'google';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string | null; // null = sistema
  name: string;
  icon: string;           // nome do ícone lucide
  color: string;          // hex #RRGGBB
  type: TransactionType;
  is_system: boolean;
  sort_order: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;           // ISO date
  category_id: string | null;
  status: TransactionStatus;
  is_recurring: boolean;
  recurrence_note: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Visões agregadas vindas do banco
export type MonthlySummary = {
  user_id: string;
  month: string;          // ISO date (primeiro dia do mês)
  total_income: number | null;
  total_expense: number | null;
  total_investment: number | null;
  net_balance: number | null;
  transaction_count: number;
};

export type CategoryTotal = {
  user_id: string;
  month: string;
  type: TransactionType;
  category_name: string;
  category_color: string;
  total: number;
  transaction_count: number;
};

export type BalanceTimelinePoint = {
  month: string;
  income: number;
  expense: number;
  investment: number;
  net: number;
  cumulative_net: number;
};

export type MonthComparison = {
  metric: 'income' | 'expense' | 'investment';
  current_value: number;
  previous_value: number;
  variation_pct: number | null;
};

export type CategoryExpense = {
  category_id: string | null;
  category_name: string;
  category_color: string;
  total: number;
  transaction_count: number;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id: string | null;
  notes: string | null;
  day_of_month: number;
  active: boolean;
  next_due_date: string;
  last_run_at: string | null;
  total_runs: number;
  created_at: string;
  updated_at: string;
};

export type CashflowMonth = {
  month: string;
  income: number;
  expense: number;
  investment: number;
  net: number;
  cumulative_net: number;
};

export type DashboardPeriod = "month" | "30d" | "year" | "all";
