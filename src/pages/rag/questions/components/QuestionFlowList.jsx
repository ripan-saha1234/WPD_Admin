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
  loading,
  editId,
  onEdit,
  onDelete,
  onMove,
}) {
  if (loading) {
    return <CommonLoader text="Loading question flow..." size={16} />;
  }

  if (questions.length === 0) {
    return (
      <EmptyState
        icon="📋"
        message="No questions in your flow yet. Create your first question using the form on the left."
      />
    );
  }

  return (
    <div className="qs-flow-timeline">
      {questions.map((question, index) => {
        const opts = parseOptions(question);
        const isEditing = String(editId) === String(question.id);
        const isLast = index === questions.length - 1;

        return (
          <div
            key={question.id}
            className={`qs-flow-item ${isEditing ? 'qs-flow-item--editing' : ''}`}
          >
            <div className="qs-flow-rail">
              <div className="qs-flow-step">{index + 1}</div>
              {!isLast && <div className="qs-flow-line" />}
            </div>

            <div className="qs-flow-card">
              <div className="qs-flow-card-top">
                <div className="qs-flow-badges">
                  <span className={`qs-type-pill qs-type-pill--${question.question_type || 'mcq'}`}>
                    {question.question_type === 'poll' ? 'Poll' : 'MCQ'}
                  </span>
                  <span
                    className={`qs-status-pill ${
                      question.is_active ? 'qs-status-pill--active' : 'qs-status-pill--inactive'
                    }`}
                  >
                    {question.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="qs-response-count">
                    {question.response_count || 0} responses
                  </span>
                </div>
                <div className="qs-flow-actions">
                  <button
                    type="button"
                    className="qs-action-btn"
                    disabled={index === 0}
                    onClick={() => onMove(index, -1)}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="qs-action-btn"
                    disabled={isLast}
                    onClick={() => onMove(index, 1)}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="qs-action-btn qs-action-btn--edit"
                    onClick={() => onEdit(question)}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="qs-action-btn qs-action-btn--delete"
                    onClick={() => onDelete(question.id)}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="qs-flow-question">{question.question_text}</p>

              <div className="qs-flow-options">
                {opts.map((opt, i) => (
                  <span key={`${opt}-${i}`} className="qs-flow-option-chip">
                    <span className="qs-flow-option-dot" />
                    {opt}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="qs-editing-banner">Currently editing this question</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuestionFlowList;
