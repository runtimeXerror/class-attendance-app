export const LightTheme = {
  name: 'light',
  bg: '#F5F3FF',              // Soft lavender BG — warmer than plain slate
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  primary: '#7C3AED',         // Vibrant violet — richer than indigo
  primaryDark: '#6D28D9',
  primaryLight: '#EDE9FE',
  accent: '#EC4899',          // Pink accent
  verified: '#2563EB',
  text: '#1E1B4B',            // Deep indigo-black for text
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  border: '#E0E7FF',
  borderFocus: '#7C3AED',
  navbar: '#6D28D9',
};

export const DarkTheme = {
  name: 'dark',
  bg: '#0F172A',           // Slate 900 — deep navy, less harsh than pure black
  card: '#1E293B',          // Slate 800 — elevated surface
  cardElevated: '#334155',  // Slate 700
  primary: '#60A5FA',       // Blue 400 — soft sky blue, modern & calming
  primaryDark: '#3B82F6',   // Blue 500
  primaryLight: '#1E3A8A',  // Blue 900
  accent: '#A78BFA',        // Violet 400 — pops against navy
  verified: '#38BDF8',      // Sky 400
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  border: '#334155',
  borderFocus: '#60A5FA',
  navbar: '#1E3A8A',         // Deep indigo navbar — modern, not boring black
};

export const Radius = { sm: 6, md: 10, lg: 14, xl: 20, full: 999 };

export const Shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
};
