
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { useAppContext } from '../App';

const AboutUsPage: React.FC = () => {
  const { t, theme, lang } = useAppContext();
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl relative">
          <ShieldCheck size={48} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" 
          />
        </div>
        <h2 className="text-3xl font-extrabold">{t('appName')}</h2>
        <p className={`max-w-xs mx-auto text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('aboutDesc')}
        </p>
      </div>

      <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} space-y-6`}>
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t('developer')}</p>
          <h3 className="text-xl font-bold">Oday Qutqut</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <a 
            href="mailto:oday5qutqut@gmail.com" 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-slate-50 border-slate-100 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Mail size={18} />
              </div>
              <span className="font-medium">oday5qutqut@gmail.com</span>
            </div>
            <ExternalLink size={16} className="opacity-30" />
          </a>
        </div>
      </div>

      <footer className="text-center py-8 opacity-40 text-xs flex items-center justify-center gap-2">
        <span>Handcrafted with</span>
        <Heart size={12} className="text-red-500 fill-red-500" />
        <span>by Oday Qutqut</span>
      </footer>
    </div>
  );
};

export default AboutUsPage;
