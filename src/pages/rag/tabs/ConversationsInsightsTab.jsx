import { useCallback, useEffect, useRef, useState } from 'react';
import CommonInput from '../../../components/common-input';
import CommonSelect from '../../../components/common-select';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import PaginationBar from '../components/PaginationBar';
import LeadBadge from '../components/LeadBadge';
import SentimentBadge from '../components/SentimentBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import SessionInsightsCard from '../components/SessionInsightsCard';
import ViewSwitcher from '../components/ViewSwitcher';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  MAIN_VIEW_OPTIONS,
  DETAIL_TAB_OPTIONS,
  SESSION_FILTER_OPTIONS,
  LEAD_FILTER_OPTIONS,
  SENTIMENT_FILTER_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../conversationsConstants';
import {
  analyzeRagSession,
  buildSessionQueryParams,
  deleteRagSession,
  escapeHtml,
  formatSessionId,
  getRagInsightsOverview,
  getRagSession,
  getRagSessions,
  getRagStats,
} from '../../../services/ragAdminService';

function ConversationsInsightsTab({
  selectedSessionId,
  onSelectSession,
  refreshKey,
  showToast,
}) {
  const [viewMode, setViewMode] = useState('explorer');
  const [detailTab, setDetailTab] = useState('insights');
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState({});
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [leadType, setLeadType] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [pageSize, setPageSize] = useState('25');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const autoSelectedRef = useRef(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const tablePageSize = '25';

  const loadOverviewData = useCallback(async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        getRagStats(),
        getRagInsightsOverview(),
      ]);
      if (statsRes.response.ok) setStats(statsRes.data);
      if (insightsRes.response.ok) setOverview(insightsRes.data.overview || {});
    } catch {
      showToast?.('Failed to load overview data', 'error');
    }
  }, [showToast]);

  const loadSessions = useCallback(
    async (pageNum = 1, limit = pageSize) => {
      setLoadingSessions(true);
      try {
        const params = buildSessionQueryParams({
          page: pageNum,
          limit,
          search: debouncedSearch,
          filter,
          leadType,
          sentiment,
        });
        const { response, data } = await getRagSessions(params);
        if (!response.ok) throw new Error(data.error || 'Failed to load sessions');

        const rows = data.data || [];
        setSessions(rows);
        setPagination(data.pagination || {});
        setPage(pageNum);

        if (
          viewMode === 'explorer' &&
          !autoSelectedRef.current &&
          rows.length > 0 &&
          !selectedSessionId
        ) {
          autoSelectedRef.current = true;
          onSelectSession(rows[0].id);
        }
      } catch (err) {
        showToast?.(err.message, 'error');
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    },
    [pageSize, debouncedSearch, filter, leadType, sentiment, selectedSessionId, onSelectSession, showToast, viewMode]
  );

  const loadTranscript = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        setSessionDetail(null);
        return;
      }
      setLoadingTranscript(true);
      try {
        const { response, data } = await getRagSession(sessionId);
        if (!response.ok) throw new Error(data.error || 'Failed to load session');
        setSessionDetail(data);
      } catch (err) {
        showToast?.(err.message, 'error');
        setSessionDetail(null);
      } finally {
        setLoadingTranscript(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadOverviewData();
  }, [refreshKey, loadOverviewData]);

  useEffect(() => {
    setPage(1);
    loadSessions(1, viewMode === 'intelligence' ? tablePageSize : pageSize);
  }, [refreshKey, debouncedSearch, filter, leadType, sentiment, pageSize, viewMode, loadSessions]);

  useEffect(() => {
    if (viewMode === 'explorer') loadTranscript(selectedSessionId);
  }, [selectedSessionId, loadTranscript, refreshKey, viewMode]);

  const handleAnalyze = async (sessionId) => {
    setAnalyzing(true);
    try {
      const { response, data } = await analyzeRagSession(sessionId);
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      showToast?.('Analysis complete', 'success');
      loadTranscript(sessionId);
      loadSessions(page, viewMode === 'intelligence' ? tablePageSize : pageSize);
      loadOverviewData();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSessionId) return;
    setDeleting(true);
    try {
      const { response } = await deleteRagSession(selectedSessionId);
      if (!response.ok) throw new Error('Failed to delete session');
      showToast?.('Session deleted', 'success');
      onSelectSession(null);
      setSessionDetail(null);
      setDeleteDialogOpen(false);
      loadOverviewData();
      loadSessions(page, viewMode === 'intelligence' ? tablePageSize : pageSize);
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openSessionFromTable = (sessionId) => {
    onSelectSession(sessionId);
    setDetailTab('insights');
    setViewMode('explorer');
  };

  const handlePageChange = (nextPage) => {
    loadSessions(nextPage, viewMode === 'intelligence' ? tablePageSize : pageSize);
  };

  const { total = 0, totalPages = 1, hasNextPage, hasPrevPage } = pagination;
  const surveyAnswers = sessionDetail?.surveyAnswers || [];
  const messages = sessionDetail?.messages || [];

  const renderDetailContent = () => {
    if (loadingTranscript) return <CommonLoader text="Loading session..." size={16} />;
    if (!selectedSessionId) {
      return (
        <EmptyState
          icon="👈"
          message="Select a session from the list to view AI insights, conversation, and onboarding answers."
        />
      );
    }
    if (detailTab === 'insights') {
      return (
        <SessionInsightsCard
          insights={sessionDetail?.insights}
          sessionId={selectedSessionId}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
        />
      );
    }
    if (detailTab === 'profile') {
      if (!surveyAnswers.length) {
        return <EmptyState icon="📋" message="No onboarding survey responses for this session." />;
      }
      return (
        <div className="rag-profile-grid">
          {surveyAnswers.map((ans) => (
            <div key={`${ans.question_text}-${ans.selected_option}`} className="rag-profile-card">
              <span className="rag-profile-question">{ans.question_text}</span>
              <span className="rag-profile-answer">
                {ans.selected_option || ans.selected_options || '—'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    if (!messages.length) return <EmptyState icon="💬" message="No conversation messages yet." />;
    return messages.map((msg) => (
      <div key={msg.id || `${msg.created_at}-${msg.role}`} className={`rag-msg-row rag-msg-row--${msg.role}`}>
        <div className="rag-msg-header">
          <span>{msg.role === 'user' ? 'User' : 'Chatbot'}</span>
          <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
        </div>
        <div className="rag-msg-content" dangerouslySetInnerHTML={{ __html: escapeHtml(msg.content) }} />
        {msg.metadata && Object.keys(msg.metadata).length > 0 && (
          <details className="rag-metadata-drawer">
            <summary>RAG context &amp; metadata</summary>
            <pre>{JSON.stringify(msg.metadata, null, 2)}</pre>
          </details>
        )}
      </div>
    ));
  };

  return (
    <div className="rag-tab-content rag-conversations-module">
      <section className="rag-conv-intro">
        <h2>Conversations &amp; AI Insights</h2>
        <p>
          Monitor chatbot sessions, read transcripts, and review AI lead scoring in one place.
          Use <strong>Session Explorer</strong> to browse chats, or <strong>Lead Intelligence</strong> for a scored overview.
        </p>
      </section>

      <section className="rag-kpi-section">
        <div className="rag-kpi-group">
          <h3 className="rag-kpi-group-title">Chat Activity</h3>
          <div className="rag-stats-grid rag-stats-grid--compact">
            <StatCard icon="👥" label="Total Sessions" value={stats?.total_sessions} />
            <StatCard icon="💬" label="Messages" value={stats?.total_messages} />
            <StatCard icon="❓" label="User Queries" value={stats?.total_user_queries} />
            <StatCard icon="⚡" label="Active (24h)" value={stats?.active_last_24h} />
            <StatCard icon="📋" label="Surveys Done" value={stats?.completed_onboardings} />
          </div>
        </div>
        <div className="rag-kpi-group">
          <h3 className="rag-kpi-group-title">AI Intelligence</h3>
          <div className="rag-stats-grid rag-stats-grid--compact">
            <StatCard icon="🧠" label="Analyzed" value={overview.analyzed_sessions} />
            <StatCard icon="📈" label="Avg Lead Score" value={overview.avg_lead_score} />
            <StatCard icon="🎯" label="Avg ICP Fit" value={overview.avg_icp_score} />
            <StatCard icon="🔥" label="Hot Leads" value={overview.hot_leads} />
            <StatCard icon="🌡️" label="Warm Leads" value={overview.warm_leads} />
          </div>
        </div>
      </section>

      <ViewSwitcher options={MAIN_VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />

      {viewMode === 'explorer' ? (
        <div className="rag-dashboard-layout">
          <div className="rag-panel rag-sessions-panel">
            <div className="rag-panel-header">
              <div className="rag-panel-title">
                <span>Sessions</span>
                <span className="rag-badge-muted">{total} total</span>
              </div>
              <p className="rag-panel-hint">Click a session to view details on the right.</p>
              <CommonInput name="sessionSearch" placeholder="Search by session ID or message..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="rag-filter-row">
                <CommonSelect name="sessionFilter" options={SESSION_FILTER_OPTIONS} value={filter} onChange={(e) => setFilter(e.target.value)} />
                <CommonSelect name="leadFilter" options={LEAD_FILTER_OPTIONS} value={leadType} onChange={(e) => setLeadType(e.target.value)} />
                <CommonSelect name="sentimentFilter" options={SENTIMENT_FILTER_OPTIONS} value={sentiment} onChange={(e) => setSentiment(e.target.value)} />
                <CommonSelect name="pageSize" options={PAGE_SIZE_OPTIONS} value={pageSize} onChange={(e) => setPageSize(e.target.value)} />
              </div>
            </div>
            <div className="rag-sessions-list">
              {loadingSessions ? <CommonLoader text="Loading sessions..." size={16} /> : sessions.length === 0 ? (
                <EmptyState message="No sessions match your filters." />
              ) : sessions.map((session) => (
                <button key={session.id} type="button" className={`rag-session-item ${selectedSessionId === session.id ? 'active' : ''}`} onClick={() => onSelectSession(session.id)}>
                  <div className="rag-session-item-top">
                    <span className="rag-session-id">{formatSessionId(session.id)}</span>
                    <span className="rag-session-badges">
                      {session.lead_type ? <LeadBadge type={session.lead_type} /> : session.message_count > 0 ? <LeadBadge type="pending" /> : null}
                      <span className="rag-count-badge">{session.message_count} msgs</span>
                    </span>
                  </div>
                  <div className="rag-session-snippet" title={session.last_message}>
                    {session.last_message ? `${session.last_message_role === 'user' ? 'User: ' : 'Bot: '}${session.last_message}` : 'No messages yet'}
                  </div>
                  <div className="rag-session-time">
                    {new Date(session.last_active_at).toLocaleString()}
                    {session.survey_answers_count ? ` · ${session.survey_answers_count} survey answers` : ''}
                  </div>
                </button>
              ))}
            </div>
            <PaginationBar page={page} totalPages={totalPages} hasPrevPage={hasPrevPage} hasNextPage={hasNextPage} onPrev={() => handlePageChange(page - 1)} onNext={() => handlePageChange(page + 1)} label={`Page ${page} of ${totalPages || 1}`} />
          </div>

          <div className="rag-panel rag-transcript-panel">
            <div className="rag-transcript-header">
              <div>
                <h2>{selectedSessionId ? `Session ${formatSessionId(selectedSessionId)}` : 'Session Detail'}</h2>
                {sessionDetail?.session && (
                  <p className="rag-muted">
                    Created {new Date(sessionDetail.session.created_at).toLocaleString()} · {messages.length} messages
                    {surveyAnswers.length ? ` · ${surveyAnswers.length} survey answers` : ''}
                  </p>
                )}
              </div>
              {selectedSessionId && (
                <CommonButton text="Delete" onClick={() => setDeleteDialogOpen(true)} backgroundColor="#fff" color="#ef4444" borderColor="#fecaca" />
              )}
            </div>
            {selectedSessionId && (
              <div className="rag-detail-tabs">
                {DETAIL_TAB_OPTIONS.map((tab) => (
                  <button key={tab.id} type="button" className={`rag-detail-tab ${detailTab === tab.id ? 'active' : ''}`} onClick={() => setDetailTab(tab.id)}>
                    {tab.label}
                    {tab.id === 'chat' && messages.length > 0 && <span className="rag-detail-tab-count">{messages.length}</span>}
                    {tab.id === 'profile' && surveyAnswers.length > 0 && <span className="rag-detail-tab-count">{surveyAnswers.length}</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="rag-transcript-messages">{renderDetailContent()}</div>
          </div>
        </div>
      ) : (
        <div className="rag-card rag-intelligence-panel">
          <div className="rag-panel-header">
            <div className="rag-panel-title">
              <span>Lead Intelligence Report</span>
              <span className="rag-badge-muted">{total} sessions</span>
            </div>
            <p className="rag-panel-hint">Click a row to open that session in the explorer.</p>
            <div className="rag-filter-row">
              <CommonSelect name="intelFilter" options={SESSION_FILTER_OPTIONS} value={filter} onChange={(e) => setFilter(e.target.value)} />
              <CommonSelect name="intelLeadFilter" options={LEAD_FILTER_OPTIONS} value={leadType} onChange={(e) => setLeadType(e.target.value)} />
              <CommonSelect name="intelSentimentFilter" options={SENTIMENT_FILTER_OPTIONS} value={sentiment} onChange={(e) => setSentiment(e.target.value)} />
              <CommonInput name="intelSearch" placeholder="Search session or message..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {loadingSessions ? <CommonLoader text="Loading report..." size={16} /> : sessions.length === 0 ? (
            <EmptyState message="No sessions match your filters." />
          ) : (
            <div className="rag-table-wrap">
              <table className="rag-table rag-table--clickable">
                <thead>
                  <tr>
                    <th>Session</th><th>Lead Score</th><th>ICP Fit</th><th>Sentiment</th>
                    <th>Lead Type</th><th>Intent</th><th>Verdict</th><th>Analyzed</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((row) => {
                    const analyzed = row.analyzed_at;
                    return (
                      <tr key={row.id} onClick={() => openSessionFromTable(row.id)} className={`rag-table-row-clickable ${selectedSessionId === row.id ? 'selected' : ''}`}>
                        <td><code>{formatSessionId(row.id)}</code></td>
                        <td>{analyzed ? `${row.lead_score ?? 0}/100` : '—'}</td>
                        <td>{analyzed ? `${row.icp_fit_score ?? 0}/100` : '—'}</td>
                        <td>{analyzed ? <SentimentBadge sentiment={row.sentiment} /> : <LeadBadge type="pending" />}</td>
                        <td>{analyzed ? <LeadBadge type={row.lead_type} /> : '—'}</td>
                        <td>{row.intent || (analyzed ? '' : 'Not analyzed')}</td>
                        <td className="rag-table-verdict">{row.ideal_customer_verdict || '—'}</td>
                        <td>{analyzed ? new Date(row.analyzed_at).toLocaleString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <PaginationBar page={page} totalPages={totalPages} hasPrevPage={hasPrevPage} hasNextPage={hasNextPage} onPrev={() => handlePageChange(page - 1)} onNext={() => handlePageChange(page + 1)} label={`Page ${page} of ${totalPages || 1}`} />
        </div>
      )}

      <ConfirmDialog open={deleteDialogOpen} title="Delete Session" message={`Delete session ${selectedSessionId}?`} confirmText="Delete" onConfirm={handleDelete} onCancel={() => setDeleteDialogOpen(false)} loading={deleting} />
    </div>
  );
}

export default ConversationsInsightsTab;
