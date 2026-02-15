
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useAnimation } from 'framer-motion';
import { Plus, Trash2, User, HelpCircle, Trophy, Star, Sparkles, GripVertical } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';
import { BillParticipant } from '../types';

const BillSplitterPage: React.FC = () => {
  const { t, theme, currency } = useAppContext();
  const [participants, setParticipants] = useState<BillParticipant[]>([]);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);

  const addParticipant = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setParticipants([...participants, {
      id: newId,
      name: '',
      paid: 0
    }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, field: keyof BillParticipant, value: any) => {
    let finalValue = value;
    if (field === 'paid') {
      const clean = toEnglishDigits(value.toString()).replace(/[^0-9.]/g, '');
      finalValue = clean === '' ? 0 : parseFloat(clean);
    }
    
    setParticipants(participants.map(p => p.id === id ? { ...p, [field]: finalValue } : p));
    setLastUpdatedId(id);
    
    // Reset feedback after a short delay
    setTimeout(() => {
      setLastUpdatedId(null);
    }, 600);
  };

  const shareInfo = useMemo(() => {
    const totalPaid = participants.reduce((sum, p) => sum + p.paid, 0);
    const count = participants.length;
    const perPerson = count > 0 ? totalPaid / count : 0;

    if (count === 0) return null;

    const balances = participants.map(p => ({
      ...p,
      balance: p.paid - perPerson
    }));

    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

    const settlements: { from: string, to: string, amount: number }[] = [];
    const tempCreditors = creditors.map(c => ({ ...c }));
    const tempDebtors = debtors.map(d => ({ ...d }));

    let cIdx = 0;
    let dIdx = 0;

    while (cIdx < tempCreditors.length && dIdx < tempDebtors.length) {
      const credit = tempCreditors[cIdx];
      const debt = tempDebtors[dIdx];
      const amount = Math.min(credit.balance, Math.abs(debt.balance));

      if (amount > 0.01) {
        settlements.push({
          from: debt.name || 'مجهول',
          to: credit.name || 'مجهول',
          amount: parseFloat(amount.toFixed(2))
        });
      }

      tempCreditors[cIdx].balance -= amount;
      tempDebtors[dIdx].balance += amount;

      if (tempCreditors[cIdx].balance < 0.01) cIdx++;
      if (Math.abs(tempDebtors[dIdx].balance) < 0.01) dIdx++;
    }

    const isMasterSplit = count >= 3 && totalPaid > 0;

    return { perPerson, settlements, totalPaid, isMasterSplit };
  }, [participants]);

  return (
    <div className="space-y-6 pb-20 text-right">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 justify-end">
          {t('billSplit')}
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
        </h2>

        {/* Global Summary */}
        <AnimatePresence>
          {shareInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <div className="flex justify-between items-center gap-2 relative z-10">
                <div className="text-right">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('billTotal')}</p>
                  <motion.h3 
                    key={shareInfo.totalPaid}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-black truncate"
                  >
                    {shareInfo.totalPaid.toLocaleString()} <span className="text-xs font-normal opacity-50">{currency}</span>
                  </motion.h3>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('eachPays')}</p>
                  <motion.h3 
                    key={shareInfo.perPerson}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-black truncate"
                  >
                    {shareInfo.perPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-normal opacity-50">{currency}</span>
                  </motion.h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }} 
              onClick={addParticipant} 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-blue-500 bg-blue-500/10 px-6 py-2.5 rounded-full border border-blue-500/10 hover:bg-blue-500/20 transition-all"
            >
              <Plus size={16} /> {t('addPerson')}
            </motion.button>
            <h3 className="font-black text-xs opacity-40 uppercase tracking-widest">{t('whoPaidWhat')}</h3>
          </div>

          <Reorder.Group axis="y" values={participants} onReorder={setParticipants} className="space-y-3">
            <AnimatePresence initial={false}>
              {participants.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="py-16 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem]"
                >
                  <HelpCircle size={64} className="stroke-1" />
                  <p className="text-xs font-black mt-4 uppercase tracking-widest">أضف أشخاصاً لبدء التقسيم</p>
                </motion.div>
              ) : (
                participants.map((p) => (
                  <Reorder.Item 
                    key={p.id} 
                    value={p}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: lastUpdatedId === p.id ? 1.02 : 1,
                      borderColor: lastUpdatedId === p.id ? 'rgb(59, 130, 246)' : theme === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(241, 245, 249)'
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileDrag={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                    className={`p-4 rounded-[2rem] border-2 flex items-center gap-4 transition-colors relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-white shadow-sm'}`}
                  >
                    <div className="p-2 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} />
                    </div>
                    
                    <button 
                      onClick={() => removeParticipant(p.id)} 
                      className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex-1 flex gap-3 overflow-hidden justify-end">
                      <motion.div 
                        animate={lastUpdatedId === p.id ? { y: [0, -2, 0] } : {}}
                        className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus-within:border-blue-500 transition-all"
                      >
                        <input 
                          type="text" 
                          inputMode="decimal" 
                          value={p.paid || ''} 
                          onChange={(e) => updateParticipant(p.id, 'paid', e.target.value)} 
                          className="w-20 bg-transparent outline-none font-black text-left text-lg" 
                          placeholder="0" 
                        />
                        <span className="text-[10px] font-black opacity-30">{currency}</span>
                      </motion.div>
                      <input 
                        type="text" 
                        value={p.name} 
                        onChange={(e) => updateParticipant(p.id, 'name', e.target.value)} 
                        className={`flex-1 min-w-0 bg-transparent outline-none font-bold text-right border-b-2 border-transparent focus:border-blue-500 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} 
                        placeholder={t('name')} 
                      />
                    </div>
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                      <User size={24} />
                    </div>
                    
                    {/* Visual pulse for feedback */}
                    {lastUpdatedId === p.id && (
                      <motion.div 
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 bg-blue-500/5 pointer-events-none"
                      />
                    )}
                  </Reorder.Item>
                ))
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {/* Settlements Display */}
        {shareInfo && shareInfo.settlements.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-black text-xs opacity-40 px-2 uppercase tracking-widest">{t('settlements')}</h3>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`p-8 rounded-[3rem] border-2 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'} space-y-6 shadow-xl relative overflow-hidden`}
            >
              <div className="absolute -bottom-6 -right-6 text-blue-500/5 rotate-12 pointer-events-none">
                <Trophy size={160} />
              </div>

              {/* Gamification Badge */}
              {shareInfo.isMasterSplit && (
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-[2rem] text-white flex items-center gap-4 shadow-xl shadow-orange-500/20 text-right"
                >
                  <div className="ml-auto">
                    <div className="flex items-center gap-2 justify-end">
                      <Star size={14} className="fill-current text-yellow-200" />
                      <h4 className="text-xs font-black uppercase tracking-widest">{t('badgeMaster')}</h4>
                    </div>
                    <p className="text-[10px] font-bold opacity-90 mt-1">{t('badgeMasterDesc')}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                    <Trophy size={32} className="text-yellow-100" />
                  </div>
                </motion.div>
              )}

              <div className="space-y-4 relative z-10">
                {shareInfo.settlements.map((s, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex-1 text-right font-black truncate text-sm text-slate-700 dark:text-slate-300">{s.from}</div>
                    <div className="flex flex-col items-center">
                      <div className="text-[8px] text-blue-500 font-black uppercase mb-1 tracking-tighter">{t('owes')}</div>
                      <div className="px-4 py-1.5 bg-blue-500 text-white rounded-full font-black text-xs shadow-lg shadow-blue-500/20 whitespace-nowrap">
                        {s.amount.toLocaleString()} {currency}
                      </div>
                    </div>
                    <div className="flex-1 text-left font-black truncate text-sm text-slate-700 dark:text-slate-300">{s.to}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Congratulatory Footer */}
            {shareInfo.isMasterSplit && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Sparkles size={16} className="animate-pulse" />
                {t('perfectSplit')}
                <Sparkles size={16} className="animate-pulse" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillSplitterPage;
