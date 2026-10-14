import '../css/common-button.css';

/*
 * Callers across the app pass legacy hex colours (e.g. '#0690fd', '#fff').
 * Map the familiar ones onto themed variants so buttons follow light/dark mode;
 * anything unrecognised keeps its explicit inline colours.
 */
const norm = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const PRIMARY_BG = ['#0690fd', '#2563eb', '#3b82f6', '#4f46e5', '#6366f1', '#1d4ed8', '#000080', 'var(--primary)'];
const NEUTRAL_BG = ['#fff', '#ffffff', 'white', 'transparent', '#f1f5f9', '#f8fafc', '#f4f4f4', '#f9fafb', 'var(--surface)'];
const DANGER_BG = ['#ef4444', '#dc2626', '#ff4444', '#e53935', '#b91c1c', 'var(--danger)'];
const DANGER_SOFT_BG = ['#fee2e2', '#fef2f2', '#fde8e8'];
const DANGER_FG = ['#ef4444', '#dc2626', '#b91c1c', '#ff4444'];
const PRIMARY_FG = ['#0690fd', '#2563eb', '#3b82f6', '#4f46e5'];

function resolveVariant(backgroundColor, color, borderColor) {
  const bg = norm(backgroundColor);
  const fg = norm(color);
  const border = norm(borderColor);

  if (!bg && !fg && !border) return 'secondary';
  if (PRIMARY_BG.includes(bg)) return 'primary';
  if (DANGER_BG.includes(bg)) return 'danger';
  if (DANGER_SOFT_BG.includes(bg)) return 'danger-soft';
  if (NEUTRAL_BG.includes(bg) || !bg) {
    if (DANGER_FG.includes(fg) || DANGER_FG.includes(border)) return 'danger-outline';
    if (PRIMARY_FG.includes(fg)) return 'primary-outline';
    return 'secondary';
  }
  return null;
}

function CommonButton({ text = '', img = '', backgroundColor, color, borderColor, onClick = () => { }, className = '', disabled = false }) {
  const variant = resolveVariant(backgroundColor, color, borderColor);
  const style = variant
    ? undefined
    : { backgroundColor, color, borderColor };

  return (
    <button
      type="button"
      className={`common-button ${variant ? `common-button--${variant}` : ''} ${className} ${disabled ? 'disabled' : ''}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {img && <img src={img} alt="" />}
      {text && text}
    </button>
  );
}

export default CommonButton;
