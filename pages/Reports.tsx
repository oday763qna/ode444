
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sparkles, ArrowRight, Zap, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useAppContext } from '../App';

const ReportsPage: React.FC = () => {
  const { t, theme, expenses, goals, incomeSources, currency } = useAppContext();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomeSources.reduce((sum, i) => sum + i.amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const netSavingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  const categoryTotals = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: t(cat),
    value: categoryTotals[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#64748b'];

  const barData = [
    { name: t('income'), amount: totalIncome, fill: '#10b981' },
    { name: t('expenses'), amount: totalSpent, fill: '#f97316' }
  ];

  const insights = [
    { text: `أكبر مصاريفك تذهب لـ ${pieData.sort((a,b)=>b.value-a.value)[0]?.name || 'غير معروف'}.`, icon: <Zap size={14} /> },
    { text: `أنت توفر ${netSavingsRate.toFixed(1)}% من إجمالي دخلك.`, icon: <TrendingUp size={14} /> },
    { text: `تقدم الأهداف: لقد قمت بتوفير ${totalSaved.toLocaleString()} ${currency} حتى الآن.`, icon: <Target size={14} /> },
  ];

  return (
    <div className="space-y-8 pb-24 text-right">
      <div className="px-2">
        <h2 className="text-3xl font-black flex items-center gap-3 justify-end">
          {t('reports')}
          <span className="w-2.5 h-10 bg-blue-500 rounded-full" />
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mr-5">الذكاء المالي</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} group text-right`}>
          <div className="flex items-center gap-2 mb-3 justify-end">
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('income')}</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><TrendingUp size={16} /></div>
          </div>
          <p className="text-2xl font-black text-emerald-500">{totalIncome.toLocaleString()} <span className="text-xs font-bold opacity-30">{currency}</span></p>
        </motion.div>
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className={`p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} group text-right`}>
          <div className="flex items-center gap-2 mb-3 justify-end">
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('expenses')}</p>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl"><TrendingDown size={16} /></div>
          </div>
          <p className="text-2xl font-black text-orange-500">{totalSpent.toLocaleString()} <span className="text-xs font-bold opacity-30">{currency}</span></p>
        </motion.div>
      </div>

      {/* Income vs Expense Bar Chart */}
      <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
        <div className="flex justify-between items-center">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black ${netSavingsRate > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {netSavingsRate > 0 ? '+' : ''}{netSavingsRate.toFixed(1)}% نسبة الادخار
          </div>
          <h3 className="font-black text-sm uppercase tracking-widest opacity-60">نظرة على الرصيد</h3>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, opacity: 0.5 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, opacity: 0.5 }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', border: 'none', textAlign: 'right' }} />
              <Bar dataKey="amount" radius={[15, 15, 15, 15]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
        <h3 className="font-black text-sm uppercase tracking-widest opacity-60 text-right">توزيع المصاريف</h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', textAlign: 'right' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center opacity-10">
              <Zap size={48} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black opacity-50 uppercase tracking-wider">{d.name}</span>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Insights */}
      <div className="space-y-4">
        <h3 className="font-black text-sm px-4 flex items-center gap-2 uppercase tracking-widest opacity-60 justify-end">
          {t('insightText')}
          <Sparkles size={16} className="text-blue-500" />
        </h3>
        <div className="space-y-3 px-2">
          {insights.map((insight, idx) => (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} key={idx} className={`p-5 rounded-3xl border flex items-center gap-5 group transition-transform hover:-translate-x-1 justify-end ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}>
              <p className="text-xs font-bold leading-relaxed opacity-80 text-right">{insight.text}</p>
              <div className={`p-3 rounded-2xl flex-shrink-0 ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>{insight.icon}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
