function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `Created ${d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '';
  }
}

function HookMessageCard({ message, onEdit, onDelete, onToggleActive }) {
  const isActive = Boolean(message.is_active);
  const delaySec = message.display_frequency || 30;

  return (
    <div className={`hm-card ${!isActive ? 'hm-card--inactive' : ''}`}>
      {/* Top Meta Bar */}
      <div className="hm-card-top-bar">
        <div className="hm-card-status-group">
          {/* Active / Paused Toggle Pill */}
          <button
            type="button"
            className={`hm-status-pill-btn ${
              isActive ? 'hm-status-pill-btn--active' : 'hm-status-pill-btn--paused'
            }`}
            onClick={() => onToggleActive(message)}
            title={isActive ? 'Click to pause this nudge' : 'Click to activate this nudge on live site'}
          >
            <span className="hm-status-indicator-dot" />
            {isActive ? 'Active on Live Widget' : 'Paused'}
          </button>

          {/* Delay Badge */}
          <span className="hm-card-delay-badge" title="Seconds after visitor arrival before popup">
            ⏱ {delaySec}s delay
          </span>

          {/* Date Created */}
          {message.created_at && (
            <span className="hm-card-date">{formatDate(message.created_at)}</span>
          )}
        </div>

        {/* Card Action Buttons */}
        <div className="hm-card-actions">
          <button
            type="button"
            className="hm-action-btn hm-action-btn--edit"
            onClick={() => onEdit(message)}
            title="Edit nudge text and delay"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            className="hm-action-btn hm-action-btn--delete"
            onClick={() => onDelete(message)}
            title="Delete this hook message"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Card Content - Jerry Speech Bubble Preview */}
      <div className="hm-card-content">
        <div className="hm-nudge-bubble">
          <div className="hm-nudge-bubble-head">
            <span className="hm-nudge-avatar" aria-hidden="true">
              <span className="hm-nudge-orb-dot" />
            </span>
            <span className="hm-nudge-author">Jerry AI</span>
            <span className="hm-nudge-badge">Proactive Nudge</span>
          </div>

          <p className="hm-nudge-text">{message.message_text}</p>

          <div className="hm-nudge-cta-row">
            <span className="hm-nudge-cta-pill">Chat with Jerry →</span>
            <span className="hm-nudge-tip">Pops up next to floating launcher button</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HookMessageCard;

