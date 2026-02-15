import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, Play, RefreshCcw, Sparkles, Trophy } from 'lucide-react';
import { useAppContext, toEnglishDigits } from '../App';

interface WheelOption {
  id: string;
  name: string;
  amount: number;
  color: string;
}

const COLORS = [
  '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const WheelGamePage: React.FC = () => {
  const { t, theme, currency } = useAppContext();
  const [options, setOptions] = useState<WheelOption[]>([
    { id: '1', name: 'أحمد', amount: 10, color: COLORS[0] },
    { id: '2', name: 'سارة', amount: 20, color: COLORS[1] },
    { id: '3', name: 'علي', amount: 15, color: COLORS[2] },
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelOption | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addOption = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setOptions([...options, { 
      id: newId, 
      name: '', 
      amount: 0, 
      color: COLORS[options.length % COLORS.length] 
    }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(o => o.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof WheelOption, value: any) => {
    let finalValue = value;
    if (field === 'amount') {
      const clean = toEnglishDigits(value.toString()).replace(/[^0-9.]/g, '');
      finalValue = clean === '' ? 0 : parseFloat(clean);
    }
    setOptions(options.map(o => o.id === id ? { ...o, [field]: finalValue } : o));
  };

  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    // Generate random rotation (at least 5 full spins + extra)
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalSpins = 5 + Math.floor(Math.random() * 5);
    const newRotation = rotation + (totalSpins * 360) + extraDegrees;
    
    setRotation(newRotation);

    // Calculate winner after animation ends (4 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      
      const segmentSize = 360 / options.length;
      // Normalizing rotation to 0-360 and finding which segment points to the arrow (top)
      // The arrow is at 0 degrees, so we calculate which index stops there.
      const actualDegrees = newRotation % 360;
      // Because it rotates clockwise, we subtract from 360 to get the index.
      const winIndex = Math.floor(((360 - actualDegrees) % 360) / segmentSize);
      setWinner(options[winIndex]);
    }, 4000);
  };

  const resetWheel = () => {
    setRotation(0);
    setWinner(null);
    setIsSpinning(false);
  };

  return (
    <div className="space-y-8 pb-24 text-right">
      <div className="flex items-center justify-between px-2">
        <button onClick={resetWheel} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-blue-500 transition-colors">
          <RefreshCcw size={20} />
        </button>
        <h2 className="text-2xl font-black flex items-center gap-3">
          {t('wheelGame')}
          <span className="w-2.5 h-10 bg-pink-500 rounded-full" />
        </h2>
      </div>

      {/* The Wheel Visual */}
      <div className="relative flex justify-center py-10">
        {/* Arrow Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-8 h-10 bg-pink-600 shadow-lg" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
        
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "circOut" }}
          className="relative w-72 h-72 rounded-full border-8 border-white dark:border-slate-800 shadow-2xl overflow-hidden"
          style={{ transformOrigin: 'center' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {options.map((option, i) => {
              const sliceAngle = 360 / options.length;
              const startAngle = i * sliceAngle;
              const endAngle = (i + 1) * sliceAngle;
              
              // Simple path logic for SVG pie slices
              const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
              
              return (
                <g key={option.id}>
                  <path 
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                    fill={option.color}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x="50"
                    y="15"
                    transform={`rotate(${startAngle + sliceAngle/2}, 50, 50)`}
                    fill="white"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    // Changed writingMode from 'tb' to 'vertical-rl' to satisfy TypeScript constraints for the WritingMode type.
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    {option.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10">
             <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col gap-6 px-2">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={spinWheel}
          disabled={isSpinning}
          className={`w-full py-5 rounded-3xl text-white font-black text-xl shadow-2xl flex items-center justify-center gap-3 transition-all ${isSpinning ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/30'}`}
        >
          {isSpinning ? <RefreshCcw className="animate-spin" /> : <Play />}
          {t('spin')}
        </motion.button>

        {/* Winner Announcement */}
        <AnimatePresence>
          {winner && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2.5rem] border-4 border-pink-500/20 shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="absolute -top-4 -right-4 text-pink-500/10 rotate-12"><Trophy size={120} /></div>
              <div className="relative z-10 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-pink-500">
                  <Sparkles size={20} />
                  <h3 className="text-xl font-black">{t('whoPays')}</h3>
                  <Sparkles size={20} />
                </div>
                <h4 className="text-4xl font-black tracking-tighter" style={{ color: winner.color }}>{winner.name}</h4>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{t('winnerPays')}</p>
                  <p className="text-2xl font-black text-pink-500">{winner.amount.toLocaleString()} {currency}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Inputs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={addOption}
              className="flex items-center gap-2 text-xs font-black text-blue-500 bg-blue-500/5 px-4 py-2 rounded-2xl"
            >
              <Plus size={16} /> {t('addPerson')}
            </button>
            <h3 className="font-black text-xs opacity-40 uppercase tracking-widest">المشاركين والجوائز</h3>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <motion.div 
                layout 
                key={option.id}
                className={`p-4 rounded-3xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <button 
                  onClick={() => removeOption(option.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex-1 flex gap-3 overflow-hidden">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={option.amount || ''}
                      onChange={(e) => updateOption(option.id, 'amount', e.target.value)}
                      className="w-14 bg-transparent outline-none font-bold text-left"
                      placeholder="0"
                    />
                    <span className="text-[10px] opacity-30 font-bold">{currency}</span>
                  </div>
                  <input 
                    type="text" 
                    value={option.name}
                    onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent outline-none font-black text-right border-b border-transparent focus:border-pink-500 transition-all"
                    placeholder={t('name')}
                  />
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: option.color }}>
                  <User size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelGamePage;