import { useMemo } from 'react';

function LeadInsightCards({ leads = [] }) {
  const summary = useMemo(() => {
    const total = leads.length;
    const synced = leads.filter((l) => l.crmSyncStatus === 'synced').length;
    const pending = leads.filter((l) => l.crmSyncStatus === 'pending').length;
    const failed = leads.filter((l) => l.crmSyncStatus === 'failed').length;
    const companies = new Set(
      leads.map((l) => l.company).filter((c) => c && c !== '—')
    ).size;
    const services = new Set(
      leads.map((l) => l.interestedServiceName).filter((s) => s && s !== '—')
    ).size;

    return { total, synced, pending, failed, companies, services };
  }, [leads]);

  const maxBar = Math.max(summary.synced, summary.pending, summary.failed, 1);

  const cards = [
    { label: 'Total Leads', value: summary.total, icon: '👥', color: '#0690fd' },
    { label: 'CRM Synced', value: summary.synced, icon: '✅', color: '#16a34a' },
    { label: 'Pending Sync', value: summary.pending, icon: '⏳', color: '#f59e0b' },
    { label: 'Failed Sync', value: summary.failed, icon: '⚠️', color: '#ef4444' },
    { label: 'Companies', value: summary.companies, icon: '🏢', color: '#8b5cf6' },
    { label: 'Services Inquired', value: summary.services, icon: '💼', color: '#0284c7' },
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
        <h3>CRM Webhook Status</h3>
        <div className="leads-bar-chart">
          {[
            { key: 'synced', label: 'Synced', count: summary.synced, color: '#16a34a' },
            { key: 'pending', label: 'Pending', count: summary.pending, color: '#f59e0b' },
            { key: 'failed', label: 'Failed', count: summary.failed, color: '#ef4444' },
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
