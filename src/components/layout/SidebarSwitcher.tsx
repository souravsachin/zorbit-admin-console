import React from 'react';
import { Layers, AlignLeft } from 'lucide-react';
import type { MenuStyle } from '../../hooks/useMenuPreference';

interface SidebarSwitcherProps {
  menuStyle: MenuStyle;
  onToggle: () => void;
  /** If true, show a compact icon-only button; if false, show a labeled pill */
  compact?: boolean;
}

const SidebarSwitcher: React.FC<SidebarSwitcherProps> = ({ menuStyle, onToggle, compact = true }) => {
  const is6Level = menuStyle === '6level';

  if (compact) {
    return (
      <button
        onClick={onToggle}
        title={is6Level ? 'Switch to Classic Menu' : 'Switch to 6-Level Menu'}
        className={`
          p-1 rounded transition-colors text-[10px] font-bold flex items-center gap-1
          ${is6Level
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-400 dark:text-gray-500'}
        `}
      >
        {is6Level ? <Layers size={13} /> : <AlignLeft size={13} />}
        <span className="text-[9px] leading-none">{is6Level ? '6L' : 'CL'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold">
      <button
        onClick={() => !is6Level || onToggle()}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          !is6Level
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        Classic
      </button>
      <button
        onClick={() => is6Level || onToggle()}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          is6Level
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        6-Level
      </button>
    </div>
  );
};

export default SidebarSwitcher;
