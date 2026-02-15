
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, HelpCircle, Trophy, Star } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';
import { BillParticipant } from '../types';

const BillSplitterPage: React.FC = () => {
  const { t, theme, lang, currency } = useAppContext();
  const [participants, setParticipants] = useState<BillParticipant[]>([]);

  const addParticipant = () => {
    setParticipants([...participants, {
      id: Math.random().toString(36).substr(2, 9),
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
          from: debt.name || (lang === 'ar' ? 'مجهول' : 'Unknown'),
          to: credit.name || (lang === 'ar' ? 'مجهول' : 'Unknown'),
          amount: parseFloat(amount.toFixed(2))
        });
      }

      tempCreditors[cIdx].balance -= amount;
      tempDebtors[dIdx].balance += amount;

      if (tempCreditors[cIdx].balance < 0.01) cIdx++;
      if (Math.abs(tempDebtors[dIdx].balance) < 0.01) dIdx++;
    }

    // Gamification check: If split among more than 3 people and total > 0
    const isMasterSplit = count >= 3 && totalPaid > 0;

    return { perPerson, settlements, totalPaid, isMasterSplit };
  }, [participants, lang]);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
          {t('billSplit')}
        </h2>

        {/* Global Summary */}
        <AnimatePresence>
          {shareInfo && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20`}>
              <div className="flex justify-between items-center gap-2">
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wider">{t('billTotal')}</p>
                  <h3 className="text-2xl font-bold truncate">{shareInfo.totalPaid.toLocaleString()} <span className="text-xs">{currency}</span></h3>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80 uppercase tracking-wider">{t('eachPays')}</p>
                  <h3 className="text-xl font-bold truncate">{shareInfo.perPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs">{currency}</span></h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-sm opacity-60 uppercase">{t('whoPaidWhat')}</h3>
            <motion.button whileTap={{ scale: 0.95 }} onClick={addParticipant} className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-full hover:bg-blue-500/20 transition-colors">
              <Plus size={14} /> {t('addPerson')}
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {participants.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center opacity-20">
                <HelpCircle size={48} />
                <p className="text-sm font-bold mt-2">Add people to start splitting</p>
              </motion.div>
            ) : (
              participants.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div className="flex-1 flex gap-2 overflow-hidden">
                    <input type="text" value={p.name} onChange={(e) => updateParticipant(p.id, 'name', e.target.value)} className={`flex-1 min-w-0 bg-transparent outline-none font-medium border-b border-transparent focus:border-blue-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} placeholder={t('name')} />
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] opacity-50">{currency}</span>
                      <input type="text" inputMode="decimal" value={p.paid || ''} onChange={(e) => updateParticipant(p.id, 'paid', e.target.value)} className="w-16 bg-transparent outline-none font-bold text-right" placeholder="0" />
                    </div>
                  </div>
                  <button onClick={() => removeParticipant(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Settlements Display */}
        {shareInfo && shareInfo.settlements.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm opacity-60 px-2 uppercase">{t('settlements')}</h3>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} space-y-4 shadow-inner relative overflow-hidden`}>
              
              {/* Gamification Badge */}
              {shareInfo.isMasterSplit && (
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="mb-4 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white flex items-center gap-3 shadow-lg shadow-orange-500/20"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Trophy size={20} className="text-yellow-100" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-black uppercase tracking-wider">{t('badgeMaster')}</h4>
                      <Star size={10} className="fill-current" />
                    </div>
                    <p className="text-[10px] font-bold opacity-90">{t('badgeMasterDesc')}</p>
                  </div>
                </motion.div>
              )}

              {shareInfo.settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 text-right font-bold truncate text-sm">{s.from}</div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] text-blue-500 font-black uppercase mb-1 whitespace-nowrap">{t('owes')}</div>
                    <div className="px-3 py-1 bg-blue-500/10 rounded-full text-blue-600 font-black text-xs whitespace-nowrap">
                      {s.amount.toLocaleString()} {currency}
                    </div>
                  </div>
                  <div className="flex-1 text-left font-bold truncate text-sm">{s.to}</div>
                </div>
              ))}
            </motion.div>

            {/* Congratulatory Footer */}
            {shareInfo.isMasterSplit && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Sparkles size={12} />
                {t('perfectSplit')}
                <Sparkles size={12} />
              </motion.p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Sparkles to the import to avoid build error
import { Sparkles } from 'lucide-react';

export default BillSplitterPage;
