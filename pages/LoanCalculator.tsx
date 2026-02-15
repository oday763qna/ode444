
import React, { useState, useMemo } from 'react';
// Import AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext, toEnglishDigits } from '../App';

const LoanCalculatorPage: React.FC = () => {
  const { t, theme, lang, currency, threshold } = useAppContext();
  const [inputs, setInputs] = useState({
    price: '',
    downPayment: '',
    monthly: '',
    months: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = toEnglishDigits(value).replace(/[^0-9.]/g, '');
    setInputs(prev => ({ ...prev, [name]: cleanValue }));
  };

  const results = useMemo(() => {
    const price = parseFloat(inputs.price) || 0;
    const down = parseFloat(inputs.downPayment) || 0;
    const monthly = parseFloat(inputs.monthly) || 0;
    const months = parseFloat(inputs.months) || 0;

    if (!price || !monthly || !months) return null;

    const totalPaid = down + (monthly * months);
    const interest = totalPaid - price;
    const interestPercentage = (interest / price) * 100;

    let status = 'good';
    if (interestPercentage > threshold * 2) status = 'overpriced';
    else if (interestPercentage > threshold) status = 'acceptable';

    return {
      totalPaid,
      interest,
      status,
      interestPercentage,
      price,
      valid: true
    };
  }, [inputs, threshold]);

  const chartData = results ? [
    { name: t('price'), value: results.price, color: '#10b981' },
    { name: t('interest'), value: Math.max(0, results.interest), color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-emerald-500 rounded-full" />
          {t('loanCalc')}
        </h2>

        {/* Form */}
        <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-70">{t('price')} ({currency})</label>
            <input 
              type="text" 
              inputMode="decimal"
              name="price" 
              value={inputs.price} 
              onChange={handleChange}
              className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
              placeholder={t('placeholderPrice')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-70">{t('downPayment')} ({currency})</label>
            <input 
              type="text" 
              inputMode="decimal"
              name="downPayment" 
              value={inputs.downPayment} 
              onChange={handleChange}
              className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
              placeholder={t('placeholderDown')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-70">{t('monthlyInstallment')}</label>
              <input 
                type="text" 
                inputMode="decimal"
                name="monthly" 
                value={inputs.monthly} 
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                placeholder={t('placeholderInstallment')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-70">{t('months')}</label>
              <input 
                type="text" 
                inputMode="numeric"
                name="months" 
                value={inputs.months} 
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                placeholder={t('placeholderMonths')}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-3xl border overflow-hidden relative ${
              results.status === 'good' ? 'bg-emerald-500/10 border-emerald-500/20' :
              results.status === 'acceptable' ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-60 font-bold">{t('totalPaid')}</p>
                  <p className="text-2xl font-bold text-emerald-600 truncate">{results.totalPaid.toLocaleString()} <span className="text-sm font-normal">{currency}</span></p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-60 font-bold">{t('interest')}</p>
                  <p className={`text-2xl font-bold truncate ${results.status === 'overpriced' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {results.interest.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className={`px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg ${
                  results.status === 'good' ? 'bg-emerald-500' :
                  results.status === 'acceptable' ? 'bg-amber-500' : 'bg-red-500'
                }`}>{t(results.status)}</div>
                <p className="text-xs opacity-70 font-bold">{results.interestPercentage.toFixed(1)}% {lang === 'ar' ? 'فائدة' : 'interest'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {results && (
          <div className={`h-64 rounded-3xl border flex items-center justify-center relative ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={true}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculatorPage;
