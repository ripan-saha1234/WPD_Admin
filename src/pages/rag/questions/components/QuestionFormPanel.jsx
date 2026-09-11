import CommonInput from '../../../../components/common-input';
import CommonButton from '../../../../components/common-button';
import CommonToggleSwitch from '../../../../components/common-toggle-switch';

const TYPE_CARDS = [
  {
    id: 'mcq',
    label: 'Multiple Choice',
    description: 'User picks one answer',
    icon: '🔘',
  },
  {
    id: 'poll',
    label: 'Poll',
    description: 'Collect opinion-style votes',
    icon: '📊',
  },
];

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function QuestionFormPanel({
  editId,
  questionText,
  questionType,
  options,
  isActive,
  saving,
  onQuestionTextChange,
  onQuestionTypeChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onActiveChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="qs-form-panel rag-card">
      <div className="qs-form-header">
        <div className="qs-form-header-icon">{editId ? '✏️' : '➕'}</div>
        <div>
          <h3>{editId ? 'Edit Question' : 'Create New Question'}</h3>
          <p className="rag-muted">
            {editId
              ? 'Update the question and save to refresh the chatbot flow.'
              : 'Add a question to your onboarding chatbot sequence.'}
          </p>
        </div>
        {editId && (
          <button type="button" className="qs-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <div className="qs-form-section">
        <span className="qs-form-section-label">1. Question</span>
        <CommonInput
          label="Question text"
          name="questionText"
          multiline
          rows={3}
          required
          placeholder="e.g. What is your primary interest or role?"
          value={questionText}
          onChange={(e) => onQuestionTextChange(e.target.value)}
        />
      </div>

      <div className="qs-form-section">
        <span className="qs-form-section-label">2. Question type</span>
        <div className="qs-type-cards">
          {TYPE_CARDS.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`qs-type-card ${questionType === type.id ? 'active' : ''}`}
              onClick={() => onQuestionTypeChange(type.id)}
            >
              <span className="qs-type-card-icon">{type.icon}</span>
              <span className="qs-type-card-label">{type.label}</span>
              <span className="qs-type-card-desc">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="qs-form-section">
        <div className="qs-options-header">
          <span className="qs-form-section-label">3. Answer options</span>
          <button type="button" className="qs-add-opt-btn" onClick={onAddOption}>
            + Add option
          </button>
        </div>
        <div className="qs-options-list">
          {options.map((opt, index) => (
            <div key={index} className="qs-option-item">
              <span className="qs-option-letter">
                {OPTION_LETTERS[index] || index + 1}
              </span>
              <CommonInput
                name={`option-${index}`}
                placeholder={`Option ${OPTION_LETTERS[index] || index + 1}`}
                value={opt}
                onChange={(e) => onOptionChange(index, e.target.value)}
                required
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
        <p className="qs-form-hint">Minimum 2 options required.</p>
      </div>

      <div className="qs-form-section qs-settings-card">
        <span className="qs-form-section-label">4. Settings</span>
        <div className="qs-toggle-row">
          <CommonToggleSwitch checked={isActive} onChange={onActiveChange} />
          <div>
            <span className="qs-toggle-label">Active in chatbot flow</span>
            <span className="qs-toggle-hint">
              Inactive questions are hidden from users but kept in the list.
            </span>
          </div>
        </div>
      </div>

      <CommonButton
        text={saving ? 'Saving...' : editId ? 'Update Question' : 'Add to Flow'}
        onClick={onSave}
        disabled={saving || !questionText.trim()}
        backgroundColor="#0690fd"
        color="#fff"
        borderColor="#0690fd"
      />
    </div>
  );
}

export default QuestionFormPanel;
