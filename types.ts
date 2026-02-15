
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export interface IncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
}

// Added optional notes property to ExpenseEntry to support detailed tracking in BudgetTracker
export interface ExpenseEntry {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  monthlyContribution: number;
  deadline?: string;
}

export interface BillParticipant {
  id: string;
  name: string;
  paid: number;
}