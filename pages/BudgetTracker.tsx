
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Utensils, Car, ShoppingBag, Receipt, MoreHorizontal, Trash2, Wallet, PlusCircle, Edit3, ArrowUpRight, ArrowDownRight, AlertCircle, Calendar } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';
import { ExpenseEntry, IncomeEntry } from '../types';

const BudgetTrackerPage: React.FC = () => {
  const { t, theme, currency, expenses, setExpenses, incomeSources, setIncomeSources } = useAppContext();
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const categories = [
    { id: 'food', icon: <Utensils size={18} />, label: t('food'), color: 'emerald' },
    { id: 'transport', icon: <Car size={18} />, label: t('transport'), color: 'blue' },
    { id: 'shopping', icon: <ShoppingBag size={18} />, label: t('shopping'), color: 'orange' },
    { id: 'bills', icon: <Receipt size={18} />, label: t('bills'), color: 'purple' },
    { id: 'other', icon: <MoreHorizontal size={18} />, label: t('other'), color: 'slate' },
  ];

  const totalIncome = useMemo(() => incomeSources.reduce((sum, i) => sum + i.amount, 0), [incomeSources]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const balance = totalIncome - totalExpenses;

  const handleSave = () => {
    const cleanAmount = parseFloat(toEnglishDigits(amount));
    if (!name || isNaN(cleanAmount)) return;

    if (activeTab === 'expenses') {
      if (editId) {
        setExpenses(expenses.map(e => e.id === editId ? { ...e, name, amount: cleanAmount, category, notes } : e));
      } else {
        setExpenses([{ id: Math.random().toString(36).substr(2, 9), name, amount: cleanAmount, category, date: new Date().toISOString(), notes }, ...expenses]);
      }
    } else {
      if (editId) {
        setIncomeSources(incomeSources.map(i => i.id === editId ? { ...i, name, amount: cleanAmount } : i));
      } else {
        setIncomeSources([{ id: Math.random().toString(36).substr(2, 9), name, amount: cleanAmount, date: new Date().toISOString() }, ...incomeSources]);
      }
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setName('');
    setAmount('');
    setCategory('food');
    setNotes('');
    setIsRecurring(false);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setAmount(item.amount.toString());
    if ('category' in item) setCategory(item.category);
    if ('notes' in item) setNotes(item.notes || '');
    setShowModal(true);
  };

  const deleteItem = (id: string) => {
    if (activeTab === 'expenses') setExpenses(expenses.filter(e => e.id !== id));
    else setIncomeSources(incomeSources.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-900'}`}>
        <div className="absolute top-0 left-0 p-8 opacity-5"><Wallet size={160} /></div>
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50">{t('balance')}</p>
          <div className="flex items-end gap-2">
            <h2 className={`text-5xl font-black tracking-tighter ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance.toLocaleString()}
            </h2>
            <span className="text-xl font-bold opacity-30 mb-2">{currency}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-emerald-400">
                <ArrowUpRight size={14} /> {t('income')}
              </div>
              <p className="text-xl font-bold">{totalIncome.toLocaleString()} <span className="text-xs opacity-30">{currency}</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-orange-400">
                <ArrowDownRight size={14} /> {t('expenses')}
              </div>
              <p className="text-xl font-bold">{totalExpenses.toLocaleString()} <span className="text-xs opacity-30">{currency}</span></p>
            </div>
          </div>
          
          {totalExpenses > totalIncome && totalIncome > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-3 bg-red-500/20 rounded-2xl flex items-center gap-2 border border-red-500/20">
              <AlertCircle size={18} className="text-red-400" />
              <p className="text-[10px] font-bold text-red-200 uppercase tracking-wider">{t('alertLimit')}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-slate-200 dark:bg-slate-800 rounded-3xl mx-2">
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-700 shadow-xl text-emerald-500 scale-100' : 'opacity-40 scale-95'}`}>{t('expenses')}</button>
        <button onClick={() => setActiveTab('income')} className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${activeTab === 'income' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-500 scale-100' : 'opacity-40 scale-95'}`}>{t('income')}</button>
      </div>

      {/* Dynamic List */}
      <div className="space-y-4 px-2">
        <AnimatePresence mode="popLayout">
          {(activeTab === 'expenses' ? expenses : incomeSources).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center opacity-10">
              <PlusCircle size={80} className="mx-auto mb-4 stroke-1" />
              <p className="font-black uppercase tracking-widest text-sm">القائمة فارغة</p>
            </motion.div>
          ) : (
            (activeTab === 'expenses' ? expenses : incomeSources).map((item: any) => {
              const cat = 'category' in item ? (categories.find(c => c.id === item.category) || categories[4]) : null;
              const pct = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
              
              return (
                <motion.div 
                  layout 
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  className={`p-5 rounded-[2rem] border group relative overflow-hidden transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat ? (
                        cat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                        cat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                        cat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-purple-500/10 text-purple-500'
                      ) : 'bg-blue-500/10 text-blue-500'}`}>
                        {cat ? cat.icon : <ArrowUpRight size={22} />}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-sm tracking-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 opacity-40 text-[9px] font-bold uppercase tracking-wider">
                          <span>{cat ? cat.label : t('income')}</span>
                          {item.notes && <span className="w-1 h-1 bg-current rounded-full" />}
                          {item.notes && <span className="truncate max-w-[80px]">{item.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-left">
                        <p className={`font-black text-base ${activeTab === 'expenses' ? 'text-slate-800 dark:text-white' : 'text-emerald-500'}`}>
                          {activeTab === 'expenses' ? '-' : '+'}{item.amount.toLocaleString()}
                        </p>
                        {activeTab === 'expenses' && totalIncome > 0 && (
                          <p className={`text-[10px] font-black tracking-tighter ${pct > 25 ? 'text-red-500' : 'opacity-30'}`}>
                            {pct.toFixed(1)}% {t('ofIncome')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-emerald-500 transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar background for expenses */}
                  {activeTab === 'expenses' && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 dark:bg-slate-900">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${pct > 25 ? 'bg-red-500' : 'bg-emerald-500/40'}`} />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={() => setShowModal(true)} 
        className={`fixed bottom-28 right-6 w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl z-50 ${activeTab === 'expenses' ? 'bg-orange-500 shadow-orange-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}`}
      >
        <Plus size={36} />
      </motion.button>

      {/* Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className={`w-full max-w-lg p-10 rounded-[3rem] relative shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-white/5' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">{editId ? t('edit') : (activeTab === 'expenses' ? t('addExpense') : t('addIncome'))}</h3>
                <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase opacity-40 px-3 tracking-widest">{t('name')}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full p-5 rounded-3xl border-2 outline-none font-bold text-lg transition-all focus:border-emerald-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-right' : 'bg-slate-50 border-slate-100 text-right'}`} placeholder={t('placeholderName')} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase opacity-40 px-3 tracking-widest">{t('amount')} ({currency})</label>
                  <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full p-5 rounded-3xl border-2 outline-none font-black text-3xl transition-all focus:border-emerald-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-right' : 'bg-slate-50 border-slate-100 text-right'}`} placeholder="0.00" />
                </div>
                
                {activeTab === 'expenses' && (
                  <>
                    <div className="space-y-3 text-right">
                      <label className="text-xs font-black uppercase opacity-40 px-3 tracking-widest">{t('category')}</label>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {categories.map(c => (
                          <button key={c.id} onClick={() => setCategory(c.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${category === c.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 opacity-40 hover:opacity-100'}`}>
                            {c.icon} {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase opacity-40 px-3 tracking-widest">{t('notes')}</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`w-full p-5 rounded-3xl border-2 outline-none font-bold text-sm transition-all focus:border-emerald-500 min-h-[100px] resize-none text-right ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="..." />
                    </div>
                  </>
                )}

                <div className="pt-8 flex gap-4">
                  <button onClick={handleSave} className={`flex-[2] py-5 rounded-3xl text-white font-black text-xl shadow-2xl transition-transform active:scale-95 ${activeTab === 'expenses' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                    {t('save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetTrackerPage;
