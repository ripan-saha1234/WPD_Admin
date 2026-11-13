function QuestionSummaryCards({ questions }) {
  const active = questions.filter((q) => q.is_active).length;
  const inactive = questions.length - active;
  const totalResponses = questions.reduce(
    (sum, q) => sum + (q.response_count || 0),
    0
  );

  const cards = [
    { label: 'Total Questions', value: questions.length, icon: '📋', color: 'var(--primary-text)' },
    { label: 'Active Prompts', value: active, icon: '✅', color: 'var(--success-text)' },
    { label: 'Paused', value: inactive, icon: '⏸️', color: 'var(--text-2)' },
    { label: 'Total Responses', value: totalResponses, icon: '📊', color: 'var(--info-text)' },
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

      <div className="qs-type-breakdown" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 600 }}>Greeting Prompt Rotation</h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.45 }}>
          Jerry randomly picks one active opening prompt for each new visitor. Option chips appear as clickable starting prompts in the chat widget.
        </p>
      </div>
    </section>
  );
}

export default QuestionSummaryCards;
