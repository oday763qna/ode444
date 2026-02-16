
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calculator, Users, Wallet, PiggyBank, Sparkles, TrendingUp, Lightbulb, Grid, Dices, BarChart3, Zap, Clock, RefreshCw } from 'lucide-react';
import { useAppContext } from '../App';
import { TIPS } from '../constants';

const HomePage: React.FC = () => {
  const { t, theme, expenses, currency } = useAppContext();
  const [tip, setTip] = useState({ en: "", ar: "" });

  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const menuItems = [
    { path: '/live-converter', icon: <RefreshCw size={28} />, label: t('liveConverter'), color: 'emerald', sub: 'أسعار العملات، الذهب، النفط، والبيتكوين' },
    { path: '/hidden-cost', icon: <Clock size={28} />, label: t('hiddenCostAnalyzer'), color: 'orange', sub: 'حلل تكلفة المشتريات والوقت الضائع' },
    { path: '/future-simulator', icon: <Zap size={28} />, label: t('futureSimulator'), color: 'blue', sub: 'محاكاة لـ 6 أشهر وكشف التكاليف الثابتة' },
    { path: '/advanced-planner', icon: <TrendingUp size={28} />, label: t('advancedPlanner'), color: 'purple', sub: 'توزيع ذكي وتوقعات النمو' },
    { path: '/budget', icon: <Wallet size={28} />, label: t('budget'), color: 'orange', sub: 'راقب مصاريفك اليومية' },
    { path: '/savings', icon: <PiggyBank size={28} />, label: t('savings'), color: 'emerald', sub: 'خطط لمستقبلك المالي' },
    { path: '/loan', icon: <Calculator size={28} />, label: t('loanCalc'), color: 'pink', sub: 'قيم صفقاتك بدقة' },
    { path: '/bill', icon: <Users size={28} />, label: t('billSplit'), color: 'blue', sub: 'قسم التكاليف مع أصدقائك' },
    { path: '/wheel', icon: <Dices size={28} />, label: t('wheelGame'), color: 'amber', sub: 'دولاب الحظ للدفع' },
    { path: '/general', icon: <Grid size={28} />, label: t('generalCalc'), color: 'slate', sub: 'عمولات، تجارة، والمزيد' },
  ];

  return (
    <div className="space-y-6 pb-20 text-right">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{t('tagline')}</h2>
          <p className="text-xs opacity-50 font-medium">أدر أموالك كالمحترفين</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Sparkles size={20} className="animate-pulse" />
        </div>
      </motion.div>

      {/* Tip of the Day Card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-5 rounded-3xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
        <div className="p-2 bg-white/20 rounded-xl"><Lightbulb size={24} /></div>
        <div className="flex-1 text-right">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">{t('tipOfDay')}</h4>
          <p className="text-sm font-bold leading-tight">{tip.ar}</p>
        </div>
      </motion.div>

      {/* Quick Summary Card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} flex items-center gap-4`}>
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500"><TrendingUp size={24} /></div>
        <div className="text-right flex-1">
          <h4 className="text-sm font-bold opacity-70">النشاط الأخير</h4>
          <p className="text-lg font-black">{totalSpent > 0 ? `${totalSpent.toLocaleString()} ${currency} تم صرفها` : 'لا توجد مصاريف مسجلة بعد'}</p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, idx) => (
          <motion.div key={item.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }} className={idx === 0 ? "col-span-2" : ""}>
            <Link to={item.path} className={`group block p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden h-full ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
              <div className={`p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110 ${
                item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                item.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                item.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                item.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                item.color === 'pink' ? 'bg-pink-500/10 text-pink-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{item.label}</h3>
              <p className="text-[10px] opacity-40 leading-tight">{item.sub}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
