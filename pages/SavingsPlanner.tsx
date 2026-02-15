
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, PiggyBank, Plus, X, Trash2, Calendar, TrendingUp, Sparkles, Trophy, Star } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';

const SavingsPlannerPage: React.FC = () => {
  const { t, theme, currency, goals, setGoals } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', current: '', monthly: '' });

  const addGoal = () => {
    const targetVal = parseFloat(toEnglishDigits(form.target));
    const currentVal = parseFloat(toEnglishDigits(form.current));
    const monthlyVal = parseFloat(toEnglishDigits(form.monthly));
    
    if (form.name && targetVal > 0) {
      const newGoal = {
        id: Math.random().toString(36).substr(2, 9),
        name: form.name,
        target: targetVal,
        current: currentVal || 0,
        monthlyContribution: monthlyVal || 0
      };
      setGoals([...goals, newGoal]);
      setForm({ name: '', target: '', current: '', monthly: '' });
      setShowAdd(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <span className="w-2.5 h-10 bg-purple-500 rounded-full" />
            {t('savings')}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ml-5">الطموحات المالية</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={() => setShowAdd(true)} 
          className="w-14 h-14 rounded-3xl bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-500/30"
        >
          <Plus size={32} />
        </motion.button>
      </div>

      {/* Summary Insights */}
      {goals.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute -bottom-6 -left-6 opacity-10"><TrendingUp size={140} /></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('savedSoFar')}</p>
              <h3 className="text-3xl font-black">{goals.reduce((s, g) => s + g.current, 0).toLocaleString()} <span className="text-sm font-normal opacity-50">{currency}</span></h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className={`w-full max-w-lg p-10 rounded-[3rem] relative shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-white/5' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">إعداد هدف جديد</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-3 tracking-widest">{t('goalName')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full p-5 rounded-3xl border-2 outline-none font-bold transition-all focus:border-purple-500 text-right ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="مثال: آيفون جديد، سفر..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-50 px-3 tracking-widest">{t('targetAmount')}</label>
                    <input type="text" inputMode="decimal" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className={`w-full p-5 rounded-3xl border-2 outline-none font-black text-xl transition-all focus:border-purple-500 text-right ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-50 px-3 tracking-widest">{t('savedSoFar')}</label>
                    <input type="text" inputMode="decimal" value={form.current} onChange={e => setForm({...form, current: e.target.value})} className={`w-full p-5 rounded-3xl border-2 outline-none font-black text-xl transition-all focus:border-purple-500 text-right ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-3 tracking-widest">{t('monthlySave')}</label>
                  <input type="text" inputMode="decimal" value={form.monthly} onChange={e => setForm({...form, monthly: e.target.value})} className={`w-full p-5 rounded-3xl border-2 outline-none font-bold transition-all focus:border-purple-500 text-right ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="كم يمكنك توفيره شهرياً؟" />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={addGoal} className="w-full py-5 bg-purple-500 text-white rounded-3xl font-black text-xl shadow-2xl shadow-purple-500/30 mt-4 transition-all">إطلاق الهدف</motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6 px-1">
        {goals.length === 0 ? (
          <div className="text-center py-32 opacity-10 flex flex-col items-center">
            <PiggyBank size={100} className="stroke-1" />
            <p className="font-black mt-6 uppercase tracking-widest">لا توجد أهداف محددة</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            const remaining = goal.target - goal.current;
            const monthsRemaining = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

            return (
              <motion.div layout key={goal.id} className={`p-8 rounded-[3rem] border group relative overflow-hidden transition-all hover:shadow-2xl ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                {/* Milestone Badge for high progress */}
                {progress >= 80 && progress < 100 && (
                  <div className="absolute top-6 left-16 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full flex items-center gap-1.5 border border-amber-500/10">
                    <Star size={10} className="fill-current" />
                    <span className="text-[8px] font-black uppercase tracking-wider">على وشك الوصول</span>
                  </div>
                )}
                {progress === 100 && (
                  <div className="absolute top-6 left-16 px-3 py-1 bg-emerald-500 text-white rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                    <Trophy size={10} />
                    <span className="text-[8px] font-black uppercase tracking-wider">{t('milestone')}</span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${progress === 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      <Target size={28} />
                    </div>
                    <div className="space-y-0.5 text-right">
                      <h3 className="font-black text-xl tracking-tight">{goal.name}</h3>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">تحقيق الأهداف</p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                
                <div className="flex justify-between text-[11px] font-black mb-3 opacity-60 uppercase tracking-widest px-1">
                  <span className={progress === 100 ? 'text-emerald-500' : 'text-purple-500'}>{progress.toFixed(0)}% مكتمل</span>
                  <span className="text-slate-400">{goal.current.toLocaleString()} / {goal.target.toLocaleString()} {currency}</span>
                </div>
                
                <div className="w-full h-5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 2, ease: "circOut" }} className={`h-full relative ${progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-right">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest justify-end">
                      {t('monthlySave')} <TrendingUp size={12} />
                    </div>
                    <p className="text-lg font-black text-purple-500">{goal.monthlyContribution.toLocaleString()} <span className="text-xs">{currency}</span></p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-right">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest justify-end">
                      {t('monthsLeft')} <Calendar size={12} />
                    </div>
                    <p className="text-lg font-black text-emerald-500">{monthsRemaining !== null ? monthsRemaining : '∞'}</p>
                  </div>
                </div>

                {progress < 100 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-blue-500/5 rounded-2xl flex items-start gap-3 border border-blue-500/5 text-right">
                    <div className="ml-auto space-y-1">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 justify-end">
                        {t('smartTip')} <Sparkles size={14} />
                      </p>
                      <p className="text-[11px] font-medium leading-relaxed opacity-70">
                        {goal.monthlyContribution > 0 ? t('saveFaster') : 'حدد مساهمة شهرية لرؤية وقت الإنجاز المتوقع!'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsPlannerPage;
