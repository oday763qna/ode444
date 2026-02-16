
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Filter, 
  Calendar,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { useAppContext } from '../App';
import { ExpenseEntry, RecurringDetection, SimulationPoint } from '../types';

const FutureSimulatorPage: React.FC = () => {
  const { t, theme, expenses, incomeSources, currency } = useAppContext();
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);

  // 1. Calculate Statistics
  const stats = useMemo(() => {
    const totalIncome = incomeSources.reduce((sum, i) => sum + i.amount, 0);
    
    // Filter out excluded categories for simulation
    const activeExpenses = expenses.filter(e => !excludedCategories.includes(e.category));
    
    // Monthly Average Calculation (assuming expenses are over a reasonable recent window)
    const totalSpent = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const uniqueMonths = new Set(expenses.map(e => e.date.substring(0, 7))).size || 1;
    const avgMonthlySpending = totalSpent / uniqueMonths;
    const monthlyNet = totalIncome - avgMonthlySpending;

    // 2. Detect Recurring Expenses
    const categoryGroups: Record<string, number[]> = {};
    expenses.forEach(e => {
      if (!categoryGroups[e.category]) categoryGroups[e.category] = [];
      categoryGroups[e.category].push(e.amount);
    });

    const recurring: RecurringDetection[] = Object.entries(categoryGroups).map(([cat, amounts]) => {
      if (amounts.length < 2) return { category: cat, avgAmount: amounts[0], count: 1, isRecurring: false };
      
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      // Variance check: Are all amounts within 10% of average?
      const isConsistent = amounts.every(amt => Math.abs(amt - avg) / avg <= 0.1);
      
      return {
        category: cat,
        avgAmount: avg,
        count: amounts.length,
        isRecurring: isConsistent
      };
    }).filter(r => r.isRecurring);

    return { totalIncome, avgMonthlySpending, monthlyNet, recurring };
  }, [expenses, incomeSources, excludedCategories]);

  // 3. Generate Projection Data
  const chartData = useMemo(() => {
    const months = 6;
    const data: SimulationPoint[] = [];
    const currentBalance = stats.totalIncome - stats.avgMonthlySpending; // Start from current month net as base

    for (let i = 0; i <= months; i++) {
      const monthLabel = `M+${i}`;
      
      data.push({
        month: monthLabel,
        baseline: Math.max(0, currentBalance + (stats.monthlyNet * i)),
        frugal: Math.max(0, currentBalance + ((stats.totalIncome - (stats.avgMonthlySpending * 0.9)) * i)),
        inflated: Math.max(0, currentBalance + ((stats.totalIncome - (stats.avgMonthlySpending * 1.1)) * i))
      });
    }
    return data;
  }, [stats]);

  const riskLevel = useMemo(() => {
    if (stats.monthlyNet < 0) return 'danger';
    if (stats.monthlyNet < stats.totalIncome * 0.1) return 'warning';
    return 'safe';
  }, [stats]);

  const toggleCategory = (cat: string) => {
    setExcludedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="space-y-6 pb-20 text-right" dir="rtl">
      <div className="px-2">
        <h2 className="text-2xl font-black flex items-center gap-3 justify-end">
          {t('futureSimulator')}
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mr-5">توقعات ذكية لستة أشهر قادمة</p>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <p className="text-[10px] font-black opacity-40 uppercase mb-1">{t('simCurrentAvg')}</p>
          <div className="flex items-center gap-1 justify-end">
            <h4 className="text-xl font-black">{stats.avgMonthlySpending.toLocaleString()}</h4>
            <span className="text-xs opacity-30">{currency}</span>
          </div>
        </div>
        <div className={`p-5 rounded-[2rem] border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
          <p className="text-[10px] font-black text-blue-500 uppercase mb-1">{t('simProjected6m')}</p>
          <div className="flex items-center gap-1 justify-end">
            <h4 className="text-xl font-black text-blue-600">
              {chartData[chartData.length - 1].baseline.toLocaleString()}
            </h4>
            <span className="text-xs text-blue-400">{currency}</span>
          </div>
        </div>
      </div>

      {/* Risk Alert */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-3xl flex items-center gap-4 border ${
            riskLevel === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
            riskLevel === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
          }`}
        >
          <div className="p-2 rounded-xl bg-white/20">
            {riskLevel === 'danger' ? <AlertTriangle size={24} /> : 
             riskLevel === 'warning' ? <Zap size={24} /> : 
             <CheckCircle2 size={24} />}
          </div>
          <p className="text-xs font-black leading-tight flex-1">
            {riskLevel === 'danger' ? t('simRiskWarning') : 
             riskLevel === 'warning' ? t('simRiskModerate') : 
             t('simRiskSafe')}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Projection Chart */}
      <div className={`p-6 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Calendar size={20} /></div>
          <h3 className="font-black text-xs opacity-50 uppercase tracking-widest">توقعات التراكم المالي</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
              <Line name={t('simBaseline')} type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
              <Line name={t('simFrugal')} type="monotone" dataKey="frugal" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line name={t('simInflated')} type="monotone" dataKey="inflated" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recurring Costs Analysis */}
      <div className="space-y-4">
        <h3 className="font-black text-xs px-2 flex items-center gap-2 uppercase tracking-widest opacity-60 justify-end">
          {t('simRecurringTitle')}
          <Filter size={14} className="text-blue-500" />
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {stats.recurring.length === 0 ? (
            <div className="p-10 text-center opacity-10">
              <Info size={40} className="mx-auto mb-2" />
              <p className="text-xs font-bold">لم نكتشف تكاليف متكررة كافية بعد</p>
            </div>
          ) : (
            stats.recurring.map((item, idx) => (
              <motion.div 
                key={idx}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCategory(item.category)}
                className={`p-5 rounded-[2rem] border flex items-center justify-between transition-all ${
                  excludedCategories.includes(item.category) 
                    ? 'opacity-40 border-slate-200 bg-slate-100 line-through' 
                    : theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${excludedCategories.includes(item.category) ? 'bg-slate-300' : 'bg-blue-500/10 text-blue-500'}`}>
                      {excludedCategories.includes(item.category) ? <TrendingDown size={14} /> : <ArrowUpRight size={14} />}
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-black">{t(item.category) || item.category}</p>
                     <p className="text-[9px] font-bold opacity-40">{item.count} دفعات مكتشفة</p>
                   </div>
                </div>
                
                <div className="text-left">
                   <p className="font-black text-sm">{item.avgAmount.toLocaleString()} {currency}</p>
                   <p className="text-[9px] font-bold text-blue-500">{t('simExcludeRecurring')}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Helpful Tip Footer */}
      <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 justify-end">
            نصيحة المحاكي <Zap size={12} />
          </p>
          <p className="text-xs font-medium leading-relaxed opacity-70">
            {stats.monthlyNet > 0 
              ? `إذا استمريت على هذا المسار، ستصل لمدخرات بقيمة ${chartData[chartData.length - 1].baseline.toLocaleString()} ${currency} خلال 6 أشهر. استثمر الفائض!` 
              : "مسارك الحالي يستنزف مدخراتك. حاول استبعاد بعض 'التكاليف المتكررة' من القائمة أعلاه لترى كيف يتحسن رصيدك المتوقع."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FutureSimulatorPage;
