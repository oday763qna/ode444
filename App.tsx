
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Calculator, Users, Wallet, PiggyBank, BarChart3, Settings as SettingsIcon, Info, Grid, TrendingUp, Zap, Clock, RefreshCw } from 'lucide-react';
import { Language, Theme, ExpenseEntry, SavingsGoal, IncomeEntry } from './types';
import { TRANSLATIONS } from './constants';

import HomePage from './pages/Home';
import LoanCalculatorPage from './pages/LoanCalculator';
import BillSplitterPage from './pages/BillSplitter';
import BudgetTrackerPage from './pages/BudgetTracker';
import SavingsPlannerPage from './pages/SavingsPlanner';
import ReportsPage from './pages/Reports';
import AboutUsPage from './pages/AboutUs';
import SettingsPage from './pages/Settings';
import WelcomePage from './pages/Welcome';
import GeneralCalculationsPage from './pages/GeneralCalculations';
import WheelGamePage from './pages/WheelGame';
import AdvancedPlannerPage from './pages/AdvancedPlanner';
import FutureSimulatorPage from './pages/FutureSimulator';
import HiddenCostAnalyzer from './pages/HiddenCostAnalyzer';
import LiveConverterPage from './pages/LiveConverter';

interface AppContextType {
  lang: Language;
  theme: Theme;
  setTheme: (t: Theme) => void;
  currency: string;
  setCurrency: (c: string) => void;
  threshold: number;
  setThreshold: (n: number) => void;
  expenses: ExpenseEntry[];
  setExpenses: (e: ExpenseEntry[]) => void;
  incomeSources: IncomeEntry[];
  setIncomeSources: (i: IncomeEntry[]) => void;
  goals: SavingsGoal[];
  setGoals: (g: SavingsGoal[]) => void;
  t: (key: string) => string;
  finishOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

export const toEnglishDigits = (str: string) => {
  if (!str) return "";
  return str.toString().replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, theme } = useAppContext();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <HomeIcon size={20} />, label: t('home') },
    { path: '/budget', icon: <Wallet size={20} />, label: t('budget') },
    { path: '/live-converter', icon: <RefreshCw size={20} />, label: t('liveConverter') },
    { path: '/reports', icon: <BarChart3 size={20} />, label: t('reports') },
    { path: '/settings', icon: <SettingsIcon size={20} />, label: t('settings') },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 overflow-x-hidden`} dir="rtl">
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">OD</div>
            <h1 className="text-base font-bold tracking-tight">{t('appName')}</h1>
          </div>
          <Link to="/about" className="p-2 opacity-50 hover:opacity-100 transition-opacity">
            <Info size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full pb-20 pt-14 relative overflow-x-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-4 w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center w-full gap-0.5 transition-all duration-200 relative ${isActive ? 'text-emerald-500' : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <motion.div whileTap={{ scale: 0.85 }} className={`p-1.5 rounded-lg ${isActive ? (theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50') : ''}`}>
                  {item.icon}
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-tight text-center px-1">{item.label}</span>
                {isActive && <motion.div layoutId="navDot" className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'JD');
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem('threshold')) || 15);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => JSON.parse(localStorage.getItem('expenses') || '[]'));
  const [incomeSources, setIncomeSources] = useState<IncomeEntry[]>(() => JSON.parse(localStorage.getItem('incomeSources') || '[]'));
  const [goals, setGoals] = useState<SavingsGoal[]>(() => JSON.parse(localStorage.getItem('goals') || '[]'));
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('onboarded') === 'true');

  const lang: Language = 'ar'; // Forced to Arabic

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('currency', currency);
    localStorage.setItem('threshold', threshold.toString());
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('incomeSources', JSON.stringify(incomeSources));
    localStorage.setItem('goals', JSON.stringify(goals));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, currency, threshold, expenses, incomeSources, goals]);

  const finishOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setIsOnboarded(true);
  };

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  if (!isOnboarded) {
    return (
      <AppContext.Provider value={{ lang, theme, setTheme, currency, setCurrency, threshold, setThreshold, expenses, setExpenses, incomeSources, setIncomeSources, goals, setGoals, t, finishOnboarding }}>
        <WelcomePage />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ lang, theme, setTheme, currency, setCurrency, threshold, setThreshold, expenses, setExpenses, incomeSources, setIncomeSources, goals, setGoals, t, finishOnboarding }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/loan" element={<LoanCalculatorPage />} />
            <Route path="/bill" element={<BillSplitterPage />} />
            <Route path="/budget" element={<BudgetTrackerPage />} />
            <Route path="/savings" element={<SavingsPlannerPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/general" element={<GeneralCalculationsPage />} />
            <Route path="/wheel" element={<WheelGamePage />} />
            <Route path="/advanced-planner" element={<AdvancedPlannerPage />} />
            <Route path="/future-simulator" element={<FutureSimulatorPage />} />
            <Route path="/hidden-cost" element={<HiddenCostAnalyzer />} />
            <Route path="/live-converter" element={<LiveConverterPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
