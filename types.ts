
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

export interface ExpenseEntry {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  hiddenCostData?: HiddenCostData;
}

export interface HiddenCostData {
  yearlyMaintenance: number;
  monthlySubscription: number;
  lifespanYears: number;
  isRecurringConfirmed: boolean;
}

export interface RegretRecord {
  expenseId: string;
  expenseName: string;
  category: string;
  date: string;
  regretStatus: 'regret' | 'happy' | null;
  notified: boolean;
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

// Converter Types
export interface MarketRate {
  code: string;
  rate: number; // Against USD
  type: 'currency' | 'commodity' | 'crypto';
  nameAr: string;
  nameEn: string;
  icon?: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

// Simulation Types
export interface SimulationPoint {
  month: string;
  baseline: number;
  frugal: number;
  inflated: number;
}

export interface RecurringDetection {
  category: string;
  avgAmount: number;
  count: number;
  isRecurring: boolean;
}
