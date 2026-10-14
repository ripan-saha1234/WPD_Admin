import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import { globalContext } from '../../../context/context';
import { useLeads } from '../context/LeadsContext';
import AiAnalysisReportModal from './components/AiAnalysisReportModal';
import './leads.css';

function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(globalContext);
  const { getLeadById, fetchLeadWithMessages, runAiAnalysis } = useLeads();

  const cachedLead = getLeadById(leadId);
  const [lead, setLead] = useState(cachedLead || null);
  const [loading, setLoading] = useState(!cachedLead || !cachedLead.chats?.length);

  const [reportOpen, setReportOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportAnalysis, setReportAnalysis] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (leadId) {
      fetchLeadWithMessages(leadId).then((res) => {
        if (!mounted) return;
        if (res) {
          setLead(res);
        }
        setLoading(false);
      });
    }
    return () => {
      mounted = false;
    };
  }, [leadId, fetchLeadWithMessages]);

  if (loading && !lead) {
    return (
      <div className="leads-page leads-detail-page">
        <CommonLoader text="Loading lead conversation details..." />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="rag-section-missing">
        <p>Lead not found.</p>
        <button type="button" onClick={() => navigate('/rag/conversations')}>
          Back to leads
        </button>
      </div>
    );
  }

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const analysis = runAiAnalysis(lead.id);
      setReportAnalysis(analysis);
      setReportOpen(true);
      setAnalyzing(false);
      showToast?.('AI analysis complete', 'success');
    }, 800);
  };

  const messages = lead.chats || [];

  return (
    <div className="leads-page leads-detail-page">
      <div className="leads-detail-header">
        <div>
          <button
            type="button"
            className="leads-back-link"
            onClick={() => navigate('/rag/conversations')}
          >
            ← Back to leads
          </button>
          <h2>{lead.name}</h2>
          <p className="rag-muted">
            <code>{lead.id}</code> · {lead.email}
            {lead.company && lead.company !== '—' ? ` · ${lead.company}` : ''}
          </p>
          <div className="leads-detail-badges" style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
            <span className={`leads-crm-badge leads-crm-badge--${lead.crmSyncStatus}`}>
              CRM: {lead.crmSyncStatus}
            </span>
            {lead.interestedServiceName && lead.interestedServiceName !== '—' && (
              <span className="rag-origin-badge rag-origin-badge--folder">
                Service: {lead.interestedServiceName}
              </span>
            )}
            {lead.aiAnalysis && (
              <span className="leads-analyzed-pill">AI Analyzed</span>
            )}
          </div>
        </div>
        <div className="leads-detail-actions">
          <CommonButton
            text={analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            onClick={handleRunAnalysis}
            disabled={analyzing}
            backgroundColor="#0690fd"
            color="#fff"
            borderColor="#0690fd"
          />
        </div>
      </div>

      {/* Info Overview Cards */}
      <div className="leads-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="rag-card leads-info-card" style={{ padding: '20px 22px' }}>
          <h3 className="leads-info-title" style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 650 }}>Contact Information</h3>
          <div className="leads-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div><span style={{ color: 'var(--text-3)' }}>Full Name:</span> <strong>{lead.name}</strong></div>
            <div><span style={{ color: 'var(--text-3)' }}>Email:</span> <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary-text)' }}>{lead.email}</a></div>
            <div><span style={{ color: 'var(--text-3)' }}>Phone:</span> {lead.phone || '—'}</div>
            <div><span style={{ color: 'var(--text-3)' }}>Company:</span> <strong>{lead.company || '—'}</strong></div>
          </div>
        </div>

        <div className="rag-card leads-info-card" style={{ padding: '20px 22px' }}>
          <h3 className="leads-info-title" style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 650 }}>Project Requirements</h3>
          <div className="leads-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div><span style={{ color: 'var(--text-3)' }}>Interested Service:</span> <strong>{lead.interestedServiceName || 'Discovery'}</strong></div>
            <div>
              <span style={{ color: 'var(--text-3)' }}>Description:</span>
              <p style={{ margin: '4px 0 0', lineHeight: 1.5, color: 'var(--text)' }}>
                {lead.projectDescription || 'No detailed requirement provided.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rag-card leads-info-card" style={{ padding: '20px 22px' }}>
          <h3 className="leads-info-title" style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 650 }}>Session &amp; CRM Sync</h3>
          <div className="leads-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div><span style={{ color: 'var(--text-3)' }}>Session ID:</span> <code>{lead.sessionId}</code></div>
            <div>
              <span style={{ color: 'var(--text-3)' }}>CRM Sync Status:</span>{' '}
              <span className={`leads-crm-badge leads-crm-badge--${lead.crmSyncStatus}`}>
                {lead.crmSyncStatus}
              </span>
            </div>
            <div><span style={{ color: 'var(--text-3)' }}>Captured:</span> {new Date(lead.timestamp).toLocaleString()}</div>
            <div><span style={{ color: 'var(--text-3)' }}>Total Turns:</span> {messages.length} messages</div>
          </div>
        </div>
      </div>

      {/* Conversation History */}
      <div className="rag-card leads-conversation-card">
        <div className="rag-panel-header">
          <div className="rag-panel-title">
            <span>Conversation History</span>
            <span className="rag-badge-muted">{messages.length} messages</span>
          </div>
          <p className="rag-panel-hint">
            Full chronological conversation transcript from the AI chatbot session.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="leads-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>
            <p>No messages recorded for this session.</p>
          </div>
        ) : (
          <div className="leads-chat-timeline">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`leads-chat-item leads-chat-item--${msg.role}`}
              >
                <div className="leads-chat-meta">
                  <span className={`leads-channel-tag leads-channel-tag--chat`}>
                    {msg.role === 'user' ? 'Visitor' : 'Chatbot'}
                  </span>
                  <span>{msg.role === 'user' ? lead.name : 'Web Prism AI'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.detected_intent && (
                    <span style={{ fontSize: '11px', background: 'var(--surface-3)', padding: '1px 8px', borderRadius: 'var(--radius-full)', color: 'var(--text-2)' }}>
                      Intent: {msg.detected_intent}
                    </span>
                  )}
                </div>
                <div className="leads-chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
                {msg.rag_sources && msg.rag_sources.length > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px', paddingLeft: '8px' }}>
                    📚 <em>Sources: {msg.rag_sources.map((s) => s.section || s.id).slice(0, 2).join(', ')}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lead.aiAnalysis && !reportOpen && (
        <div className="rag-card leads-quick-report">
          <div className="rag-panel-title">
            <span>Latest AI Score</span>
            <button
              type="button"
              className="leads-link-btn"
              onClick={() => {
                setReportAnalysis(lead.aiAnalysis);
                setReportOpen(true);
              }}
            >
              View full report →
            </button>
          </div>
          <div className="leads-quick-scores">
            <div>
              <span className="leads-quick-score">{lead.aiAnalysis.leadScore}</span>
              <span className="rag-muted">Lead Score</span>
            </div>
            <div>
              <span className="leads-quick-score">{lead.aiAnalysis.icpFit}</span>
              <span className="rag-muted">ICP Fit</span>
            </div>
          </div>
        </div>
      )}

      <AiAnalysisReportModal
        open={reportOpen}
        lead={lead}
        analysis={reportAnalysis || lead.aiAnalysis}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}

export default LeadDetailPage;
