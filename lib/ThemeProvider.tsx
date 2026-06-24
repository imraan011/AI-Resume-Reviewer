'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { ACCENT_PALETTES, getSessionAccentIndex, applyAccentToDOM } from './accent';

type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggle: () => void; accentName: string; }
const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, accentName: 'teal' });
export const useTheme = () => useContext(Ctx);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentIdx, setAccentIdx] = useState(0);

  useEffect(() => {
    // Iss session ke liye accent select karein (random, sessionStorage me save hota hai)
    const idx = getSessionAccentIndex();
    setAccentIdx(idx);

    // Saved theme check karein (localStorage se) ya default dark apply karein
    const saved = localStorage.getItem('theme') as Theme | null;
    const active = saved || 'dark';
    setTheme(active);

    // Dono ko DOM par apply karein
    document.documentElement.setAttribute('data-theme', active);
    applyAccentToDOM(ACCENT_PALETTES[idx], active);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    applyAccentToDOM(ACCENT_PALETTES[accentIdx], next);
  };

  return (
    <Ctx.Provider value={{ theme, toggle, accentName: ACCENT_PALETTES[accentIdx].name }}>
      {children}
    </Ctx.Provider>
  );
}
