function QuestionSummaryCards({ questions }) {
  const active = questions.filter((q) => q.is_active).length;
  const inactive = questions.length - active;
  const totalResponses = questions.reduce(
    (sum, q) => sum + (q.response_count || 0),
    0
  );
  const mcqCount = questions.filter((q) => q.question_type === 'mcq').length;
  const pollCount = questions.filter((q) => q.question_type === 'poll').length;

  const cards = [
    { label: 'Total Questions', value: questions.length, icon: '📋', color: '#0690fd' },
    { label: 'Active in Flow', value: active, icon: '✅', color: '#16a34a' },
    { label: 'Inactive', value: inactive, icon: '⏸️', color: '#64748b' },
    { label: 'Total Responses', value: totalResponses, icon: '📊', color: '#8b5cf6' },
  ];

  return (
    <section className="qs-summary-section">
      <div className="qs-stat-cards">
        {cards.map((card) => (
          <div key={card.label} className="qs-stat-card">
            <span className="qs-stat-icon">{card.icon}</span>
            <div>
              <span className="qs-stat-label">{card.label}</span>
              <span className="qs-stat-value" style={{ color: card.color }}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="qs-type-breakdown">
        <h3>Question types</h3>
        <div className="qs-type-bars">
          <div className="qs-type-bar-row">
            <span>MCQ</span>
            <div className="qs-type-track">
              <div
                className="qs-type-fill qs-type-fill--mcq"
                style={{
                  width: questions.length
                    ? `${(mcqCount / questions.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <span>{mcqCount}</span>
          </div>
          <div className="qs-type-bar-row">
            <span>Poll</span>
            <div className="qs-type-track">
              <div
                className="qs-type-fill qs-type-fill--poll"
                style={{
                  width: questions.length
                    ? `${(pollCount / questions.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <span>{pollCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuestionSummaryCards;
