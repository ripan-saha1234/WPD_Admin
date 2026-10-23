import EmptyState from '../../components/EmptyState';
import CommonLoader from '../../../../components/common-loader';

function parseOptions(question) {
  if (Array.isArray(question.options)) return question.options;
  if (typeof question.options === 'string') {
    try {
      return JSON.parse(question.options);
    } catch {
      return [];
    }
  }
  return [];
}

function QuestionFlowList({
  questions,
  totalCount,
  loading,
  editId,
  searchQuery,
  onHoverQuestion,
  onToggleActive,
  onEdit,
  onDelete,
  onMove,
}) {
  if (loading) {
    return (
      <div className="qs-loading-wrapper">
        <CommonLoader text="Loading question sequence..." size={18} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="qs-empty-state">
        <EmptyState
          icon={searchQuery ? '🔍' : '📋'}
          message={
            searchQuery
              ? `No opening questions match "${searchQuery}".`
              : totalCount > 0
              ? 'No questions match the selected filter.'
              : 'No opening questions configured yet. Create your first question using the form on the left.'
          }
        />
      </div>
    );
  }

  return (
    <div className="qs-items-container">
      {questions.map((question, index) => {
        const opts = parseOptions(question);
        const isEditing = String(editId) === String(question.id);

        return (
          <div
            key={question.id}
            className={`qs-item-card ${isEditing ? 'qs-item-card--editing' : ''} ${
              !question.is_active ? 'qs-item-card--inactive' : ''
            }`}
            onMouseEnter={() => onHoverQuestion?.(question)}
            onMouseLeave={() => onHoverQuestion?.(null)}
          >
            {/* Left Column: Reorder and Step indicator */}
            <div className="qs-item-rank-col">
              <button
                type="button"
                className="qs-reorder-btn"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                title="Move up in sequence"
              >
                ▲
              </button>
              <span className="qs-item-rank">#{index + 1}</span>
              <button
                type="button"
                className="qs-reorder-btn"
                disabled={index === questions.length - 1}
                onClick={() => onMove(index, 1)}
                title="Move down in sequence"
              >
                ▼
              </button>
            </div>

            {/* Middle Column: Question details & Options pills */}
            <div className="qs-item-content">
              {/* Badges / Meta row */}
              <div className="qs-item-meta-row">
                <span
                  className={`qs-type-badge qs-type-badge--${
                    question.question_type || 'mcq'
                  }`}
                >
                  {question.question_type === 'poll' ? '📊 Poll' : '🔘 MCQ'}
                </span>

                <button
                  type="button"
                  className={`qs-status-toggle-btn ${
                    question.is_active
                      ? 'qs-status-toggle-btn--active'
                      : 'qs-status-toggle-btn--inactive'
                  }`}
                  onClick={() => onToggleActive?.(question)}
                  title={
                    question.is_active
                      ? 'Click to pause this question'
                      : 'Click to activate this question'
                  }
                >
                  <span className="qs-status-dot" />
                  {question.is_active ? 'Active' : 'Paused'}
                </button>

                <span className="qs-response-meta">
                  📈 {question.response_count || 0} user responses
                </span>
              </div>

              {/* Question Text */}
              <h4 className="qs-item-question-text">{question.question_text}</h4>

              {/* Option Chips preview */}
              <div className="qs-item-chips-row">
                {opts.map((opt, i) => (
                  <span key={i} className="qs-item-chip">
                    <span className="qs-chip-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="qs-chip-text">{opt}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="qs-item-actions-col">
              <button
                type="button"
                className="qs-action-icon-btn qs-action-icon-btn--edit"
                onClick={() => onEdit(question)}
                title="Edit question & options"
              >
                ✏️
              </button>
              <button
                type="button"
                className="qs-action-icon-btn qs-action-icon-btn--delete"
                onClick={() => onDelete(question.id)}
                title="Delete question"
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuestionFlowList;

