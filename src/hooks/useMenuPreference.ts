import { useState, useCallback } from 'react';

export type MenuStyle = 'classic' | '6level';

const STORAGE_KEY = 'zorbit_menu_style';

function readStorage(): MenuStyle {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'classic' || v === '6level') return v;
  } catch { /* ignore */ }
  return 'classic';
}

export function useMenuPreference() {
  const [menuStyle, setMenuStyleState] = useState<MenuStyle>(readStorage);

  const setMenuStyle = useCallback((style: MenuStyle) => {
    try {
      localStorage.setItem(STORAGE_KEY, style);
    } catch { /* ignore */ }
    setMenuStyleState(style);
  }, []);

  const toggleMenuStyle = useCallback(() => {
    setMenuStyle(readStorage() === 'classic' ? '6level' : 'classic');
  }, [setMenuStyle]);

  return { menuStyle, setMenuStyle, toggleMenuStyle };
}
