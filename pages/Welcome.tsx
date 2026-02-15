
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, Wallet, PiggyBank, Globe, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../App';

const WelcomePage: React.FC = () => {
  const { t, lang, setLang, currency, setCurrency, finishOnboarding, theme } = useAppContext();
  const [step, setStep] = useState(0);

  const features = [
    { icon: <Calculator size={48} />, text: t('onboarding1'), color: 'emerald' },
    { icon: <Users size={48} />, text: t('onboarding2'), color: 'blue' },
    { icon: <Wallet size={48} />, text: t('onboarding3'), color: 'orange' },
    { icon: <PiggyBank size={48} />, text: t('onboarding4'), color: 'purple' },
  ];

  const currencies = ["USD", "EUR", "GBP", "AED", "SAR", "JD", "EGP", "KWD"];

  const next = () => {
    if (step < 2) setStep(step + 1);
    else finishOnboarding();
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="features" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 w-full max-w-sm">
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
              {t('appName')}
            </h2>
            <div className="space-y-6 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {features.map((f, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    f.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                    f.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                    f.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {f.icon}
                  </div>
                  <p className="text-sm font-bold opacity-80 leading-relaxed">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 w-full max-w-sm">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center text-emerald-500">
                  <Globe size={20} />
                  <h3 className="font-bold">{t('chooseLang')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => setLang('en')} className={`py-3 rounded-xl font-bold transition-all ${lang === 'en' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-40'}`}>English</button>
                  <button onClick={() => setLang('ar')} className={`py-3 rounded-xl font-bold transition-all font-arabic ${lang === 'ar' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-40'}`}>العربية</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center text-blue-500">
                  <Coins size={20} />
                  <h3 className="font-bold">{t('chooseCurrency')}</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {currencies.map(c => (
                    <button key={c} onClick={() => setCurrency(c)} className={`py-2 rounded-xl text-xs font-bold transition-all border ${currency === c ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700 opacity-50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={48} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-black">{t('welcome')}!</h2>
              <p className="opacity-50 text-sm mt-2">{t('tagline')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.95 }} onClick={next} className="mt-12 w-full max-w-sm py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
        {step === 2 ? t('getStarted') : (lang === 'ar' ? 'متابعة' : 'Continue')}
        <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
      </motion.button>
    </div>
  );
};

export default WelcomePage;
