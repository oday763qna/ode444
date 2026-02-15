
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, PiggyBank, Plus, X, Trash2 } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';

const SavingsPlannerPage: React.FC = () => {
  const { t, theme, currency, goals, setGoals } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', current: '' });

  const addGoal = () => {
    const targetVal = parseFloat(toEnglishDigits(form.target));
    const currentVal = parseFloat(toEnglishDigits(form.current));
    if (form.name && targetVal > 0) {
      const newGoal = {
        id: Math.random().toString(36).substr(2, 9),
        name: form.name,
        target: targetVal,
        current: currentVal || 0,
      };
      setGoals([...goals, newGoal]);
      setForm({ name: '', target: '', current: '' });
      setShowAdd(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-purple-500 rounded-full" />
          {t('savings')}
        </h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)} className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 transition-transform"><Plus size={28} /></motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className={`p-6 rounded-3xl border mb-6 overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">New Saving Goal</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-50 px-2">{t('goalName')}</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full p-4 rounded-2xl border focus:ring-4 focus:ring-purple-500/20 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="e.g. Dream Car, House..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-2">{t('targetAmount')}</label>
                  <input type="text" inputMode="decimal" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className={`w-full p-4 rounded-2xl border focus:ring-4 focus:ring-purple-500/20 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-2">{t('savedSoFar')}</label>
                  <input type="text" inputMode="decimal" value={form.current} onChange={e => setForm({...form, current: e.target.value})} className={`w-full p-4 rounded-2xl border focus:ring-4 focus:ring-purple-500/20 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="0.00" />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={addGoal} className="w-full py-5 bg-purple-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-purple-500/20 transition-all">Set Goal</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-20 opacity-20 flex flex-col items-center">
            <PiggyBank size={64} />
            <p className="font-bold mt-4">Save for your dreams</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            return (
              <motion.div layout key={goal.id} className={`p-5 rounded-3xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Target size={20} /></div>
                    <h3 className="font-black text-lg">{goal.name}</h3>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                
                <div className="flex justify-between text-xs font-black mb-1 opacity-60">
                  <span>{progress.toFixed(0)}% Complete</span>
                  <span>{goal.current.toLocaleString()} / {goal.target.toLocaleString()} {currency}</span>
                </div>
                
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                </div>

                <AnimatePresence>
                  {progress < 100 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-purple-500/5 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg"><PiggyBank size={18} className="text-purple-500" /></div>
                      <span className="text-[10px] font-black opacity-80 leading-tight">
                        To finish in 1 month, save <span className="text-purple-500">{( (goal.target - goal.current) / 4).toFixed(1)} {currency}</span> per week.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsPlannerPage;
