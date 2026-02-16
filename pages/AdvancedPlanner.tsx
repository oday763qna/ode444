
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PiggyBank, 
  Target, 
  Calendar, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight,
  ArrowRightCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../App';

const AdvancedPlannerPage: React.FC = () => {
  const { t, theme, currency, goals } = useAppContext();
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [boostAmount, setBoostAmount] = useState(0);

  const activeGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId) || null
  , [goals, selectedGoalId]);

  const analysis = useMemo(() => {
    if (!activeGoal) return null;
    
    const target = activeGoal.target;
    const current = activeGoal.current;
    const remaining = target - current;
    const progress = (current / target) * 100;
    
    const monthly = activeGoal.monthlyContribution || 0;
    const boostedMonthly = monthly + boostAmount;
    
    const monthsLeftNormal = monthly > 0 ? Math.ceil(remaining / monthly) : Infinity;
    const monthsLeftBoosted = boostedMonthly > 0 ? Math.ceil(remaining / boostedMonthly) : Infinity;
    
    const timeSaved = monthsLeftNormal !== Infinity && monthsLeftBoosted !== Infinity 
      ? monthsLeftNormal - monthsLeftBoosted 
      : 0;

    return { 
      target, 
      current, 
      remaining, 
      progress, 
      monthsLeftNormal, 
      monthsLeftBoosted, 
      timeSaved,
      monthly,
      boostedMonthly
    };
  }, [activeGoal, boostAmount]);

  if (goals.length === 0) {
    return (
      <div className="py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-500">
          <PiggyBank size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black">لا توجد أهداف للتحليل</h3>
          <p className="text-sm opacity-50 px-10">قم بإضافة أهداف في صفحة "مخطط الادخار" أولاً لنتمكن من حساب المتبقي لك.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-right">
      <div className="px-2">
        <h2 className="text-2xl font-black flex items-center gap-3 justify-end">
          توقعات الادخار الذكية
          <span className="w-2 h-8 bg-purple-500 rounded-full" />
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mr-5">كم بقي لك وكيف تصل أسرع؟</p>
      </div>

      {/* Goal Selector */}
      <div className="px-2">
        <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} flex items-center gap-3 overflow-x-auto no-scrollbar`}>
          {goals.map(g => (
            <button 
              key={g.id} 
              onClick={() => setSelectedGoalId(g.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                selectedGoalId === g.id 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-100 dark:bg-slate-900 opacity-40'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div 
            key={selectedGoalId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Main Result Card: Remaining Focus */}
            <div className={`p-8 rounded-[3rem] relative overflow-hidden text-white bg-gradient-to-br from-purple-600 to-indigo-800 shadow-2xl shadow-purple-500/20`}>
              <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
                <Target size={180} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-[10px] font-black opacity-60 uppercase">النسبة المكتملة</p>
                    <h4 className="text-2xl font-black">{analysis.progress.toFixed(0)}%</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black opacity-60 uppercase">{t('remainingAmount')}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <h3 className="text-4xl font-black tracking-tighter">
                        {analysis.remaining.toLocaleString()}
                      </h3>
                      <span className="text-lg font-bold opacity-30">{currency}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${analysis.progress}%` }} 
                    className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">تحت الحساب</span>
                  </div>
                  <p className="text-[11px] font-bold opacity-50">الهدف: {analysis.target.toLocaleString()} {currency}</p>
                </div>
              </div>
            </div>

            {/* Time Estimation */}
            <div className="grid grid-cols-2 gap-4 px-1">
              <div className={`p-5 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} text-right space-y-2`}>
                <div className="flex items-center gap-2 justify-end text-purple-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">شهور متبقية</span>
                  <Clock size={16} />
                </div>
                <h4 className="text-2xl font-black">
                  {analysis.monthsLeftNormal === Infinity ? '∞' : analysis.monthsLeftNormal}
                </h4>
              </div>
              <div className={`p-5 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} text-right space-y-2`}>
                <div className="flex items-center gap-2 justify-end text-emerald-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">توفير الوقت</span>
                  <Zap size={16} />
                </div>
                <h4 className="text-2xl font-black text-emerald-500">
                  {analysis.timeSaved > 0 ? `${analysis.timeSaved} شهر` : '-'}
                </h4>
              </div>
            </div>

            {/* Boost Simulator (What-If) */}
            <div className={`p-6 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} space-y-6`}>
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase">مُحاكي الدعم</div>
                <h3 className="font-black text-sm uppercase tracking-widest opacity-60">ماذا لو ادخرت أكثر؟</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm font-black text-purple-500">+{boostAmount.toLocaleString()} {currency}</span>
                  <span className="text-xs font-bold opacity-40">دعم شهري إضافي</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={analysis.monthly * 2 || 1000} 
                  step="10"
                  value={boostAmount}
                  onChange={(e) => setBoostAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <AnimatePresence>
                {analysis.timeSaved > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4 text-right"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-600">رائع! ستصل لهدفك أسرع بـ <span className="text-lg font-black">{analysis.timeSaved}</span> أشهر!</p>
                      <p className="text-[9px] opacity-60 font-bold mt-1 uppercase tracking-wider">سيتقلص الانتظار إلى {analysis.monthsLeftBoosted} شهر فقط</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-emerald-500 shadow-sm">
                      <Sparkles size={20} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Smart Insight */}
            <div className="px-2">
              <div className={`p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4 text-right`}>
                <div className="flex-1 space-y-1">
                  <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                    رؤية ذكية <AlertCircle size={12} />
                  </h5>
                  <p className="text-xs font-medium leading-relaxed opacity-70">
                    {analysis.progress < 20 
                      ? "أنت في البداية، ركز على الثبات في الادخار الشهري لرفع الزخم." 
                      : analysis.progress > 80 
                        ? "أنت على وشك الوصول! أي مبلغ إضافي الآن سيختصر أسابيع من الانتظار."
                        : "أداؤك جيد، الاستمرار هو مفتاح النجاح المالي."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedPlannerPage;
