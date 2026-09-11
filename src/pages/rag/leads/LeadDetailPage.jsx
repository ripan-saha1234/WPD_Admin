import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommonButton from '../../../components/common-button';
import { globalContext } from '../../../context/context';
import { useLeads } from '../context/LeadsContext';
import { BDM_OPTIONS, LEAD_STATUS_OPTIONS } from '../mock/leadsMockData';
import AssignLeadModal from './components/AssignLeadModal';
import AiAnalysisReportModal from './components/AiAnalysisReportModal';
import LeadBadge from '../components/LeadBadge';
import './leads.css';

const CHANNEL_LABELS = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  chat: 'Web Chat',
};

function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(globalContext);
  const { getLeadById, assignLead, runAiAnalysis } = useLeads();
  const lead = getLeadById(leadId);

  const [assignOpen, setAssignOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportAnalysis, setReportAnalysis] = useState(null);

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

  const bdmName = BDM_OPTIONS.find((b) => b.id === lead.assignedTo)?.name;
  const statusLabel =
    LEAD_STATUS_OPTIONS.find((s) => s.value === lead.status)?.label || lead.status;

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

  const handleAssign = (id, bdmId) => {
    assignLead(id, bdmId);
    showToast?.('Lead assigned successfully', 'success');
  };

  const totalMessages =
    lead.channels.sms + lead.channels.whatsapp + lead.channels.chat;

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
            <code>{lead.id}</code> · {lead.email} · {statusLabel}
            {bdmName ? ` · Assigned to ${bdmName}` : ''}
          </p>
          <div className="leads-detail-badges">
            <LeadBadge type={lead.leadType} />
            {lead.aiAnalysis && (
              <span className="leads-analyzed-pill">AI Analyzed</span>
            )}
          </div>
        </div>
        <div className="leads-detail-actions">
          <CommonButton
            text={lead.assignedTo ? 'Reassign' : 'Assign to BDM'}
            onClick={() => setAssignOpen(true)}
            backgroundColor="#fff"
            color="#0d0d0d"
            borderColor="#e8e8e8"
          />
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

      <div className="leads-channel-cards">
        <div className="leads-channel-card">
          <span className="leads-channel-icon">📱</span>
          <span className="leads-channel-count">{lead.channels.sms}</span>
          <span className="leads-channel-label">SMS</span>
        </div>
        <div className="leads-channel-card">
          <span className="leads-channel-icon">💬</span>
          <span className="leads-channel-count">{lead.channels.whatsapp}</span>
          <span className="leads-channel-label">WhatsApp</span>
        </div>
        <div className="leads-channel-card">
          <span className="leads-channel-icon">🌐</span>
          <span className="leads-channel-count">{lead.channels.chat}</span>
          <span className="leads-channel-label">Web Chat</span>
        </div>
        <div className="leads-channel-card leads-channel-card--total">
          <span className="leads-channel-icon">📊</span>
          <span className="leads-channel-count">{totalMessages}</span>
          <span className="leads-channel-label">Total Messages</span>
        </div>
      </div>

      <div className="rag-card leads-conversation-card">
        <div className="rag-panel-header">
          <div className="rag-panel-title">
            <span>Conversation History</span>
            <span className="rag-badge-muted">{lead.chats.length} messages</span>
          </div>
          <p className="rag-panel-hint">
            All messages from SMS, WhatsApp, and web chat combined in chronological order.
          </p>
        </div>

        <div className="leads-chat-timeline">
          {lead.chats.map((msg) => (
            <div
              key={msg.id}
              className={`leads-chat-item leads-chat-item--${msg.role}`}
            >
              <div className="leads-chat-meta">
                <span className={`leads-channel-tag leads-channel-tag--${msg.channel}`}>
                  {CHANNEL_LABELS[msg.channel] || msg.channel}
                </span>
                <span>{msg.role === 'user' ? lead.name : 'Chatbot'}</span>
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="leads-chat-bubble">{msg.content}</div>
            </div>
          ))}
        </div>
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
            <LeadBadge type={lead.aiAnalysis.leadType} />
          </div>
        </div>
      )}

      <AssignLeadModal
        open={assignOpen}
        lead={lead}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

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
