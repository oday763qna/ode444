
import React from 'react';
import { Globe, Moon, Sun, Coins, Target } from 'lucide-react';
import { useAppContext } from '../App';

const SettingsPage: React.FC = () => {
  const { t, lang, setLang, theme, setTheme, currency, setCurrency, threshold, setThreshold } = useAppContext();
  const currencies = ["USD", "EUR", "GBP", "AED", "SAR", "JD", "EGP", "KWD"];

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="w-2 h-8 bg-slate-400 rounded-full" />
        {t('settings')}
      </h2>

      <div className="space-y-4">
        {/* Good Deal Threshold */}
        <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Target size={20} />
              </div>
              <span className="font-bold">{t('goodThreshold')}</span>
            </div>
          </div>
          <p className="text-xs opacity-50 mb-4">{t('thresholdDesc')}</p>
          <div className="flex items-center gap-4">
            <input type="range" min="1" max="100" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            <div className="w-16 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-center font-bold text-purple-500 border border-slate-200 dark:border-slate-800">
              {threshold}%
            </div>
          </div>
        </div>

        {/* Currency Setting */}
        <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Coins size={20} />
              </div>
              <span className="font-bold">{t('currency')}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {currencies.map(c => (
              <button key={c} onClick={() => setCurrency(c)} className={`py-2 rounded-xl text-xs font-bold border transition-all ${currency === c ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'border-slate-200 dark:border-slate-700 opacity-50 hover:opacity-100'}`}>
                {c}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={5}
            className={`w-full p-4 mt-4 rounded-2xl border font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
            placeholder="Other Symbol..."
          />
        </div>

        {/* Language Selection */}
        <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Globe size={20} />
              </div>
              <span className="font-bold">{t('language')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setLang('en')} className={`py-3 rounded-xl font-bold transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500' : 'opacity-40'}`}>English</button>
            <button onClick={() => setLang('ar')} className={`py-3 rounded-xl font-bold transition-all font-arabic ${lang === 'ar' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500' : 'opacity-40'}`}>العربية</button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Sun size={20} />
              </div>
              <span className="font-bold">{t('theme')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setTheme('light')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-800 shadow-md text-amber-500' : 'opacity-40'}`}>
              <Sun size={18} /> {t('light')}
            </button>
            <button onClick={() => setTheme('dark')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-500' : 'opacity-40'}`}>
              <Moon size={18} /> {t('dark')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
