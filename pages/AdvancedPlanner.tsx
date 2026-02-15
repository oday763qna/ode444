
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  HelpCircle, 
  Info, 
  Zap, 
  ChevronRight, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAppContext, toEnglishDigits } from '../App';

const AdvancedPlannerPage: React.FC = () => {
  const { t, theme, currency, incomeSources } = useAppContext();
  
  // States
  const totalIncome = useMemo(() => incomeSources.reduce((sum, i) => sum + i.amount, 0), [incomeSources]);
  const [invAmount, setInvAmount] = useState('');
  const [allocation, setAllocation] = useState({ expenses: 50, savings: 30, investment: 20 });
  const [roiInputs, setRoiInputs] = useState({ principal: '', rate: '10', years: '5' });

  // 1. Investment Share Logic
  const invSharePct = useMemo(() => {
    const inv = parseFloat(toEnglishDigits(invAmount)) || 0;
    return totalIncome > 0 ? (inv / totalIncome) * 100 : 0;
  }, [invAmount, totalIncome]);

  // 2. Budget Allocation Data
  const allocationData = useMemo(() => [
    { name: t('expenses'), value: allocation.expenses, color: '#f97316' },
    { name: t('savings'), value: allocation.savings, color: '#a855f7' },
    { name: t('investment'), value: allocation.investment, color: '#3b82f6' },
  ], [allocation, t]);

  // 3. Expected ROI Calculation (Compound Interest)
  const roiData = useMemo(() => {
    const P = parseFloat(toEnglishDigits(roiInputs.principal)) || 0;
    const r = parseFloat(toEnglishDigits(roiInputs.rate)) / 100 || 0;
    const t_years = parseInt(toEnglishDigits(roiInputs.years)) || 0;
    
    const data = [];
    for (let i = 0; i <= t_years; i++) {
      const amount = P * Math.pow(1 + r, i);
      data.push({ year: `سنة ${i}`, value: Math.round(amount) });
    }
    return data;
  }, [roiInputs]);

  // 4. Financial Balance Analysis
  const balanceAnalysis = useMemo(() => {
    const plannedTotal = (totalIncome * (allocation.expenses + allocation.savings + allocation.investment)) / 100;
    const isOverBudget = plannedTotal > totalIncome;
    return { plannedTotal, isOverBudget };
  }, [totalIncome, allocation]);

  return (
    <div className="space-y-8 pb-20 text-right">
      <div className="px-2">
        <h2 className="text-3xl font-black flex items-center gap-3 justify-end">
          {t('advancedPlanner')}
          <span className="w-2.5 h-10 bg-blue-500 rounded-full" />
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mr-5">تحليل وتخطيط مالي معمق</p>
      </div>

      {/* --- 1. Investment Share Section --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}
      >
        <div className="flex items-center gap-3 justify-end">
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60">الحصة الاستثمارية</h3>
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><TrendingUp size={18} /></div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-40 px-3 tracking-widest">مبلغ الاستثمار الحالي</label>
          <input 
            type="text" 
            inputMode="decimal"
            value={invAmount}
            onChange={(e) => setInvAmount(e.target.value)}
            className={`w-full p-5 rounded-3xl border-2 outline-none font-black text-2xl transition-all focus:border-blue-500 text-right ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`} 
            placeholder="0.00" 
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-3xl border border-blue-500/10">
          <div className="text-left">
            <p className="text-[10px] font-black opacity-40 uppercase">الحالة</p>
            <p className={`text-xs font-bold ${invSharePct >= 20 ? 'text-emerald-500' : 'text-blue-500'}`}>
              {invSharePct >= 20 ? 'ممتاز' : 'جيد، حاول الزيادة'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black opacity-40 uppercase">من إجمالي الدخل</p>
            <h4 className="text-2xl font-black text-blue-500">{invSharePct.toFixed(1)}%</h4>
          </div>
        </div>
      </motion.div>

      {/* --- 2. Smart Budget Allocation Section --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}
      >
        <div className="flex items-center gap-3 justify-end">
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60">{t('allocation')}</h3>
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><Briefcase size={18} /></div>
        </div>

        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', textAlign: 'right' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">توزيع</span>
            <span className="text-lg font-black">{totalIncome > 0 ? totalIncome.toLocaleString() : '0'}</span>
          </div>
        </div>

        {/* Sliders Area (What-If Analysis Integration) */}
        <div className="space-y-6 pt-4">
          {[
            { key: 'expenses', label: t('expenses'), color: 'accent-orange-500', icon: <Wallet size={14} /> },
            { key: 'savings', label: t('savings'), color: 'accent-purple-500', icon: <PiggyBank size={14} /> },
            { key: 'investment', label: t('investment'), color: 'accent-blue-500', icon: <TrendingUp size={14} /> },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black">{allocation[item.key as keyof typeof allocation]}%</span>
                <span className="text-xs font-bold opacity-60 flex items-center gap-2">{item.label} {item.icon}</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={allocation[item.key as keyof typeof allocation]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAllocation({ ...allocation, [item.key]: val });
                }}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 ${item.color}`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* --- 3. Expected ROI Calculator --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}
      >
        <div className="flex items-center gap-3 justify-end">
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60">توقعات نمو الاستثمار</h3>
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><BarChart3 size={18} /></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 px-2 uppercase">مبلغ الاستثمار</label>
            <input type="text" inputMode="decimal" value={roiInputs.principal} onChange={e => setRoiInputs({...roiInputs, principal: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-800 font-bold text-right" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 px-2 uppercase">العائد السنوي %</label>
            <input type="text" inputMode="decimal" value={roiInputs.rate} onChange={e => setRoiInputs({...roiInputs, rate: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-800 font-bold text-right text-emerald-500" placeholder="10" />
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="year" hide />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, opacity: 0.5 }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', border: 'none', textAlign: 'right' }} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#10b981" barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
          <div className="flex justify-between items-center">
            <span className="text-xl font-black text-emerald-500">{roiData[roiData.length-1]?.value.toLocaleString()} <span className="text-xs">{currency}</span></span>
            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">المبلغ المتوقع بعد {roiInputs.years} سنوات</span>
          </div>
        </div>
      </motion.div>

      {/* --- 4. Financial Balance Overview --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}
      >
        <div className="flex items-center gap-3 justify-end">
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60">التوازن المالي</h3>
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><ShieldCheck size={18} /></div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold px-1">
            <span>{((allocation.expenses + allocation.savings + allocation.investment)).toFixed(0)}%</span>
            <span className="opacity-50 tracking-wide uppercase">مجموع التوزيع المخطط له</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min(100, (allocation.expenses + allocation.savings + allocation.investment))}%` }} 
              className={`h-full ${balanceAnalysis.isOverBudget ? 'bg-red-500' : 'bg-amber-500'}`} 
            />
          </div>
          
          {balanceAnalysis.isOverBudget && (
            <div className="p-3 bg-red-500/10 rounded-2xl flex items-center gap-2 border border-red-500/20 text-red-500">
              <Zap size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">تحذير: التوزيع المخطط يتجاوز الدخل المتاح!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- 5. Smart Insights --- */}
      <div className="space-y-4">
        <h3 className="font-black text-sm px-4 flex items-center gap-2 uppercase tracking-widest opacity-60 justify-end">
          {t('insightText')}
          <Sparkles size={16} className="text-blue-500" />
        </h3>
        <div className="px-2">
          <div className={`p-5 rounded-3xl border flex items-center gap-5 justify-end ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}>
            <p className="text-xs font-bold leading-relaxed opacity-80 text-right">
              {allocation.savings < 20 ? 'توصية: ارفع نسبة الادخار إلى 20% لتأمين صندوق الطوارئ الخاص بك.' : 'تخطيطك ممتاز! أنت تلتزم بمعايير الادخار الصحية.'}
            </p>
            <div className={`p-3 rounded-2xl bg-blue-500/10 text-blue-500 flex-shrink-0`}>
              <Info size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Subcomponents or Icons can be added here
const Sparkles = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
  </svg>
);

export default AdvancedPlannerPage;
