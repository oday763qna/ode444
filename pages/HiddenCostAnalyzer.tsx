
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  History, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Calendar,
  Wallet,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext, toEnglishDigits } from '../App';
import { RegretRecord } from '../types';

const HiddenCostAnalyzer: React.FC = () => {
  const { t, theme, currency, incomeSources, setExpenses, expenses } = useAppContext();
  
  // User Input State
  const [purchaseName, setPurchaseName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(() => incomeSources.reduce((s, i) => s + i.amount, 0).toString());
  const [workHours, setWorkHours] = useState('160'); // Default monthly work hours
  const [yearlyMaint, setYearlyMaint] = useState('0');
  const [monthlySub, setMonthlySub] = useState('0');
  const [lifespan, setLifespan] = useState('5');

  // Regret records from App State/LocalStorage
  const [regretRecords, setRegretRecords] = useState<RegretRecord[]>(() => 
    JSON.parse(localStorage.getItem('regretRecords') || '[]')
  );

  useEffect(() => {
    localStorage.setItem('regretRecords', JSON.stringify(regretRecords));
  }, [regretRecords]);

  // Pure Logic Calculations (The Engine)
  const results = useMemo(() => {
    const price = parseFloat(toEnglishDigits(purchasePrice)) || 0;
    const income = parseFloat(toEnglishDigits(monthlyIncome)) || 0;
    const hours = parseFloat(toEnglishDigits(workHours)) || 1;
    const maint = parseFloat(toEnglishDigits(yearlyMaint)) || 0;
    const sub = parseFloat(toEnglishDigits(monthlySub)) || 0;
    const life = parseInt(toEnglishDigits(lifespan)) || 1;

    // 1. Total Life Cost Calculation
    const totalSubs = sub * 12 * life;
    const totalMaint = maint * life;
    const totalCost = price + totalSubs + totalMaint;
    const avgYearly = life > 0 ? totalCost / life : totalCost;

    // 2. Time Value Calculation
    const hourlyRate = income > 0 ? income / hours : 0;
    const workHoursEquivalent = hourlyRate > 0 ? totalCost / hourlyRate : 0;

    // 3. Risk Level
    let risk: 'low' | 'medium' | 'high' = 'low';
    const impactRatio = income > 0 ? totalCost / income : 0;
    if (impactRatio > 1.5) risk = 'high';
    else if (impactRatio > 0.5) risk = 'medium';

    // 4. Chart Data
    const chartData = [];
    for (let i = 0; i <= life; i++) {
      chartData.push({
        year: `السنة ${i}`,
        cost: price + (maint * i) + (sub * 12 * i)
      });
    }

    return { totalCost, avgYearly, workHoursEquivalent, risk, chartData };
  }, [purchasePrice, monthlyIncome, workHours, yearlyMaint, monthlySub, lifespan]);

  const handleSave = () => {
    const price = parseFloat(toEnglishDigits(purchasePrice));
    if (!purchaseName || isNaN(price)) return;

    const newExpense = {
      id: Math.random().toString(36).substr(2, 9),
      name: purchaseName,
      amount: price,
      category: 'shopping',
      date: new Date().toISOString(),
      hiddenCostData: {
        yearlyMaintenance: parseFloat(yearlyMaint),
        monthlySubscription: parseFloat(monthlySub),
        lifespanYears: parseInt(lifespan),
        isRecurringConfirmed: true
      }
    };

    setExpenses([newExpense, ...expenses]);

    // Schedule Regret Record (7 days later logic)
    const newRegret: RegretRecord = {
      expenseId: newExpense.id,
      expenseName: newExpense.name,
      category: newExpense.category,
      date: new Date().toISOString(),
      regretStatus: null,
      notified: false
    };
    setRegretRecords([newRegret, ...regretRecords]);

    alert("تم حفظ المشتريات وتحليلها بنجاح!");
  };

  const handleRegretResponse = (id: string, status: 'regret' | 'happy') => {
    setRegretRecords(prev => prev.map(r => r.expenseId === id ? { ...r, regretStatus: status } : r));
  };

  // Check for items older than 7 days that need checking
  const pendingRegrets = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return regretRecords.filter(r => r.regretStatus === null && new Date(r.date) < weekAgo);
  }, [regretRecords]);

  const regretStats = useMemo(() => {
    const totalChecked = regretRecords.filter(r => r.regretStatus !== null).length;
    const regretted = regretRecords.filter(r => r.regretStatus === 'regret').length;
    return totalChecked > 0 ? (regretted / totalChecked) * 100 : 0;
  }, [regretRecords]);

  return (
    <div className="space-y-6 pb-20 text-right" dir="rtl">
      <div className="px-2">
        <h2 className="text-2xl font-black flex items-center gap-3 justify-end">
          {t('hiddenCostAnalyzer')}
          <span className="w-2 h-8 bg-orange-500 rounded-full" />
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mr-5">تحليل المشتريات والوقت الضائع</p>
      </div>

      {/* Inputs Section */}
      <div className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('name')}</label>
            <input 
              type="text" 
              value={purchaseName} 
              onChange={e => setPurchaseName(e.target.value)}
              className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-right"
              placeholder="مثال: سيارة، آيفون..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('amount')} ({currency})</label>
            <input 
              type="text" 
              inputMode="decimal" 
              value={purchasePrice} 
              onChange={e => setPurchasePrice(e.target.value)}
              className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-black outline-none focus:ring-2 focus:ring-orange-500 transition-all text-right"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('hcMonthlyIncome')}</label>
            <input 
              type="text" 
              inputMode="decimal" 
              value={monthlyIncome} 
              onChange={e => setMonthlyIncome(e.target.value)}
              className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-right"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('hcWorkingHours')}</label>
            <input 
              type="text" 
              inputMode="numeric" 
              value={workHours} 
              onChange={e => setWorkHours(e.target.value)}
              className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-right"
            />
          </div>
        </div>

        <div className="pt-4 border-t dark:border-slate-700 space-y-4">
          <p className="text-[10px] font-black opacity-60 uppercase text-center">تكاليف المستقبل</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('hcYearlyMaint')}</label>
              <input type="text" inputMode="decimal" value={yearlyMaint} onChange={e => setYearlyMaint(e.target.value)} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-right" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('hcMonthlySub')}</label>
              <input type="text" inputMode="decimal" value={monthlySub} onChange={e => setMonthlySub(e.target.value)} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-right" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black opacity-40 uppercase px-2">{t('hcLifespan')}</label>
            <input type="text" inputMode="numeric" value={lifespan} onChange={e => setLifespan(e.target.value)} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold text-right" />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
        >
          {t('calculate')} و {t('save')}
        </button>
      </div>

      {/* Result Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <p className="text-[10px] font-black opacity-40 uppercase mb-1">{t('hcTotalLifeCost')}</p>
          <h4 className="text-xl font-black text-orange-500">{results.totalCost.toLocaleString()} <span className="text-[10px] opacity-40">{currency}</span></h4>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <p className="text-[10px] font-black opacity-40 uppercase mb-1">{t('hcWorkHoursEquiv')}</p>
          <div className="flex items-center gap-2 justify-end">
             <h4 className="text-xl font-black text-blue-500">{Math.round(results.workHoursEquivalent)}</h4>
             <Clock size={16} className="text-blue-500 opacity-40" />
          </div>
        </motion.div>
      </div>

      {/* Time Impact Message */}
      <div className={`p-5 rounded-3xl border ${results.risk === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-600' : results.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'} flex items-center gap-4`}>
        <div className="p-3 bg-white/20 rounded-2xl"><Briefcase size={24} /></div>
        <p className="text-xs font-black leading-tight">
          {t('hcTimeMessage').replace('{hours}', Math.round(results.workHoursEquivalent).toString())}
        </p>
      </div>

      {/* Projection Chart */}
      <div className={`p-6 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="font-black text-xs opacity-50 uppercase tracking-widest mb-6 text-center">{t('hcChartTitle')}</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.chartData}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="cost" stroke="#f97316" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regret System */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase">
             معدل الندم: {regretStats.toFixed(0)}%
          </div>
          <h3 className="font-black text-xs opacity-60 uppercase tracking-widest">{t('hcRegretTitle')}</h3>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {pendingRegrets.map(item => (
              <motion.div 
                key={item.expenseId}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`p-6 rounded-[2rem] border-2 border-dashed ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <p className="text-xs font-black text-center mb-4">{t('hcRegretPrompt').replace('{name}', item.expenseName)}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRegretResponse(item.expenseId, 'regret')}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> {t('hcRegretYes')}
                  </button>
                  <button 
                    onClick={() => handleRegretResponse(item.expenseId, 'happy')}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> {t('hcRegretNo')}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {pendingRegrets.length === 0 && (
            <div className="py-8 text-center opacity-20 border-2 border-dashed rounded-3xl">
              <History size={40} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase">لا توجد مشتريات تحتاج للفحص حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenCostAnalyzer;
