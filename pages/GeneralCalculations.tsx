
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  TrendingUp, 
  Home as HomeIcon, 
  Coins, 
  Percent, 
  Plus, 
  PieChart as PieIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext, toEnglishDigits } from '../App';

const SectionHeader: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void;
  colorClass: string;
}> = ({ title, icon, isOpen, onToggle, colorClass }) => (
  <button 
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
      isOpen 
        ? `${colorClass} text-white border-transparent shadow-lg` 
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${isOpen ? 'bg-white/20' : colorClass + '/10 ' + colorClass.replace('bg-', 'text-')}`}>
        {icon}
      </div>
      <span className="font-black text-sm uppercase tracking-wide">{title}</span>
    </div>
    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
  </button>
);

const GeneralCalculationsPage: React.FC = () => {
  const { t, theme, currency } = useAppContext();
  const [openSection, setOpenSection] = useState<string | null>('comm');

  // --- 1. Commission State ---
  const [commInputs, setCommInputs] = useState({ sale: '', rate: '' });
  const commResults = useMemo(() => {
    const sale = parseFloat(toEnglishDigits(commInputs.sale)) || 0;
    const rate = parseFloat(toEnglishDigits(commInputs.rate)) || 0;
    const val = sale * (rate / 100);
    return { val, total: sale + val };
  }, [commInputs]);

  // --- 2. Trade State ---
  const [tradeInputs, setTradeInputs] = useState({ buy: '', sell: '', other: '' });
  const tradeResults = useMemo(() => {
    const buy = parseFloat(toEnglishDigits(tradeInputs.buy)) || 0;
    const sell = parseFloat(toEnglishDigits(tradeInputs.sell)) || 0;
    const other = parseFloat(toEnglishDigits(tradeInputs.other)) || 0;
    const profit = sell - buy - other;
    const margin = buy > 0 ? (profit / buy) * 100 : 0;
    return { profit, margin };
  }, [tradeInputs]);

  // --- 3. Construction State ---
  const [constInputs, setConstInputs] = useState({ qty: '', unit: '', labor: '', misc: '' });
  const constResults = useMemo(() => {
    const qty = parseFloat(toEnglishDigits(constInputs.qty)) || 0;
    const unit = parseFloat(toEnglishDigits(constInputs.unit)) || 0;
    const labor = parseFloat(toEnglishDigits(constInputs.labor)) || 0;
    const misc = parseFloat(toEnglishDigits(constInputs.misc)) || 0;
    const materials = qty * unit;
    const total = materials + labor + misc;
    return { materials, labor, misc, total };
  }, [constInputs]);

  // --- 4. Gold State ---
  const [goldInputs, setGoldInputs] = useState({ weight: '', price: '', fees: '' });
  const goldResults = useMemo(() => {
    const weight = parseFloat(toEnglishDigits(goldInputs.weight)) || 0;
    const price = parseFloat(toEnglishDigits(goldInputs.price)) || 0;
    const fees = parseFloat(toEnglishDigits(goldInputs.fees)) || 0;
    const total = (weight * price) + fees;
    return { total };
  }, [goldInputs]);

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  return (
    <div className="space-y-4 pb-10">
      <h2 className="text-2xl font-black flex items-center gap-2 mb-2 px-2">
        <span className="w-2 h-8 bg-amber-500 rounded-full" />
        {t('generalCalc')}
      </h2>

      {/* 1. Commission Calculator */}
      <div className="space-y-2">
        <SectionHeader 
          title={t('commTitle')} 
          icon={<Briefcase size={20} />} 
          isOpen={openSection === 'comm'} 
          onToggle={() => toggleSection('comm')}
          colorClass="bg-emerald-500"
        />
        <AnimatePresence>
          {openSection === 'comm' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 px-2"
            >
              <div className={`p-6 rounded-3xl border space-y-4 mt-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('saleAmount')} ({currency})</label>
                  <input type="text" inputMode="decimal" value={commInputs.sale} onChange={e => setCommInputs({...commInputs, sale: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={t('placeholderSale')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('commRate')}</label>
                  <input type="text" inputMode="decimal" value={commInputs.rate} onChange={e => setCommInputs({...commInputs, rate: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder={t('placeholderRate')} />
                </div>
                {commResults.val > 0 && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{t('commVal')}</p>
                    <h4 className="text-2xl font-black text-emerald-500">{commResults.val.toLocaleString()} {currency}</h4>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Trade Profit Calculator */}
      <div className="space-y-2">
        <SectionHeader 
          title={t('tradeTitle')} 
          icon={<TrendingUp size={20} />} 
          isOpen={openSection === 'trade'} 
          onToggle={() => toggleSection('trade')}
          colorClass="bg-blue-500"
        />
        <AnimatePresence>
          {openSection === 'trade' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 px-2">
              <div className={`p-6 rounded-3xl border space-y-4 mt-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('buyPrice')}</label>
                    <input type="text" inputMode="decimal" value={tradeInputs.buy} onChange={e => setTradeInputs({...tradeInputs, buy: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('placeholderBuy')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('sellPrice')}</label>
                    <input type="text" inputMode="decimal" value={tradeInputs.sell} onChange={e => setTradeInputs({...tradeInputs, sell: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('placeholderSell')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('otherCosts')}</label>
                  <input type="text" inputMode="decimal" value={tradeInputs.other} onChange={e => setTradeInputs({...tradeInputs, other: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('placeholderOther')} />
                </div>
                {tradeResults.profit !== 0 && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`p-5 rounded-3xl border-2 flex items-center justify-between ${tradeResults.profit > 0 ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">{t('netProfit')}</p>
                      <h4 className={`text-xl font-black ${tradeResults.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tradeResults.profit.toLocaleString()} {currency}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase opacity-60">{t('margin')}</p>
                      <h4 className="text-lg font-black">{tradeResults.margin.toFixed(1)}%</h4>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Construction Calculator */}
      <div className="space-y-2">
        <SectionHeader 
          title={t('constTitle')} 
          icon={<HomeIcon size={20} />} 
          isOpen={openSection === 'const'} 
          onToggle={() => toggleSection('const')}
          colorClass="bg-orange-500"
        />
        <AnimatePresence>
          {openSection === 'const' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 px-2">
              <div className={`p-6 rounded-3xl border space-y-4 mt-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('matQty')}</label>
                    <input type="text" inputMode="decimal" value={constInputs.qty} onChange={e => setConstInputs({...constInputs, qty: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder={t('placeholderQty')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('unitPrice')}</label>
                    <input type="text" inputMode="decimal" value={constInputs.unit} onChange={e => setConstInputs({...constInputs, unit: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder={t('placeholderUnit')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('laborCost')}</label>
                    <input type="text" inputMode="decimal" value={constInputs.labor} onChange={e => setConstInputs({...constInputs, labor: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder={t('placeholderLabor')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-50 uppercase">{t('other')}</label>
                    <input type="text" inputMode="decimal" value={constInputs.misc} onChange={e => setConstInputs({...constInputs, misc: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder={t('placeholderFees')} />
                  </div>
                </div>

                {constResults.total > 0 && (
                  <div className="pt-4 border-t dark:border-slate-700 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-60">{t('totalConst')}</p>
                        <h4 className="text-2xl font-black text-orange-500">{constResults.total.toLocaleString()} {currency}</h4>
                      </div>
                      <PieIcon className="text-orange-500 opacity-20" size={48} />
                    </div>
                    
                    {/* Breakdown Chart */}
                    <div className="h-40 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Materials', value: constResults.materials },
                              { name: 'Labor', value: constResults.labor },
                              { name: 'Misc', value: constResults.misc },
                            ]}
                            cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" isAnimationActive={true}
                          >
                            <Cell fill="#f97316" />
                            <Cell fill="#fb923c" />
                            <Cell fill="#fdba74" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black opacity-30 uppercase">{t('breakdown')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Gold Value Calculator */}
      <div className="space-y-2">
        <SectionHeader 
          title={t('goldTitle')} 
          icon={<Coins size={20} />} 
          isOpen={openSection === 'gold'} 
          onToggle={() => toggleSection('gold')}
          colorClass="bg-yellow-500"
        />
        <AnimatePresence>
          {openSection === 'gold' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-2">
              <div className={`p-6 rounded-3xl border space-y-4 mt-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('goldWeight')}</label>
                  <input type="text" inputMode="decimal" value={goldInputs.weight} onChange={e => setGoldInputs({...goldInputs, weight: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-yellow-500" placeholder={t('placeholderWeight')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('goldPriceG')}</label>
                  <input type="text" inputMode="decimal" value={goldInputs.price} onChange={e => setGoldInputs({...goldInputs, price: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-yellow-500" placeholder={t('placeholderGoldPrice')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-50 uppercase">{t('additionalFees')}</label>
                  <input type="text" inputMode="decimal" value={goldInputs.fees} onChange={e => setGoldInputs({...goldInputs, fees: e.target.value})} className="w-full p-4 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-yellow-500" placeholder={t('placeholderFees')} />
                </div>
                {goldResults.total > 0 && (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 rounded-3xl bg-yellow-500 text-white shadow-xl shadow-yellow-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-80 mb-1">{t('totalGoldVal')}</p>
                      <h4 className="text-2xl font-black">{goldResults.total.toLocaleString()} {currency}</h4>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Coins size={28} />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Banner Ad placeholder */}
      <div className={`mt-6 p-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center opacity-40 min-h-[80px] flex items-center justify-center`}>
        <span className="text-[10px] font-black uppercase tracking-widest">General Calculation Tip: Accuracy matters most!</span>
      </div>
    </div>
  );
};

export default GeneralCalculationsPage;
