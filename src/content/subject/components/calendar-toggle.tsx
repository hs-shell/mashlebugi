import { useState } from 'react';
import { CalendarRange, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export type ViewType = 'clock' | 'range';

interface Props {
  view: ViewType;
  setView: (viewType: ViewType) => void;
}

export default function CalendarToggle({ view, setView }: Props) {
  return (
    <div className="inline-flex rounded-md shadow-sm relative overflow-hidden border border-zinc-300" role="group">
      <motion.div
        className="absolute inset-0 bg-black"
        initial={false}
        animate={{
          x: view === 'clock' ? 0 : '100%',
          width: '50%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <button
        type="button"
        className={`relative z-10 inline-flex items-center px-2 py-2 text-xs focus:outline-none transition-colors duration-300 font-semibold
        ${view === 'clock' ? 'text-white' : 'text-zinc-900 hover:text-zinc-700'}`}
        onClick={() => setView('clock')}
      >
        <Clock className="w-3 h-3 mr-1" />
        시간
      </button>
      <button
        type="button"
        className={`relative z-10 inline-flex items-center px-2 py-2 text-xs focus:outline-none transition-colors duration-300 font-semibold
        ${view === 'range' ? 'text-white' : 'text-zinc-900 hover:text-zinc-700'}`}
        onClick={() => setView('range')}
      >
        <CalendarRange className="w-3 h-3 mr-1" />
        교시
      </button>
    </div>
  );
}
