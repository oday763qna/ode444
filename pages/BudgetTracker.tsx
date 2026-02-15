
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Add Wallet to lucide-react imports
import { Plus, X, Utensils, Car, ShoppingBag, Receipt, MoreHorizontal, Trash2, Wallet } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';

const BudgetTrackerPage: React.FC = () => {
  const { t, theme, currency, expenses, setExpenses } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');

  const categories = [
    { id: 'food', icon: <Utensils size={18} />, label: t('food'), color: 'emerald' },
    { id: 'transport', icon: <Car size={18} />, label: t('transport'), color: 'blue' },
    { id: 'shopping', icon: <ShoppingBag size={18} />, label: t('shopping'), color: 'orange' },
    { id: 'bills', icon: <Receipt size={18} />, label: t('bills'), color: 'purple' },
    { id: 'other', icon: <MoreHorizontal size={18} />, label: t('other'), color: 'slate' },
  ];

  const addExpense = () => {
    const cleanAmount = parseFloat(toEnglishDigits(amount));
    if (cleanAmount > 0) {
      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        amount: cleanAmount,
        category,
        date: new Date().toISOString(),
      };
      setExpenses([newEntry, ...expenses]);
      setAmount('');
      setShowAdd(false);
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-orange-500 rounded-full" />
          {t('budget')}
        </h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)} className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform"><Plus size={28} /></motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`p-6 rounded-3xl border mb-4 overflow-hidden shadow-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">New Expense</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`0.00 ${currency}`}
                className={`w-full p-5 rounded-2xl border font-black text-3xl text-center focus:ring-4 focus:ring-orange-500/20 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${category === c.id ? 'bg-orange-500 text-white shadow-lg scale-105' : theme === 'dark' ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={addExpense} className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-500/20 transition-all">{t('calculate')}</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-20 opacity-20 flex flex-col items-center">
            <Wallet size={64} />
            <p className="font-bold mt-4">Start tracking your spending</p>
          </div>
        ) : (
          expenses.map(exp => {
            const cat = categories.find(c => c.id === exp.category) || categories[4];
            return (
              <motion.div layout key={exp.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-2xl border flex items-center justify-between group ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    cat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                    cat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                    cat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                    cat.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>{cat.icon}</div>
                  <div>
                    <h4 className="font-bold text-sm">{cat.label}</h4>
                    <p className="text-[10px] opacity-40">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm">{exp.amount.toLocaleString()} {currency}</span>
                  <button onClick={() => deleteExpense(exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTrackerPage;
