
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export interface ExpenseEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}

export interface BillParticipant {
  id: string;
  name: string;
  paid: number;
}
