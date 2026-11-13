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
}) {
  if (loading) {
    return (
      <div className="qs-loading-wrapper">
        <CommonLoader text="Loading opening questions..." size={18} />
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
      {questions.map((question) => {
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
            {/* Question details & Options pills */}
            <div className="qs-item-content">
              {/* Badges / Meta row */}
              <div className="qs-item-meta-row">
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
                  <span key={i} className="qs-preview-pill">
                    {typeof opt === 'object' ? opt.option_text || opt.label : opt}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="qs-item-actions-col">
              <button
                type="button"
                className="qs-edit-btn"
                onClick={() => onEdit?.(question)}
                title="Edit question and options"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="qs-delete-btn"
                onClick={() => onDelete?.(question.id)}
                title="Delete question"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuestionFlowList;
