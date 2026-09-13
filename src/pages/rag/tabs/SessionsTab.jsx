import { useCallback, useEffect, useRef, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationBar from '../components/PaginationBar';
import LeadBadge from '../components/LeadBadge';
import SentimentBadge from '../components/SentimentBadge';
import SessionInsightsCard from '../components/SessionInsightsCard';
import {
  getRagStats,
  getRagSessions,
  getRagSession,
  deleteRagSession,
  analyzeRagSession,
  buildSessionQueryParams,
  formatSessionId,
} from '../../../services/ragAdminService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

function truncate(str, n = 80) {
  if (!str) return '—';
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

// ── Session Row ────────────────────────────────────────────────────────────────

function SessionRow({ session, isSelected, onClick }) {
  return (
    <div
      className={`sess-row${isSelected ? ' sess-row--selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="sess-row-top">
        <span className="sess-id-badge" title={session.id}>
          {formatSessionId(session.id)}
        </span>
        <div className="sess-row-badges">
          {session.lead_type && <LeadBadge type={session.lead_type} />}
          {session.sentiment && <SentimentBadge sentiment={session.sentiment} />}
        </div>
        <span className="sess-time">{relativeTime(session.last_active_at)}</span>
      </div>
      <p className="sess-last-msg">{truncate(session.last_message)}</p>
      <div className="sess-row-meta">
        <span>{session.message_count ?? 0} messages</span>
        {session.survey_answers_count > 0 && (
          <span>· {session.survey_answers_count} survey answers</span>
        )}
        {session.lead_score != null && (
          <span>· Lead: {session.lead_score}/100</span>
        )}
      </div>
    </div>
  );
}

// ── Chat Bubble ────────────────────────────────────────────────────────────────

function ChatBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`sess-bubble-wrap${isUser ? ' sess-bubble-wrap--user' : ''}`}>
      <div className={`sess-bubble${isUser ? ' sess-bubble--user' : ' sess-bubble--bot'}`}>
        {content}
      </div>
    </div>
  );
}

// ── Detail Drawer ──────────────────────────────────────────────────────────────

function SessionDrawer({ sessionId, onClose, showToast }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'survey' | 'insights'
  const transcriptRef = useRef(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagSession(sessionId);
      if (!response.ok) throw new Error(data.error || 'Failed to load session');
      setDetail(data);
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Scroll transcript to bottom when loaded
  useEffect(() => {
    if (!loading && transcriptRef.current && activeTab === 'chat') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [loading, activeTab]);

  const handleAnalyze = async (sid) => {
    setAnalyzing(true);
    try {
      const { response, data } = await analyzeRagSession(sid);
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      showToast?.('AI analysis complete', 'success');
      // Refresh detail to show new insights
      loadDetail();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="sess-drawer">
      <div className="sess-drawer-header">
        <div>
          <div className="sess-drawer-title">Session Detail</div>
          {detail?.session && (
            <div className="sess-drawer-sub" title={detail.session.id}>
              {detail.session.id}
            </div>
          )}
        </div>
        <button type="button" className="sess-drawer-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>
          <CommonLoader text="Loading session…" size={16} />
        </div>
      ) : !detail ? null : (
        <>
          {/* Meta strip */}
          <div className="sess-drawer-meta">
            <span>Created: {fmtDate(detail.session.created_at)}</span>
            <span>Last active: {fmtDate(detail.session.last_active_at)}</span>
            <span>{(detail.messages || []).length} messages</span>
          </div>

          {/* Tabs */}
          <div className="sess-drawer-tabs">
            {['chat', 'survey', 'insights'].map((t) => (
              <button
                key={t}
                type="button"
                className={`sess-drawer-tab${activeTab === t ? ' sess-drawer-tab--active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'chat' && '💬 Transcript'}
                {t === 'survey' && '📋 Survey'}
                {t === 'insights' && '🧠 AI Insights'}
              </button>
            ))}
          </div>

          {/* Tab: Chat Transcript */}
          {activeTab === 'chat' && (
            <div className="sess-drawer-body sess-transcript" ref={transcriptRef}>
              {(detail.messages || []).length === 0 ? (
                <EmptyState icon="💬" message="No messages in this session." />
              ) : (
                (detail.messages || []).map((msg) => (
                  <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
                ))
              )}
            </div>
          )}

          {/* Tab: Survey Answers */}
          {activeTab === 'survey' && (
            <div className="sess-drawer-body">
              {(detail.surveyAnswers || []).length === 0 ? (
                <EmptyState icon="📋" message="No survey answers recorded for this session." />
              ) : (
                <div className="sess-survey-list">
                  {(detail.surveyAnswers || []).map((ans, i) => (
                    <div key={i} className="sess-survey-item">
                      <div className="sess-survey-q">{ans.question_text}</div>
                      <div className="sess-survey-a">{ans.selected_option}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: AI Insights */}
          {activeTab === 'insights' && (
            <div className="sess-drawer-body">
              <SessionInsightsCard
                insights={detail.insights}
                sessionId={sessionId}
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Tab ───────────────────────────────────────────────────────────────────

function SessionsTab({ refreshKey, showToast }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false, total: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [leadType, setLeadType] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildSessionQueryParams({ page, limit: 20, search, filter, leadType, sentiment });
      const [statsRes, sessionsRes] = await Promise.all([
        getRagStats(),
        getRagSessions(params),
      ]);
      if (statsRes.response.ok) setStats(statsRes.data);
      if (sessionsRes.response.ok) {
        setSessions(sessionsRes.data.data || []);
        setPagination(sessionsRes.data.pagination || {});
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, leadType, sentiment, showToast]);

  useEffect(() => {
    loadAll();
  }, [refreshKey, loadAll]);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response, data } = await deleteRagSession(deleteTarget.id);
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      showToast?.('Session deleted', 'success');
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Debounce search
  const searchTimerRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleFilterChange = (key, val) => {
    if (key === 'filter') setFilter(val);
    if (key === 'leadType') setLeadType(val);
    if (key === 'sentiment') setSentiment(val);
    setPage(1);
  };

  return (
    <div className="rag-tab-content">
      {/* ── Stats ── */}
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="👥" label="Total Sessions" value={stats?.total_sessions ?? '—'} />
        <StatCard icon="🕐" label="Active (24h)" value={stats?.active_last_24h ?? '—'} />
        <StatCard icon="💬" label="Total Messages" value={stats?.total_messages ?? '—'} />
        <StatCard icon="📋" label="Completed Onboardings" value={stats?.completed_onboardings ?? '—'} />
      </div>

      {/* ── Main 2-panel layout ── */}
      <div className="sess-layout">
        {/* Left: List panel */}
        <div className="sess-list-panel rag-card">
          {/* Toolbar */}
          <div className="sess-toolbar">
            <input
              className="rag-input"
              type="search"
              placeholder="Search session ID or message…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <select
              className="rag-select"
              value={filter}
              onChange={(e) => handleFilterChange('filter', e.target.value)}
            >
              <option value="all">All Sessions</option>
              <option value="with_messages">With Messages</option>
              <option value="with_survey">With Survey</option>
              <option value="analyzed">AI Analyzed</option>
              <option value="pending_analysis">Pending Analysis</option>
            </select>
            <select
              className="rag-select"
              value={leadType}
              onChange={(e) => handleFilterChange('leadType', e.target.value)}
            >
              <option value="">All Lead Types</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <select
              className="rag-select"
              value={sentiment}
              onChange={(e) => handleFilterChange('sentiment', e.target.value)}
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div className="sess-list-header">
            <span className="rag-panel-title">Sessions</span>
            <span className="rag-badge-muted">{pagination.total ?? 0} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem' }}>
              <CommonLoader text="Loading sessions…" size={16} />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState icon="👥" message="No sessions found. Sessions are created when visitors chat on the website." />
          ) : (
            <>
              <div className="sess-list">
                {sessions.map((s) => (
                  <div key={s.id} className="sess-row-wrap">
                    <SessionRow
                      session={s}
                      isSelected={selectedId === s.id}
                      onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                    />
                    <button
                      type="button"
                      className="sess-delete-btn"
                      title="Delete session"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <PaginationBar
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                />
              </div>
            </>
          )}
        </div>

        {/* Right: Drawer */}
        {selectedId ? (
          <SessionDrawer
            key={selectedId}
            sessionId={selectedId}
            onClose={() => setSelectedId(null)}
            showToast={showToast}
          />
        ) : (
          <div className="sess-empty-drawer rag-card">
            <div className="sess-empty-drawer-icon">💬</div>
            <p className="rag-muted">Select a session to view its transcript and AI insights</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Session"
        message="Delete this session and all its messages? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default SessionsTab;
