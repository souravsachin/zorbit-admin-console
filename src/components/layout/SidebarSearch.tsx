import React from 'react';
import { Search, X } from 'lucide-react';

interface SidebarSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search menu...',
}) => {
  return (
    <div className="relative mx-2 my-1.5 shrink-0">
      <Search
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-7 pr-6 py-1.5 text-[11px] rounded-md
          bg-gray-50 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-300
          placeholder-gray-400 dark:placeholder-gray-600
          outline-none focus:border-indigo-400 dark:focus:border-indigo-500
          transition-colors
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};

export default SidebarSearch;
