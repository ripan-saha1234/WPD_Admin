import { useCallback, useEffect, useState, useMemo } from 'react';
import CommonLoader from '../../../components/common-loader';
import EmptyState from '../components/EmptyState';
import { getRagVisitorDemandAnalytics } from '../../../services/ragAdminService';

function SurveyAnalyticsTab({ refreshKey, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // 'all', 'services', 'funnel', 'polls'

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data: resData } = await getRagVisitorDemandAnalytics();
      if (!response.ok) throw new Error(resData?.error || resData?.detail || 'Failed to load analytics');
      setData(resData || null);
    } catch (err) {
      showToast?.(err.message, 'error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [refreshKey, loadAnalytics]);

  const summary = data?.summary || {};
  const serviceDemand = data?.service_demand || [];
  const funnel = data?.funnel || [];
  const intents = data?.intents || [];
  const openingPolls = data?.opening_polls || [];
  const knowledgeGaps = data?.knowledge_gaps || [];

  if (loading && !data) {
    return <CommonLoader text="Analyzing visitor demand & intents..." />;
  }

  if (!data || (!serviceDemand.length && !funnel.length)) {
    return (
      <div className="rag-tab-content">
        <EmptyState
          icon="📊"
          message="No visitor sessions or intent data recorded yet."
          actionText="Refresh Analytics"
          onAction={loadAnalytics}
        />
      </div>
    );
  }

  return (
    <div className="rag-tab-content rag-demand-analytics-page">
      {/* ── Top 4 Metric KPI Cards ── */}
      <div className="rag-kpi-grid">
        {/* Metric 1 */}
        <div className="rag-kpi-card">
          <div className="rag-kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            👥
          </div>
          <div className="rag-kpi-info">
            <span className="rag-kpi-label">Total Visitor Sessions</span>
            <span className="rag-kpi-val">{summary.total_sessions || 0}</span>
            <span className="rag-kpi-sub">
              {summary.avg_turns_per_session || 0} avg turns / session · {summary.total_messages || 0} msgs
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rag-kpi-card">
          <div className="rag-kpi-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
            🎯
          </div>
          <div className="rag-kpi-info">
            <span className="rag-kpi-label">High-Intent Buying Signals</span>
            <span className="rag-kpi-val">{summary.commercial_signals || 0}</span>
            <span className="rag-kpi-sub">
              Scope sharing, pricing checks &amp; direct calls
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rag-kpi-card">
          <div className="rag-kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            🚀
          </div>
          <div className="rag-kpi-info">
            <span className="rag-kpi-label">Top Demanded Service</span>
            <span className="rag-kpi-val" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {summary.top_demanded_service || 'None'}
            </span>
            <span className="rag-kpi-sub">
              {serviceDemand[0]?.percentage || 0}% of all service discussions
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rag-kpi-card">
          <div className="rag-kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            💼
          </div>
          <div className="rag-kpi-info">
            <span className="rag-kpi-label">Lead Conversion Rate</span>
            <span className="rag-kpi-val">{summary.conversion_rate || 0}%</span>
            <span className="rag-kpi-sub">
              {summary.total_leads || 0} qualified leads captured
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Analytics Layout ── */}
      <div className="rag-demand-main-grid">
        {/* ── Left Column: Service Demand & Conversion Funnel ── */}
        <div className="rag-demand-col">
          {/* Service Demand Breakdown */}
          <div className="rag-analytics-card">
            <div className="rag-analytics-card-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650 }}>
                  Service Demand &amp; Commercial Inquiries
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  Breakdown of services prospect visitors actively asked to build
                </span>
              </div>
              <span className="rag-order-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                {serviceDemand.reduce((acc, s) => acc + s.inquiry_count, 0)} Inquiries
              </span>
            </div>

            <div className="rag-demand-bars-list">
              {serviceDemand.map((svc, idx) => {
                const isTop = idx < 3 && svc.inquiry_count > 0;
                return (
                  <div key={svc.service_id || svc.slug} className="rag-demand-bar-row">
                    <div className="rag-demand-bar-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="rag-rank-badge" style={{ opacity: isTop ? 1 : 0.6 }}>
                          #{idx + 1}
                        </span>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text)' }}>
                          {svc.service_name}
                        </strong>
                        {svc.pricing_model && (
                          <span className="rag-pricing-chip">
                            {svc.pricing_model.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                          {svc.inquiry_count} {svc.inquiry_count === 1 ? 'chat' : 'chats'}
                        </span>
                        <span className="rag-percentage-badge">
                          {svc.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="rag-bar-track" style={{ height: '7px' }}>
                      <div
                        className="rag-bar-fill"
                        style={{
                          width: `${Math.max(4, svc.percentage)}%`,
                          background:
                            idx === 0
                              ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                              : idx === 1
                              ? 'linear-gradient(90deg, #10b981, #059669)'
                              : idx === 2
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                              : 'var(--surface-4, #94a3b8)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visitor Conversion Funnel */}
          <div className="rag-analytics-card" style={{ marginTop: '1.25rem' }}>
            <div className="rag-analytics-card-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650 }}>
                  Visitor Conversion Journey &amp; Funnel
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  Progression from general exploration to qualified lead capture
                </span>
              </div>
              <span className="rag-order-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                5 Stages
              </span>
            </div>

            <div className="rag-funnel-steps">
              {funnel.map((step, idx) => {
                const colors = [
                  { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#3b82f6' },
                  { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', border: '#6366f1' },
                  { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '#f59e0b' },
                  { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: '#8b5cf6' },
                  { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '#10b981' },
                ];
                const c = colors[idx % colors.length];

                return (
                  <div key={step.stage} className="rag-funnel-step-item">
                    <div className="rag-funnel-indicator">
                      <div
                        className="rag-funnel-node"
                        style={{ background: c.bg, color: c.text, borderColor: c.border }}
                      >
                        {idx + 1}
                      </div>
                      {idx < funnel.length - 1 && <div className="rag-funnel-connector" />}
                    </div>
                    <div className="rag-funnel-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text)' }}>
                            {step.label}
                          </strong>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
                            {step.description}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                            {step.count}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-3)', marginLeft: '4px' }}>
                            ({step.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="rag-bar-track" style={{ height: '5px', marginTop: '0.4rem' }}>
                        <div
                          className="rag-bar-fill"
                          style={{
                            width: `${Math.max(5, step.percentage)}%`,
                            background: c.border,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column: Intents, Polls & Knowledge Gaps ── */}
        <div className="rag-demand-col">
          {/* Buyer Intent Distribution */}
          <div className="rag-analytics-card">
            <div className="rag-analytics-card-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650 }}>
                  Buyer Intent Distribution
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  NLP-detected visitor goals and conversation drivers
                </span>
              </div>
              <span className="rag-order-badge" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
                {intents.reduce((acc, i) => acc + i.count, 0)} Categorized
              </span>
            </div>

            <div className="rag-intents-grid">
              {intents.map((item) => (
                <div key={item.intent} className="rag-intent-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="rag-intent-badge" data-category={item.category}>
                      {item.badge}
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
                      {item.count}
                    </strong>
                  </div>
                  <div style={{ marginTop: '0.375rem' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '1px' }}>
                      {item.percentage}% of all turns
                    </div>
                  </div>
                  <div className="rag-bar-track" style={{ height: '4px', marginTop: '0.5rem' }}>
                    <div
                      className="rag-bar-fill"
                      style={{
                        width: `${Math.max(4, item.percentage)}%`,
                        background:
                          item.category === 'commercial'
                            ? '#ea580c'
                            : item.category === 'conversion'
                            ? '#10b981'
                            : item.category === 'gap'
                            ? '#ef4444'
                            : '#6366f1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding Polls & Opening Prompt Engagement */}
          <div className="rag-analytics-card" style={{ marginTop: '1.25rem' }}>
            <div className="rag-analytics-card-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650 }}>
                  Opening Question &amp; Poll Engagement
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  Responses and clicks on proactive suggestion chips
                </span>
              </div>
              <span className="rag-order-badge">
                {openingPolls.length} Poll Questions
              </span>
            </div>

            <div className="rag-polls-container">
              {openingPolls.map((poll) => (
                <div key={poll.question_id} className="rag-poll-block">
                  <div className="rag-poll-title-row">
                    <span className="rag-poll-q-icon">💬</span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text)', flex: 1 }}>
                      {poll.question_text}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      {poll.total_responses} responses
                    </span>
                  </div>

                  <div className="rag-poll-options-list">
                    {(poll.options || []).map((opt) => (
                      <div key={opt.option_id} className="rag-poll-option-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                          <span style={{ color: 'var(--text-2)' }}>{opt.option}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {opt.count} ({opt.percentage}%)
                          </span>
                        </div>
                        <div className="rag-bar-track" style={{ height: '6px' }}>
                          <div
                            className="rag-bar-fill"
                            style={{
                              width: `${Math.max(2, opt.percentage)}%`,
                              background: 'var(--primary)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Gaps & Out-of-Scope Alerts */}
          {knowledgeGaps.length > 0 && (
            <div className="rag-analytics-card rag-gap-alert-card" style={{ marginTop: '1.25rem' }}>
              <div className="rag-analytics-card-header" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 650, color: '#b45309' }}>
                      Knowledge Gaps &amp; Out-of-Scope Requests
                    </h3>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>
                      Topics visitors asked about where Jerry had boundary limits or no documentation
                    </span>
                  </div>
                </div>
              </div>

              <div className="rag-gap-list">
                {knowledgeGaps.map((gap, i) => (
                  <div key={i} className="rag-gap-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="rag-gap-quote">
                        &ldquo;{gap.inquiry}&rdquo;
                      </span>
                      <span className="rag-gap-freq-badge">
                        Asked {gap.frequency}x
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                      💡 {gap.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyAnalyticsTab;
