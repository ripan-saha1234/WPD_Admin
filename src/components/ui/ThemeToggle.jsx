import { useThemeMode } from '../../context/ThemeContext';
import { MoonIcon, SunIcon } from './icons';

function ThemeToggle({ className = '' }) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      className={`app-theme-toggle${isDark ? ' is-dark' : ''} ${className}`}
      onClick={toggleMode}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="app-theme-toggle-thumb">
        {isDark ? <MoonIcon size={14} /> : <SunIcon size={14} />}
      </span>
      <SunIcon size={14} className="app-theme-toggle-icon app-theme-toggle-icon--sun" />
      <MoonIcon size={14} className="app-theme-toggle-icon app-theme-toggle-icon--moon" />
    </button>
  );
}

export default ThemeToggle;
