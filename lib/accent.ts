// Mohed Abbas accentPalette — design-tokens.json se exact colors liye hain
// Har palette me dark aur light themes ke variants hain
export const ACCENT_PALETTES = [
  {
    name: 'teal',
    dark:  { accent: '#62B6CB', glow: 'rgba(98,182,203,0.10)', dim: 'rgba(98,182,203,0.07)', border: 'rgba(98,182,203,0.20)' },
    light: { accent: '#2A9BB5', glow: 'rgba(42,155,181,0.12)', dim: 'rgba(42,155,181,0.08)', border: 'rgba(42,155,181,0.25)' },
  },
  {
    name: 'red',
    dark:  { accent: '#DA3036', glow: 'rgba(218,48,54,0.10)',  dim: 'rgba(218,48,54,0.07)',  border: 'rgba(218,48,54,0.20)'  },
    light: { accent: '#C0272C', glow: 'rgba(192,39,44,0.12)',  dim: 'rgba(192,39,44,0.08)',  border: 'rgba(192,39,44,0.25)'  },
  },
  {
    name: 'orange',
    dark:  { accent: '#FF990A', glow: 'rgba(255,153,10,0.10)', dim: 'rgba(255,153,10,0.07)', border: 'rgba(255,153,10,0.20)' },
    light: { accent: '#E07800', glow: 'rgba(224,120,0,0.12)',  dim: 'rgba(224,120,0,0.08)',  border: 'rgba(224,120,0,0.25)'  },
  },
  {
    name: 'green',
    dark:  { accent: '#93B99E', glow: 'rgba(147,185,158,0.10)',dim: 'rgba(147,185,158,0.07)',border: 'rgba(147,185,158,0.20)'},
    light: { accent: '#5A8F6A', glow: 'rgba(90,143,106,0.12)', dim: 'rgba(90,143,106,0.08)', border: 'rgba(90,143,106,0.25)'},
  },
  // Awwwards se inspired extra colors:
  {
    name: 'electric-blue',
    dark:  { accent: '#4169E1', glow: 'rgba(65,105,225,0.10)', dim: 'rgba(65,105,225,0.07)', border: 'rgba(65,105,225,0.20)' },
    light: { accent: '#2B4FC7', glow: 'rgba(43,79,199,0.12)',  dim: 'rgba(43,79,199,0.08)',  border: 'rgba(43,79,199,0.25)'  },
  },
  {
    name: 'gold',
    dark:  { accent: '#FFB800', glow: 'rgba(255,184,0,0.10)',  dim: 'rgba(255,184,0,0.07)',  border: 'rgba(255,184,0,0.20)'  },
    light: { accent: '#C98F00', glow: 'rgba(201,143,0,0.12)',  dim: 'rgba(201,143,0,0.08)',  border: 'rgba(201,143,0,0.25)'  },
  },
] as const;

export function getRandomAccent() {
  return ACCENT_PALETTES[Math.floor(Math.random() * ACCENT_PALETTES.length)];
}

// Index return karega taaki session me dynamic theme persist rahe
export function getSessionAccentIndex(): number {
  if (typeof window === 'undefined') return 0;
  const saved = sessionStorage.getItem('accent-index');
  if (saved !== null) return Number(saved);
  const idx = Math.floor(Math.random() * ACCENT_PALETTES.length);
  sessionStorage.setItem('accent-index', String(idx));
  return idx;
}

export function applyAccentToDOM(palette: typeof ACCENT_PALETTES[number], theme: 'dark' | 'light') {
  const colors = palette[theme];
  const root = document.documentElement;
  root.style.setProperty('--accent',        colors.accent);
  root.style.setProperty('--accent-glow',   colors.glow);
  root.style.setProperty('--accent-dim',    colors.dim);
  root.style.setProperty('--accent-border', colors.border);
}
