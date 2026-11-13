import CommonButton from '../../../../components/common-button';

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function QuestionFormPanel({
  editId,
  questionText,
  options,
  isActive,
  saving,
  templates = [],
  onApplyTemplate,
  onQuestionTextChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onActiveChange,
  onSave,
  onCancel,
}) {
  const charCount = questionText.length;

  return (
    <div className="qs-form-panel rag-card">
      {/* Header */}
      <div className="qs-form-header">
        <div className="qs-form-header-badge">
          {editId ? 'Editing Question' : 'New Question'}
        </div>
        <div className="qs-form-header-title-row">
          <h3 className="qs-form-title">
            {editId ? 'Edit Opening Question' : 'Create Opening Question'}
          </h3>
          {editId && (
            <button type="button" className="qs-cancel-btn" onClick={onCancel}>
              ✕ Discard
            </button>
          )}
        </div>
        <p className="qs-form-desc">
          Opening questions appear immediately when visitors launch Jerry AI, offering clickable chips to steer the conversation.
        </p>
      </div>

      {/* Quick Inspiration Templates */}
      {!editId && templates.length > 0 && (
        <div className="qs-templates-box">
          <span className="qs-templates-title">⚡ Quick Templates:</span>
          <div className="qs-templates-chips">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                className="qs-template-chip"
                onClick={() => onApplyTemplate?.(tpl)}
                title={`Use: "${tpl.text}"`}
              >
                {tpl.text.length > 32 ? `${tpl.text.slice(0, 32)}…` : tpl.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Question text */}
      <div className="qs-form-section">
        <div className="qs-section-header">
          <label className="qs-section-label" htmlFor="qs-question-text">
            1. Prompt Question
          </label>
          <span className={`qs-char-count ${charCount > 100 ? 'qs-char-count--warn' : ''}`}>
            {charCount} / 120 chars
          </span>
        </div>
        <textarea
          id="qs-question-text"
          className="rag-textarea qs-textarea"
          rows={3}
          maxLength={120}
          placeholder="e.g. What brings you here today? How can Jerry assist you?"
          value={questionText}
          onChange={(e) => onQuestionTextChange(e.target.value)}
        />
      </div>

      {/* Section 2: Answer Options / Suggestion Chips */}
      <div className="qs-form-section">
        <div className="qs-options-header">
          <span className="qs-section-label">
            2. Suggestion Chips ({options.length})
          </span>
          <button
            type="button"
            className="qs-add-opt-btn"
            onClick={onAddOption}
            disabled={options.length >= 6}
          >
            + Add Option
          </button>
        </div>

        <div className="qs-options-list">
          {options.map((opt, index) => (
            <div key={index} className="qs-option-item">
              <span className="qs-option-letter">
                {OPTION_LETTERS[index] || index + 1}
              </span>
              <input
                type="text"
                className="qs-option-input"
                placeholder={`Option ${OPTION_LETTERS[index] || index + 1} (e.g. ${
                  index === 0 ? 'Custom Web App' : index === 1 ? 'Mobile Development' : 'AI Automation'
                })`}
                value={opt}
                maxLength={45}
                onChange={(e) => onOptionChange(index, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="qs-option-remove"
                  onClick={() => onRemoveOption(index)}
                  title="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="qs-form-hint">
          Provide 2 to 6 concise choices (under 45 characters each) for clean pill display.
        </p>
      </div>

      {/* Section 3: Status Switch */}
      <div className="qs-switch-row">
        <label className="qs-switch-container" htmlFor="qs-active-toggle">
          <input
            id="qs-active-toggle"
            type="checkbox"
            className="qs-switch-input"
            checked={isActive}
            onChange={(e) => onActiveChange(e.target.checked)}
          />
          <span className="qs-switch-slider" />
        </label>
        <div className="qs-switch-meta">
          <span className="qs-switch-title">Active Opening Prompt</span>
          <span className="qs-switch-desc">
            When enabled, Jerry can randomly pick this opening prompt to greet visitors.
          </span>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="qs-form-actions">
        <CommonButton
          text={saving ? 'Saving...' : editId ? 'Save Changes' : 'Publish Question'}
          onClick={onSave}
          disabled={saving || !questionText.trim()}
          backgroundColor="var(--primary)"
          color="#ffffff"
          borderColor="var(--primary)"
        />
        {editId && (
          <button type="button" className="qs-secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionFormPanel;
