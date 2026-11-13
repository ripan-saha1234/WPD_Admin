import { useEffect } from 'react';
import CommonButton from '../../../../components/common-button';

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const QUESTION_TEMPLATES = [
  {
    text: 'What brings you to Web Prism Dynamics today?',
    options: [
      'Custom Web Application',
      'Mobile App Development',
      'AI & Machine Learning',
      'Dedicated Engineering Team',
    ],
  },
  {
    text: 'What type of project are you looking to build?',
    options: [
      'New SaaS / MVP from scratch',
      'Revamp existing platform',
      'Cloud & DevOps infrastructure',
      'Explore tech capabilities',
    ],
  },
  {
    text: 'How can our engineering team assist you?',
    options: [
      'Web & Cloud Software',
      'Mobile Apps (iOS & Android)',
      'AI Automation & Agents',
      'Talk to an expert',
    ],
  },
];

function QuestionDrawer({
  isOpen,
  editId,
  questionText,
  options,
  isActive,
  saving,
  onClose,
  onQuestionTextChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onMoveOption,
  onActiveChange,
  onApplyTemplate,
  onSave,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const charCount = questionText.length;
  const validOptions = options.filter((o) => o.trim().length > 0);

  return (
    <div className="qs-drawer-root">
      {/* Backdrop Overlay */}
      <div className="qs-drawer-backdrop" onClick={onClose} />

      {/* Slide-Over Drawer Panel */}
      <div className="qs-drawer-panel" role="dialog" aria-modal="true">
        {/* Drawer Header */}
        <div className="qs-drawer-header">
          <div className="qs-drawer-header-info">
            <span className="qs-drawer-badge">
              {editId ? 'Editing Prompt' : 'New Opening Prompt'}
            </span>
            <h3 className="qs-drawer-title">
              {editId ? 'Edit Opening Question' : 'Create Opening Question'}
            </h3>
            <p className="qs-drawer-desc">
              Jerry greets visitors with this question and displays the suggestion chips as quick-replies.
            </p>
          </div>
          <button
            type="button"
            className="qs-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="qs-drawer-body">
          {/* Quick Templates */}
          {!editId && (
            <div className="qs-drawer-section">
              <label className="qs-section-label">⚡ Quick Inspiration Templates</label>
              <div className="qs-template-pills">
                {QUESTION_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    className="qs-template-pill-btn"
                    onClick={() => onApplyTemplate(tpl)}
                  >
                    {tpl.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Question / Welcome Message */}
          <div className="qs-drawer-section">
            <div className="qs-section-header">
              <label className="qs-section-label" htmlFor="drawer-question-text">
                1. Visitor Welcome Question *
              </label>
              <span className={`qs-char-count ${charCount > 120 ? 'qs-char-count--warn' : ''}`}>
                {charCount} / 140
              </span>
            </div>
            <textarea
              id="drawer-question-text"
              className="rag-textarea qs-drawer-textarea"
              rows={3}
              maxLength={140}
              placeholder="e.g. What brings you to Web Prism Dynamics today?"
              value={questionText}
              onChange={(e) => onQuestionTextChange(e.target.value)}
            />
            <span className="qs-field-hint">
              This message appears as Jerry's opening speech bubble when visitors open the widget.
            </span>
          </div>

          {/* Section 2: Suggestion Chips */}
          <div className="qs-drawer-section">
            <div className="qs-section-header">
              <label className="qs-section-label">
                2. Suggestion Chips ({options.length})
              </label>
              <button
                type="button"
                className="qs-add-chip-btn"
                onClick={onAddOption}
                disabled={options.length >= 6}
              >
                + Add Chip
              </button>
            </div>

            <div className="qs-chips-editor-list">
              {options.map((opt, index) => (
                <div key={index} className="qs-chip-editor-row">
                  <span className="qs-chip-letter-badge">
                    {OPTION_LETTERS[index] || index + 1}
                  </span>
                  <input
                    type="text"
                    className="qs-chip-input"
                    placeholder={`Chip ${OPTION_LETTERS[index] || index + 1} label...`}
                    value={opt}
                    maxLength={40}
                    onChange={(e) => onOptionChange(index, e.target.value)}
                  />
                  {/* Reorder Buttons */}
                  <div className="qs-chip-order-btns">
                    <button
                      type="button"
                      className="qs-chip-order-btn"
                      disabled={index === 0}
                      onClick={() => onMoveOption(index, -1)}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="qs-chip-order-btn"
                      disabled={index === options.length - 1}
                      onClick={() => onMoveOption(index, 1)}
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                  {/* Delete Option */}
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="qs-chip-remove-btn"
                      onClick={() => onRemoveOption(index)}
                      title="Remove Chip"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <span className="qs-field-hint">
              Visitors click a chip to initiate the conversation with that topic. 2 to 6 chips recommended.
            </span>
          </div>

          {/* Section 3: Live Widget Simulator / Preview */}
          <div className="qs-drawer-section">
            <label className="qs-section-label">3. Live Chatbot Widget Preview</label>
            <div className="qs-live-preview-box">
              <div className="qs-preview-chat-window">
                <div className="qs-preview-message-group">
                  <div className="qs-preview-avatar">🤖</div>
                  <div className="qs-preview-bubble">
                    <span className="qs-preview-author">Jerry AI</span>
                    <p className="qs-preview-text">
                      {questionText.trim() || 'Welcome! How can our team assist you today?'}
                    </p>
                  </div>
                </div>

                {/* Suggestion Chips Below */}
                <div className="qs-preview-chips-container">
                  {validOptions.length > 0 ? (
                    validOptions.map((chip, idx) => (
                      <span key={idx} className="qs-preview-chip">
                        {chip}
                      </span>
                    ))
                  ) : (
                    <span className="qs-preview-chip-placeholder">
                      Add options above to preview chips...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Active Switch */}
          <div className="qs-drawer-section qs-switch-section">
            <label className="qs-switch-container" htmlFor="drawer-active-toggle">
              <input
                id="drawer-active-toggle"
                type="checkbox"
                className="qs-switch-input"
                checked={isActive}
                onChange={(e) => onActiveChange(e.target.checked)}
              />
              <span className="qs-switch-slider" />
            </label>
            <div className="qs-switch-label-group">
              <span className="qs-switch-title">Active in Live Rotation</span>
              <span className="qs-switch-desc">
                When enabled, Jerry will randomly select this prompt to greet website visitors.
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="qs-drawer-footer">
          <button type="button" className="qs-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <CommonButton
            text={saving ? 'Saving...' : editId ? 'Save Changes' : 'Publish Question'}
            onClick={onSave}
            disabled={saving || !questionText.trim() || validOptions.length < 2}
            backgroundColor="var(--primary)"
            color="#ffffff"
            borderColor="var(--primary)"
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionDrawer;

