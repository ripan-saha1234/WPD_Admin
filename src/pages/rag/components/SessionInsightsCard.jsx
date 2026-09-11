import CommonButton from '../../../components/common-button';
import LeadBadge from './LeadBadge';
import SentimentBadge from './SentimentBadge';
import { parseJsonArray } from '../../../services/ragAdminService';

function SessionInsightsCard({ insights, sessionId, onAnalyze, analyzing }) {
  if (!insights) {
    return (
      <div className="rag-insights-card rag-insights-card--empty">
        <div className="rag-insights-card-icon">🧠</div>
        <div>
          <h3>No AI analysis yet</h3>
          <p className="rag-muted">
            Analysis runs automatically after chat activity. You can also trigger it manually.
          </p>
          <CommonButton
            text={analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            onClick={() => onAnalyze(sessionId)}
            disabled={analyzing}
            backgroundColor="#0690fd"
            color="#fff"
            borderColor="#0690fd"
          />
        </div>
      </div>
    );
  }

  const topics = parseJsonArray(insights.topics);
  const profileSignals = parseJsonArray(insights.profile_signals);
  const chatSignals = parseJsonArray(insights.chat_signals);

  return (
    <div className="rag-insights-card">
      <div className="rag-insights-card-header">
        <div>
          <h3>AI Lead Intelligence</h3>
          <p className="rag-muted rag-small">Sentiment, ICP fit, and recommended next steps</p>
        </div>
        <CommonButton
          text={analyzing ? 'Analyzing...' : 'Re-analyze'}
          onClick={() => onAnalyze(sessionId)}
          disabled={analyzing}
          backgroundColor="#fff"
          color="#0d0d0d"
          borderColor="#e8e8e8"
        />
      </div>
      <div className="rag-insights-metrics">
        <div className="rag-metric-box">
          <div className="label">Lead Score</div>
          <div className="num">{insights.lead_score}/100</div>
        </div>
        <div className="rag-metric-box">
          <div className="label">ICP Fit</div>
          <div className="num">{insights.icp_fit_score}/100</div>
        </div>
        <div className="rag-metric-box">
          <div className="label">Sentiment</div>
          <div className="num"><SentimentBadge sentiment={insights.sentiment} /></div>
        </div>
        <div className="rag-metric-box">
          <div className="label">Lead Type</div>
          <div className="num"><LeadBadge type={insights.lead_type} /></div>
        </div>
      </div>
      {insights.ideal_customer_verdict && (
        <div className="rag-insight-block">
          <span className="rag-insight-block-label">Verdict</span>
          <p>{insights.ideal_customer_verdict}</p>
        </div>
      )}
      {insights.summary && (
        <div className="rag-insight-block">
          <span className="rag-insight-block-label">Summary</span>
          <p className="rag-muted">{insights.summary}</p>
        </div>
      )}
      {insights.icp_reasoning && (
        <div className="rag-insight-block rag-insight-block--accent">
          <span className="rag-insight-block-label">ICP Reasoning</span>
          <p>{insights.icp_reasoning}</p>
        </div>
      )}
      {insights.recommended_action && (
        <div className="rag-insight-block rag-insight-block--success">
          <span className="rag-insight-block-label">Recommended Action</span>
          <p>{insights.recommended_action}</p>
        </div>
      )}
      {topics.length > 0 && (
        <div className="rag-insight-block">
          <span className="rag-insight-block-label">Topics</span>
          <div className="rag-pill-list">
            {topics.map((topic) => <span key={topic} className="rag-pill">{topic}</span>)}
          </div>
        </div>
      )}
      {profileSignals.length > 0 && (
        <div className="rag-signal-list">
          <span className="rag-insight-block-label">Profile Signals</span>
          {profileSignals.map((s) => <div key={s} className="rag-signal-item">{s}</div>)}
        </div>
      )}
      {chatSignals.length > 0 && (
        <div className="rag-signal-list">
          <span className="rag-insight-block-label">Chat Signals</span>
          {chatSignals.map((s) => <div key={s} className="rag-signal-item">{s}</div>)}
        </div>
      )}
      {insights.analyzed_at && (
        <p className="rag-muted rag-small">
          Last analyzed: {new Date(insights.analyzed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default SessionInsightsCard;
