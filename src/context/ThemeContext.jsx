import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const STORAGE_KEY = 'wpd-admin-theme';

export const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
  setMode: () => {},
});

function readInitialMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage unavailable — fall through to system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** MUI palette mirrors the CSS tokens in index.css so portals (dialogs, toasts) match the app */
function buildMuiTheme(mode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#6366f1' : '#4f46e5', contrastText: '#ffffff' },
      secondary: { main: dark ? '#a78bfa' : '#7c3aed' },
      error: { main: dark ? '#ef4444' : '#dc2626' },
      warning: { main: dark ? '#f59e0b' : '#d97706' },
      success: { main: dark ? '#22c55e' : '#16a34a' },
      info: { main: dark ? '#38bdf8' : '#0284c7' },
      background: {
        default: dark ? '#0a0d14' : '#f4f6fb',
        paper: dark ? '#11151f' : '#ffffff',
      },
      text: {
        primary: dark ? '#e8ecf4' : '#0f172a',
        secondary: dark ? '#a3adbf' : '#475569',
      },
      divider: dark ? '#222a3a' : '#e6e9f0',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? '#e8ecf4' : '#0f172a',
            color: dark ? '#0f172a' : '#ffffff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
          },
        },
      },
    },
  });
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(readInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    window.setTimeout(() => root.classList.remove('theme-transition'), 300);
  }, []);

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
