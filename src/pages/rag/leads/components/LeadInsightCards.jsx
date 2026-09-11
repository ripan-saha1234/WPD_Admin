import { getLeadInsightSummary } from '../../mock/leadsMockData';

function LeadInsightCards({ leads }) {
  const summary = getLeadInsightSummary(leads);
  const maxBar = Math.max(summary.hot, summary.warm, summary.cold, 1);

  const cards = [
    { label: 'Total Leads', value: summary.total, icon: '👥', color: '#0690fd' },
    { label: 'Hot Leads', value: summary.hot, icon: '🔥', color: '#ef4444' },
    { label: 'Warm Leads', value: summary.warm, icon: '🌡️', color: '#f59e0b' },
    { label: 'Cold Leads', value: summary.cold, icon: '❄️', color: '#64748b' },
    { label: 'Pending AI', value: summary.pending, icon: '🧠', color: '#8b5cf6' },
    { label: 'Assigned', value: summary.assigned, icon: '✅', color: '#16a34a' },
  ];

  return (
    <section className="leads-insights-section">
      <div className="leads-stat-cards">
        {cards.map((card) => (
          <div key={card.label} className="leads-stat-card">
            <span className="leads-stat-icon">{card.icon}</span>
            <div>
              <span className="leads-stat-label">{card.label}</span>
              <span className="leads-stat-value" style={{ color: card.color }}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="leads-chart-card">
        <h3>Lead distribution</h3>
        <div className="leads-bar-chart">
          {[
            { key: 'hot', label: 'Hot', count: summary.hot, color: '#ef4444' },
            { key: 'warm', label: 'Warm', count: summary.warm, color: '#f59e0b' },
            { key: 'cold', label: 'Cold', count: summary.cold, color: '#94a3b8' },
          ].map((item) => (
            <div key={item.key} className="leads-bar-row">
              <span className="leads-bar-label">{item.label}</span>
              <div className="leads-bar-track">
                <div
                  className="leads-bar-fill"
                  style={{
                    width: `${(item.count / maxBar) * 100}%`,
                    background: item.color,
                  }}
                />
              </div>
              <span className="leads-bar-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeadInsightCards;
