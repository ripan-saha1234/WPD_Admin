function parseOptions(rawOptions) {
  if (Array.isArray(rawOptions)) return rawOptions;
  if (typeof rawOptions === 'string') {
    try {
      return JSON.parse(rawOptions);
    } catch {
      return [];
    }
  }
  return [];
}

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function QuestionCard({ question, onEdit, onDelete, onToggleActive }) {
  const options = parseOptions(question.options);
  const isActive = Boolean(question.is_active);

  return (
    <div className={`qs-card ${!isActive ? 'qs-card--inactive' : ''}`}>
      {/* Card Top Meta Bar */}
      <div className="qs-card-top-bar">
        <div className="qs-card-status-group">
          {/* Inline Active/Paused Toggle */}
          <button
            type="button"
            className={`qs-status-pill-btn ${isActive ? 'qs-status-pill-btn--active' : 'qs-status-pill-btn--paused'}`}
            onClick={() => onToggleActive(question)}
            title={isActive ? 'Click to pause this prompt' : 'Click to activate this prompt'}
          >
            <span className="qs-status-indicator-dot" />
            {isActive ? 'Active in Rotation' : 'Paused'}
          </button>

          <span className="qs-card-responses-badge">
            📈 {question.response_count || 0} responses
          </span>
        </div>

        {/* Card Actions */}
        <div className="qs-card-actions">
          <button
            type="button"
            className="qs-action-btn qs-action-btn--edit"
            onClick={() => onEdit(question)}
            title="Edit question & chips"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            className="qs-action-btn qs-action-btn--delete"
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Main Question / Welcome Text */}
      <div className="qs-card-content">
        <h4 className="qs-card-question-text">{question.question_text}</h4>

        {/* Suggestion Chips */}
        <div className="qs-card-chips-wrapper">
          <span className="qs-card-chips-label">Visitor Suggestion Chips:</span>
          <div className="qs-card-chips-list">
            {options.map((opt, idx) => {
              const label = typeof opt === 'object' ? opt.option_text || opt.label : String(opt);
              return (
                <div key={idx} className="qs-display-chip">
                  <span className="qs-display-chip-letter">
                    {OPTION_LETTERS[idx] || idx + 1}
                  </span>
                  <span className="qs-display-chip-text">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;

