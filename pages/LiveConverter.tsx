
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Coins, 
  Bitcoin, 
  Droplets,
  Zap,
  Clock,
  ChevronDown,
  Info,
  Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext, toEnglishDigits } from '../App';
import { MarketRate, PricePoint } from '../types';

const LiveConverterPage: React.FC = () => {
  const { t, theme, currency: defaultCurrency } = useAppContext();
  
  // 1. App State & "Repository" Logic
  const [amount, setAmount] = useState('1');
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('XAU'); // Default to Gold
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => localStorage.getItem('rates_updated') || 'N/A');
  const [isOffline, setIsOffline] = useState(false);

  // Mock Market Rates (The "Repository" cache)
  const [rates, setRates] = useState<MarketRate[]>(() => {
    const cached = localStorage.getItem('market_rates');
    return cached ? JSON.parse(cached) : [
      { code: 'USD', rate: 1.0, type: 'currency', nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
      { code: 'JD', rate: 0.71, type: 'currency', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar' },
      { code: 'EUR', rate: 0.92, type: 'currency', nameAr: 'يورو', nameEn: 'Euro' },
      { code: 'SAR', rate: 3.75, type: 'currency', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
      { code: 'EGP', rate: 48.20, type: 'currency', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound' },
      { code: 'XAU', rate: 0.00042, type: 'commodity', nameAr: 'ذهب (جرام 24)', nameEn: 'Gold (1g)' }, // ~2400/oz -> ~77/g
      { code: 'XAG', rate: 0.032, type: 'commodity', nameAr: 'فضة (جرام)', nameEn: 'Silver (1g)' },
      { code: 'BTC', rate: 0.000015, type: 'crypto', nameAr: 'بيتكوين', nameEn: 'Bitcoin' },
      { code: 'OIL', rate: 0.012, type: 'commodity', nameAr: 'نفط برنت', nameEn: 'Brent Oil' },
    ];
  });

  // 2. Fetch Logic (Mocking Retrofit behavior)
  const refreshRates = async () => {
    setIsRefreshing(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    // In a real app, you'd call fetch() here. 
    // We update values slightly to simulate "live" movement
    const updatedRates = rates.map(r => {
      if (r.code === 'USD') return r;
      const fluctuation = 1 + (Math.random() * 0.01 - 0.005); // +/- 0.5%
      return { ...r, rate: r.rate * fluctuation };
    });

    setRates(updatedRates);
    const now = new Date().toLocaleTimeString();
    setLastUpdated(now);
    localStorage.setItem('market_rates', JSON.stringify(updatedRates));
    localStorage.setItem('rates_updated', now);
    setIsRefreshing(false);
    setIsOffline(!navigator.onLine);
  };

  useEffect(() => {
    refreshRates();
  }, []);

  // 3. Conversion Logic (The "Engine")
  const result = useMemo(() => {
    const fromRate = rates.find(r => r.code === fromCode)?.rate || 1;
    const toRate = rates.find(r => r.code === toCode)?.rate || 1;
    const numericAmount = parseFloat(toEnglishDigits(amount)) || 0;

    // Conversion: (Amount in From) -> (USD) -> (Amount in To)
    // Actually our rates are "1 USD = X Currency"
    // So USD Value = Amount / FromRate
    // To Value = USD Value * ToRate
    return (numericAmount / fromRate) * toRate;
  }, [amount, fromCode, toCode, rates]);

  const swapSelections = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  // 4. Chart Data Generation (7-Day History Simulation)
  const chartData = useMemo(() => {
    const selectedRate = rates.find(r => r.code === toCode);
    const basePrice = selectedRate ? 1 / selectedRate.rate : 1; // Price in USD
    const points: PricePoint[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const fluctuation = 1 + (Math.random() * 0.04 - 0.02);
      points.push({
        date: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        price: basePrice * fluctuation
      });
    }
    return points;
  }, [toCode, rates]);

  const getIcon = (type: string, code: string) => {
    if (code === 'BTC') return <Bitcoin size={20} />;
    if (code === 'OIL') return <Droplets size={20} />;
    if (type === 'commodity') return <Coins size={20} />;
    return <Globe size={20} />;
  };

  return (
    <div className="space-y-6 pb-20 text-right" dir="rtl">
      <div className="px-2 flex justify-between items-center">
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={refreshRates}
          disabled={isRefreshing}
          className={`p-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm text-blue-500`}
        >
          <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </motion.button>
        <div className="text-right">
          <h2 className="text-2xl font-black flex items-center gap-3 justify-end">
            {t('liveConverter')}
            <span className="w-2 h-8 bg-emerald-500 rounded-full" />
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mr-5">{t('convLastUpdated')}: {lastUpdated}</p>
        </div>
      </div>

      {isOffline && (
        <div className="mx-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center gap-3 justify-end text-[10px] font-black uppercase">
          {t('convOfflineMode')}
          <Info size={14} />
        </div>
      )}

      {/* Main Conversion Card */}
      <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
        <div className="space-y-1">
          <label className="text-[10px] font-black opacity-40 uppercase px-4">{t('amount')}</label>
          <input 
            type="text" 
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full p-6 rounded-[2rem] border-2 dark:bg-slate-900 dark:border-slate-700 font-black text-3xl text-right outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          {/* FROM SELECT */}
          <div className="p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <select 
              value={fromCode}
              onChange={e => setFromCode(e.target.value)}
              className="bg-transparent font-black text-sm outline-none appearance-none flex-1"
            >
              {rates.map(r => <option key={r.code} value={r.code}>{r.nameAr} ({r.code})</option>)}
            </select>
            <div className="text-[10px] font-black opacity-40 uppercase ml-3">{t('convFrom')}</div>
          </div>

          {/* SWAP BUTTON */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={swapSelections}
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white dark:border-slate-800"
            >
              <ArrowLeftRight size={20} />
            </motion.button>
          </div>

          {/* TO SELECT */}
          <div className="p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <select 
              value={toCode}
              onChange={e => setToCode(e.target.value)}
              className="bg-transparent font-black text-sm outline-none appearance-none flex-1"
            >
              {rates.map(r => <option key={r.code} value={r.code}>{r.nameAr} ({r.code})</option>)}
            </select>
            <div className="text-[10px] font-black opacity-40 uppercase ml-3">{t('convTo')}</div>
          </div>
        </div>

        <div className="pt-4 border-t dark:border-slate-700">
          <p className="text-[10px] font-black opacity-40 uppercase mb-2 text-center">{t('convResult')}</p>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-4xl font-black text-emerald-500">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</h3>
            <span className="text-xl font-bold opacity-30">{toCode}</span>
          </div>
        </div>
      </div>

      {/* Commodity Prices Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rates.filter(r => r.type !== 'currency').slice(0, 4).map(r => (
          <motion.div 
            key={r.code}
            whileTap={{ scale: 0.98 }}
            onClick={() => setToCode(r.code)}
            className={`p-5 rounded-[2.5rem] border ${toCode === r.code ? 'border-blue-500 bg-blue-500/5' : theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
               <div className={`p-2 rounded-xl ${toCode === r.code ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                 {getIcon(r.type, r.code)}
               </div>
               <p className="text-[8px] font-black uppercase opacity-40">{r.code}</p>
            </div>
            <p className="text-[10px] font-black mb-1 truncate">{r.nameAr}</p>
            <p className="text-sm font-black text-blue-500">{(1/r.rate).toLocaleString()} <span className="text-[8px] opacity-40">USD</span></p>
          </motion.div>
        ))}
      </div>

      {/* Historical Trend Chart */}
      <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">مباشر</span>
          </div>
          <h3 className="font-black text-xs opacity-50 uppercase tracking-widest">{t('convTrend7d')}</h3>
        </div>
        
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', textAlign: 'right', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(val: number) => [`$${val.toFixed(2)}`, 'السعر']}
              />
              <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Section */}
      <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
        <div className="flex-1 space-y-1 text-right">
          <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end">
             تحليل السوق <Zap size={12} />
          </h5>
          <p className="text-xs font-medium leading-relaxed opacity-70">
            {rates.find(r => r.code === toCode)?.type === 'crypto' 
              ? "البيتكوين يظهر تقلبات عالية حالياً. ينصح بالحذر في التحويلات الكبيرة."
              : "أسعار الذهب والعملات مستقرة نسبياً في الـ 24 ساعة الماضية. الأسعار يتم تحديثها محلياً."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveConverterPage;
