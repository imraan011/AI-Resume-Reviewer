// Bold editorial accent palettes - dark theme only
export const ACCENT_PALETTES = [
  {
    name: 'crimson',          // Bold red — newspaper masthead energy
    accent:  '#DA3036',
    glow:    'rgba(218,48,54,0.12)',
    dim:     'rgba(218,48,54,0.07)',
    border:  'rgba(218,48,54,0.22)',
    // Semantic overrides for this palette:
    success: '#4CAF6E',       // muted green (not sage)
    warning: '#FFB800',
  },
  {
    name: 'gold',             // Financial times / Le Monde gold
    accent:  '#FFB800',
    glow:    'rgba(255,184,0,0.12)',
    dim:     'rgba(255,184,0,0.07)',
    border:  'rgba(255,184,0,0.22)',
    success: '#4CAF6E',
    warning: '#FF990A',
  },
  {
    name: 'ember',            // Deep orange — Awwwards editorial fire
    accent:  '#FF6B2B',
    glow:    'rgba(255,107,43,0.12)',
    dim:     'rgba(255,107,43,0.07)',
    border:  'rgba(255,107,43,0.22)',
    success: '#4CAF6E',
    warning: '#FFB800',
  },
  {
    name: 'arctic',           // Electric blue — cold precision
    accent:  '#0EA5E9',
    glow:    'rgba(14,165,233,0.12)',
    dim:     'rgba(14,165,233,0.07)',
    border:  'rgba(14,165,233,0.22)',
    success: '#4CAF6E',
    warning: '#FFB800',
  },
] as const;

export function getRandomAccent() {
  return ACCENT_PALETTES[Math.floor(Math.random() * ACCENT_PALETTES.length)];
}

// Index return karega taaki session me dynamic accent persist kare
export function getSessionAccentIndex(): number {
  if (typeof window === 'undefined') return 0;
  const saved = sessionStorage.getItem('accent-index');
  if (saved !== null) return Number(saved);
  const idx = Math.floor(Math.random() * ACCENT_PALETTES.length);
  sessionStorage.setItem('accent-index', String(idx));
  return idx;
}

export function applyAccentToDOM(palette: typeof ACCENT_PALETTES[number]) {
  const root = document.documentElement;
  root.style.setProperty('--accent',        palette.accent);
  root.style.setProperty('--accent-glow',   palette.glow);
  root.style.setProperty('--accent-dim',    palette.dim);
  root.style.setProperty('--accent-border', palette.border);
  root.style.setProperty('--success',       palette.success);
  root.style.setProperty('--warning',       palette.warning);
}

