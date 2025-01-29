import { FolderOpen, SquareChartGantt } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewType } from '../DepartmentSelector';

interface Props {
  view: ViewType;
  setView: (viewType: ViewType) => void;
}

export default function TableToggle({ view, setView }: Props) {
  return (
    <div className="inline-flex rounded-md shadow-sm relative overflow-hidden border border-zinc-300" role="group">
      <motion.div
        className="absolute inset-0 bg-black"
        initial={false}
        animate={{
          x: view === 'master-detail' ? 0 : '100%',
          width: '50%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <button
        type="button"
        className={`relative z-10 inline-flex items-center px-2 py-2 text-xs focus:outline-none transition-colors duration-300 font-semibold
        ${view === 'master-detail' ? 'text-white' : 'text-zinc-900 hover:text-zinc-700'}`}
        onClick={() => setView('master-detail')}
      >
        <FolderOpen className="w-3 h-3 mr-1" />
        그룹
      </button>
      <button
        type="button"
        className={`relative z-10 inline-flex items-center px-2 py-2 text-xs focus:outline-none transition-colors duration-300 font-semibold
        ${view === 'total' ? 'text-white' : 'text-zinc-900 hover:text-zinc-700'}`}
        onClick={() => setView('total')}
      >
        <SquareChartGantt className="w-3 h-3 mr-1" />
        전체
      </button>
    </div>
  );
}
