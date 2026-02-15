
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAppContext } from '../App';

const ReportsPage: React.FC = () => {
  const { t, theme, expenses, goals, currency } = useAppContext();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);

  const categoryTotals = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: t(cat),
    value: categoryTotals[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#64748b'];

  const insights = [
    { text: `Your biggest expense is ${pieData.sort((a,b)=>b.value-a.value)[0]?.name || 'unknown'}.`, icon: <Zap size={14} /> },
    { text: `You've saved ${totalSaved.toLocaleString()} {currency} toward goals!`, icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="w-2 h-8 bg-blue-500 rounded-full" />
        {t('reports')}
      </h2>

      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-bold uppercase opacity-50 mb-1">{t('expenses')}</p>
          <p className="text-xl font-black text-orange-500">{totalSpent.toLocaleString()} <span className="text-xs font-bold">{currency}</span></p>
        </div>
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Total {t('savings')}</p>
          <p className="text-xl font-black text-emerald-500">{totalSaved.toLocaleString()} <span className="text-xs font-bold">{currency}</span></p>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
        <h3 className="font-bold text-sm">Expense Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm px-2 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          {t('insightText')}
        </h3>
        {insights.map((insight, idx) => (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} key={idx} className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">{insight.icon}</div>
            <p className="text-xs font-medium opacity-80">{insight.text.replace('{currency}', currency)}</p>
            <ArrowRight size={14} className="ml-auto opacity-20" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
