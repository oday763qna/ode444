
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, HelpCircle, Trophy, Sparkles, CheckCircle2, Medal, Flame, Share2 } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';
import { BillParticipant } from '../types';

// The BillSplitterPage component provides a gamified interface for splitting expenses among multiple participants.
const BillSplitterPage: React.FC = () => {
  const { t, theme, currency, lang } = useAppContext();
  const [participants, setParticipants] = useState<BillParticipant[]>([]);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Gamification Persistent State: Leveling up system based on usage fairness.
  const [xp, setXp] = useState(() => Number(localStorage.getItem('splitter_xp') || 0));
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('splitter_streak') || 0));
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    localStorage.setItem('splitter_xp', xp.toString());
    localStorage.setItem('splitter_streak', streak.toString());
  }, [xp, streak]);

  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpProgress = (xp % 100); 

  const getRank = (lvl: number) => {
    if (lvl < 2) return "مبتدئ تقسيم";
    if (lvl < 5) return "خبير الفواتير";
    if (lvl < 10) return "سيد التناغم";
    return "أسطورة احسبها صح";
  };

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
    
    setTimeout(() => {
      setLastUpdatedId(null);
    }, 600);
  };

  const shareInfo = useMemo(() => {
    const totalPaid = participants.reduce((sum, p) => sum + p.paid, 0);
    const count = participants.length;
    const perPerson = count > 0 ? totalPaid / count : 0;

    if (count === 0) return null;

    let harmonyScore = 100;
    if (count > 1 && totalPaid > 0) {
      const variance = participants.reduce((acc, p) => acc + Math.pow(p.paid - perPerson, 2), 0) / count;
      const stdDev = Math.sqrt(variance);
      harmonyScore = Math.max(0, Math.min(100, 100 - (stdDev / (perPerson || 1)) * 50));
    }

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
    const isHighlyFair = harmonyScore > 85 && count >= 2;

    return { perPerson, settlements, totalPaid, isMasterSplit, harmonyScore, isHighlyFair };
  }, [participants, currency, t]);

  const handleConfirmSplit = () => {
    if (!shareInfo) return;
    
    const xpGained = shareInfo.isHighlyFair ? 50 : 20;
    const newXp = xp + xpGained;
    
    if (Math.floor(Math.sqrt(newXp / 100)) > Math.floor(Math.sqrt(xp / 100))) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
    
    setXp(newXp);
    if (shareInfo.isHighlyFair) setStreak(s => s + 1);
    else setStreak(0);
    
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const handleShare = async () => {
    if (!shareInfo) return;
    
    let text = `📊 ${t('billSplit')} - ${t('appName')}\n`;
    text += `💰 ${t('billTotal')}: ${shareInfo.totalPaid.toLocaleString()} ${currency}\n`;
    text += `👤 ${t('eachPays')}: ${shareInfo.perPerson.toLocaleString()} ${currency}\n\n`;
    text += `${t('breakdown')}:\n`;
    shareInfo.settlements.forEach(s => {
      text += `• ${s.from} ⬅️ ${s.amount} ${currency} ⬅️ ${s.to}\n`;
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: t('appName'), text });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert(lang === 'ar' ? "تم النسخ!" : "Copied!");
    }
  };

  return (
    <div className="space-y-6 pb-20 text-right">
      {/* Gamification Stats Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className={`p-4 rounded-[2rem] border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Medal size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">المستوى {level}</h4>
            <p className="text-xs font-black text-amber-600">{getRank(level)}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 flex-1 px-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold opacity-40">XP {xp}</span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className="h-full bg-amber-500" 
               />
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <span className="text-[10px] font-black">{streak} متتالي</span>
              <Flame size={12} className="fill-current" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 justify-end">
          {t('billSplit')}
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
        </h2>

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
              
              <div className="flex justify-between items-center mb-6 relative z-10">
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
                
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col items-center">
                   <p className="text-[8px] font-black opacity-60 uppercase mb-1">تناغم مالي</p>
                   <div className="text-lg font-black flex items-center gap-1">
                     {shareInfo.harmonyScore.toFixed(0)}%
                   </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{t('eachPays')}</p>
                  <p className="text-xl font-black">{shareInfo.perPerson.toLocaleString()} {currency}</p>
                </div>

                {shareInfo.settlements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('breakdown')}</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 no-scrollbar">
                      {shareInfo.settlements.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-xl">
                          <span className="font-bold">{s.from}</span>
                          <span className="opacity-50 mx-2">⬅️ {s.amount} {currency} ⬅️</span>
                          <span className="font-bold">{s.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button onClick={handleShare} className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Share2 size={16} /> {t('save')}
                  </button>
                  <button onClick={handleConfirmSplit} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                    <CheckCircle2 size={16} /> {t('calculate')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={addParticipant}
              className="flex items-center gap-2 text-xs font-black text-blue-500 bg-blue-500/5 px-4 py-2 rounded-2xl hover:bg-blue-500/10 transition-colors"
            >
              <Plus size={16} /> {t('addPerson')}
            </button>
            <h3 className="font-black text-xs opacity-40 uppercase tracking-widest">الأشخاص والمدفوعات</h3>
          </div>

          <div className="space-y-3">
            {participants.map((p) => (
              <motion.div 
                layout 
                key={p.id}
                className={`p-4 rounded-3xl border flex items-center gap-4 transition-all ${lastUpdatedId === p.id ? 'ring-2 ring-blue-500/20 scale-[1.02]' : ''} ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <button 
                  onClick={() => removeParticipant(p.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex-1 flex gap-3 overflow-hidden">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={p.paid || ''}
                      onChange={(e) => updateParticipant(p.id, 'paid', e.target.value)}
                      className="w-16 bg-transparent outline-none font-bold text-left"
                      placeholder="0"
                    />
                    <span className="text-[10px] opacity-30 font-bold">{currency}</span>
                  </div>
                  <input 
                    type="text" 
                    value={p.name}
                    onChange={(e) => updateParticipant(p.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent outline-none font-black text-right border-b border-transparent focus:border-blue-500 transition-all"
                    placeholder={t('name')}
                  />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
              </motion.div>
            ))}
            
            {participants.length === 0 && (
              <div className="py-12 text-center opacity-20 flex flex-col items-center gap-4">
                 <HelpCircle size={48} className="stroke-1" />
                 <p className="text-sm font-black uppercase tracking-widest">أضف أشخاصاً للبدء</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-6"
          >
            <div className="bg-amber-500 p-8 rounded-[3rem] text-white text-center shadow-2xl relative">
              <Sparkles className="absolute -top-6 -left-6 text-white" size={48} />
              <Trophy size={64} className="mx-auto mb-4" />
              <h3 className="text-3xl font-black mb-1">المستوى الأعلى!</h3>
              <p className="font-bold opacity-80">لقد وصلت للمستوى {level}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillSplitterPage;
