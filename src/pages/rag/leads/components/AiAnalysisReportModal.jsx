import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CommonButton from '../../../../components/common-button';
import LeadBadge from '../../components/LeadBadge';
import SentimentBadge from '../../components/SentimentBadge';

function AiAnalysisReportModal({ open, lead, analysis, onClose }) {
  if (!analysis) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>AI Lead Score Report — {lead?.name}</DialogTitle>
      <DialogContent>
        <div className="ai-report-modal">
          <div className="ai-report-scores">
            <div className="ai-report-score-ring">
              <span className="ai-report-score-num">{analysis.leadScore}</span>
              <span className="ai-report-score-label">Lead Score</span>
            </div>
            <div className="ai-report-score-ring ai-report-score-ring--secondary">
              <span className="ai-report-score-num">{analysis.icpFit}</span>
              <span className="ai-report-score-label">ICP Fit</span>
            </div>
            <div className="ai-report-badges">
              <div>
                <span className="rag-insight-block-label">Sentiment</span>
                <SentimentBadge sentiment={analysis.sentiment} />
              </div>
              <div>
                <span className="rag-insight-block-label">Lead Type</span>
                <LeadBadge type={analysis.leadType} />
              </div>
            </div>
          </div>

          <div className="rag-insight-block">
            <span className="rag-insight-block-label">Verdict</span>
            <p>{analysis.verdict}</p>
          </div>
          <div className="rag-insight-block">
            <span className="rag-insight-block-label">Summary</span>
            <p className="rag-muted">{analysis.summary}</p>
          </div>
          <div className="rag-insight-block rag-insight-block--accent">
            <span className="rag-insight-block-label">ICP Reasoning</span>
            <p>{analysis.icpReasoning}</p>
          </div>
          <div className="rag-insight-block rag-insight-block--success">
            <span className="rag-insight-block-label">Recommended Action</span>
            <p>{analysis.recommendedAction}</p>
          </div>

          {analysis.topics?.length > 0 && (
            <div className="rag-insight-block">
              <span className="rag-insight-block-label">Topics</span>
              <div className="rag-pill-list">
                {analysis.topics.map((t) => (
                  <span key={t} className="rag-pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          <p className="rag-muted rag-small">
            Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
          </p>
        </div>
      </DialogContent>
      <DialogActions className="rag-confirm-actions">
        <CommonButton
          text="Close"
          onClick={onClose}
          backgroundColor="#0690fd"
          color="#fff"
          borderColor="#0690fd"
        />
      </DialogActions>
    </Dialog>
  );
}

export default AiAnalysisReportModal;
