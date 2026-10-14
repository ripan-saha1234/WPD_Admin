import { useCallback, useEffect, useRef, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationBar from '../components/PaginationBar';
import {
  getRagStats,
  getRagSessions,
  getRagSession,
  deleteRagSession,
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

const STAGE_LABELS = {
  EXPLORER: 'Explorer',
  INTERESTED: 'Interested',
  REQUIREMENT_DISCOVERY: 'Discovery',
  QUALIFIED: 'Qualified',
  CONTACT_COLLECTED: 'Contact Collected',
};

const STAGE_COLORS = {
  EXPLORER: { bg: 'var(--info-soft)', text: 'var(--info-text)' },
  INTERESTED: { bg: 'var(--primary-soft-2)', text: 'var(--primary-text)' },
  REQUIREMENT_DISCOVERY: { bg: 'var(--warning-soft)', text: 'var(--warning-text)' },
  QUALIFIED: { bg: 'color-mix(in srgb, var(--warning) 24%, transparent)', text: 'var(--warning-text)' },
  CONTACT_COLLECTED: { bg: 'var(--success-soft)', text: 'var(--success-text)' },
};

function StageBadge({ stage }) {
  const norm = (stage || 'EXPLORER').toUpperCase();
  const label = STAGE_LABELS[norm] || norm;
  const colors = STAGE_COLORS[norm] || { bg: 'var(--neutral-soft)', text: 'var(--neutral-text)' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: colors.bg,
        color: colors.text,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const isAct = status === 'active';
  const isEnd = status === 'ended';
  const bg = isAct ? 'var(--success-soft)' : isEnd ? 'var(--neutral-soft)' : 'var(--warning-soft)';
  const text = isAct ? 'var(--success-text)' : isEnd ? 'var(--neutral-text)' : 'var(--warning-text)';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: bg,
        color: text,
        textTransform: 'capitalize',
      }}
    >
      {status || 'active'}
    </span>
  );
}

// ── Session Row (Left Panel Item) ──────────────────────────────────────────────

function SessionRow({ session, isSelected, onClick }) {
  return (
    <div
      className={`sess-row${isSelected ? ' sess-row--selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--divider)',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
        borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'background-color var(--transition), border-color var(--transition)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--primary-text)' }}>
          {formatSessionId(session.id)}
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <StatusPill status={session.status} />
          <StageBadge stage={session.visitor_stage} />
        </div>
      </div>

      {session.lead_name && (
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
          👤 {session.lead_name} {session.lead_company ? `(${session.lead_company})` : ''}
        </div>
      )}

      {session.discussed_services && session.discussed_services.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
          {session.discussed_services.map((svc) => (
            <span
              key={svc}
              style={{
                fontSize: '11px',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-2)',
              }}
            >
              {svc}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>
        <span>💬 {session.message_count ?? 0} messages</span>
        <span>{relativeTime(session.last_active_at || session.created_at)}</span>
      </div>
    </div>
  );
}

// ── Transcript Bubble ─────────────────────────────────────────────────────────

function TranscriptTurn({ message, visitorName = 'Visitor' }) {
  const isUser = message.role === 'user' || message.role === 'visitor';
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1rem',
      }}
    >
      {/* Turn Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--text-3)',
          marginBottom: '4px',
          padding: '0 4px',
        }}
      >
        <span style={{ fontWeight: 600, color: isUser ? 'var(--primary-text)' : 'var(--text)' }}>
          {isUser ? `👤 ${visitorName}` : '🤖 Web Prism AI'}
        </span>
        <span>·</span>
        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

        {message.detected_intent && (
          <span
            style={{
              background: 'var(--neutral-soft)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--neutral-text)',
            }}
          >
            Intent: {message.detected_intent}
          </span>
        )}

        {message.discussed_service_name && (
          <span
            style={{
              background: 'var(--info-soft)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--info-text)',
            }}
          >
            {message.discussed_service_name}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '82%',
          padding: '0.75rem 1rem',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          backgroundColor: isUser ? 'var(--primary)' : 'var(--surface-2)',
          color: isUser ? 'var(--primary-contrast)' : 'var(--text)',
          border: isUser ? 'none' : '1px solid var(--border)',
          fontSize: '13px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {message.content}
      </div>

      {/* RAG Sources Accordion for Bot Messages */}
      {!isUser && message.rag_sources && message.rag_sources.length > 0 && (
        <div style={{ maxWidth: '82%', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 4px',
              fontSize: '11px',
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            📚 <span>{sourcesOpen ? 'Hide' : 'View'} RAG Sources ({message.rag_sources.length})</span>
            <span>{sourcesOpen ? '▲' : '▼'}</span>
          </button>

          {sourcesOpen && (
            <div
              style={{
                marginTop: '4px',
                padding: '8px 12px',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: 'var(--text-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {message.rag_sources.map((src, i) => (
                <div key={i} style={{ borderBottom: i < message.rag_sources.length - 1 ? '1px solid var(--divider)' : 'none', paddingBottom: '4px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {src.section || src.id || 'Document chunk'}
                  </div>
                  {src.rerank_score != null && (
                    <div style={{ color: 'var(--text-3)', fontSize: '10px' }}>
                      Re-rank relevance score: {Number(src.rerank_score).toFixed(3)}
                    </div>
                  )}
                  {src.text && (
                    <div style={{ color: 'var(--text-2)', fontStyle: 'italic', marginTop: '2px' }}>
                      "{src.text.slice(0, 140)}..."
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Session Detail Drawer (Right Panel) ─────────────────────────────────────────

function SessionDrawer({ sessionId, onClose, onEndSession, showToast }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'metadata'
  const transcriptRef = useRef(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagSession(sessionId);
      if (!response.ok) throw new Error(data?.error || 'Failed to load session transcript');
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

  useEffect(() => {
    if (!loading && transcriptRef.current && activeTab === 'transcript') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [loading, activeTab]);

  if (loading) {
    return (
      <div className="sess-drawer rag-card" style={{ flex: 1, padding: '3rem', justifyContent: 'center' }}>
        <CommonLoader text="Loading session transcript..." />
      </div>
    );
  }

  if (!detail || !detail.session) {
    return (
      <div className="sess-drawer rag-card" style={{ flex: 1, padding: '3rem', textAlign: 'center' }}>
        <p>Session not found.</p>
        <CommonButton text="Close" onClick={onClose} backgroundColor="#fff" color="#0690fd" borderColor="#0690fd" />
      </div>
    );
  }

  const s = detail.session;
  const messages = detail.messages || [];
  const lead = detail.lead || s.lead;
  const visitorName = lead?.name || 'Visitor';

  return (
    <div className="sess-drawer rag-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 260px)' }}>
      {/* Drawer Header */}
      <div className="sess-drawer-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--divider)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
              {s.id}
            </span>
            <StatusPill status={s.status} />
            <StageBadge stage={s.visitor_stage} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            Started: {fmtDate(s.created_at)}
            {s.ended_at && ` · Ended: ${fmtDate(s.ended_at)}`}
            {` · ${messages.length} total messages`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {s.status === 'active' && onEndSession && (
            <CommonButton
              text="End Session"
              onClick={() => onEndSession(s.id)}
              backgroundColor="#fee2e2"
              color="#b91c1c"
              borderColor="#fca5a5"
            />
          )}
          <button
            type="button"
            className="sess-drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Captured Lead Banner if exists */}
      {lead && (
        <div
          style={{
            margin: '0.75rem 1.25rem 0',
            padding: '0.75rem 1rem',
            background: 'var(--success-soft)',
            border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <strong>👤 Lead Captured:</strong> {lead.name} {lead.company ? `(${lead.company})` : ''} ·{' '}
            <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary-text)' }}>{lead.email}</a>
            {lead.phone && ` · ${lead.phone}`}
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              background: 'color-mix(in srgb, var(--success) 20%, transparent)',
              color: 'var(--success-text)',
            }}
          >
            CRM: {lead.crm_sync_status || 'synced'}
          </span>
        </div>
      )}

      {/* Initial Onboarding Poll Response */}
      {(s.initial_question_text || s.initial_response) && (
        <div
          style={{
            margin: '0.75rem 1.25rem 0',
            padding: '0.75rem 1rem',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-2)',
          }}
        >
          <div style={{ color: 'var(--text-3)', marginBottom: '2px' }}>
            📋 <strong>Greeting Poll Prompt:</strong> {s.initial_question_text || 'Initial Opening Question'}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--info-text)' }}>
            👉 Visitor Selected: "{s.initial_response}"
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="sess-drawer-tabs" style={{ padding: '0 1.25rem', marginTop: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <button
          type="button"
          className={`sess-drawer-tab${activeTab === 'transcript' ? ' sess-drawer-tab--active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          💬 Message Transcript ({messages.length})
        </button>
        <button
          type="button"
          className={`sess-drawer-tab${activeTab === 'metadata' ? ' sess-drawer-tab--active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          ⚙️ Session Metadata
        </button>
      </div>

      {/* Drawer Content */}
      <div
        className="sess-drawer-body"
        ref={transcriptRef}
        style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}
      >
        {activeTab === 'transcript' ? (
          messages.length === 0 ? (
            <EmptyState icon="💬" message="No messages exchanged in this session yet." />
          ) : (
            messages.map((msg) => (
              <TranscriptTurn key={msg.id} message={msg} visitorName={visitorName} />
            ))
          )
        ) : (
          /* Metadata Tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '13px' }}>
            <div className="rag-card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '13px', fontWeight: 700 }}>Funnel Details</h4>
              <div><strong>Visitor Stage:</strong> {s.visitor_stage}</div>
              <div><strong>Lead Status:</strong> {s.lead_status}</div>
              <div><strong>Discussed Services:</strong> {s.discussed_services?.join(', ') || 'None recorded'}</div>
            </div>

            <div className="rag-card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '13px', fontWeight: 700 }}>Consent &amp; Analytics</h4>
              <div><strong>Consent Flags:</strong> {JSON.stringify(s.consent_flags || {})}</div>
              <div style={{ marginTop: '6px' }}>
                <strong>Analytics Metadata:</strong>
                <pre style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px', borderRadius: 'var(--radius-xs)', fontSize: '11px', overflowX: 'auto', marginTop: '4px' }}>
                  {JSON.stringify(s.analytics_metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Sessions Tab ──────────────────────────────────────────────────────────

function SessionsTab({ refreshKey, showToast }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const limit = 20;

  // Selected session for right panel
  const [selectedId, setSelectedId] = useState(null);
  const [endTarget, setEndTarget] = useState(null);
  const [ending, setEnding] = useState(false);

  // ── Load Sessions & Stats ──────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildSessionQueryParams({
        page,
        limit,
        search,
        stage: stageFilter,
        status: statusFilter,
        lead_status: leadStatusFilter,
      });

      const [statsRes, sessionsRes] = await Promise.all([
        getRagStats(),
        getRagSessions(params),
      ]);

      if (statsRes.response.ok && statsRes.data) {
        setStats(statsRes.data);
      }

      if (sessionsRes.response.ok && sessionsRes.data) {
        const items = sessionsRes.data.sessions || [];
        setSessions(items);
        setTotalSessions(sessionsRes.data.total ?? items.length);

        // Auto-select first session if none is selected
        if (!selectedId && items.length > 0) {
          setSelectedId(items[0].id);
        }
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, statusFilter, leadStatusFilter, selectedId, showToast]);

  useEffect(() => {
    loadAll();
  }, [refreshKey, loadAll]);

  // Handle End Session
  const handleEndSession = async () => {
    if (!endTarget) return;
    setEnding(true);
    try {
      const { response, data } = await deleteRagSession(endTarget);
      if (!response.ok) throw new Error(data?.error || 'Failed to end session');
      showToast?.('Session ended', 'success');
      setEndTarget(null);
      loadAll();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setEnding(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalSessions / limit));

  return (
    <div className="rag-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ── Stat Cards ── */}
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="👥" label="Total Sessions" value={stats?.totalSessions ?? totalSessions} />
        <StatCard icon="🟢" label="Active Sessions" value={stats?.activeSessions ?? '—'} />
        <StatCard icon="🎯" label="Qualified Visitors" value={stats?.qualifiedSessions ?? '—'} />
        <StatCard icon="📋" label="Leads Captured" value={stats?.totalLeads ?? '—'} />
        <StatCard icon="💬" label="Avg Messages" value={stats?.avgMessages ?? '—'} />
      </div>

      {/* ── Main 2-Panel Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '1.25rem', minHeight: '620px' }}>
        {/* Left Panel: Sessions List & Filters */}
        <div className="rag-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              className="rag-filter-select"
              placeholder="Search by ID or service…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '6px 12px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <select
                className="rag-filter-select"
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setPage(1);
                }}
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="all">All Stages</option>
                <option value="EXPLORER">Explorer</option>
                <option value="INTERESTED">Interested</option>
                <option value="REQUIREMENT_DISCOVERY">Discovery</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONTACT_COLLECTED">Contact Collected</option>
              </select>

              <select
                className="rag-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          </div>

          {/* List Header */}
          <div style={{ padding: '0.625rem 1rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Visitor Sessions</span>
            <span className="rag-badge-muted">{totalSessions} total</span>
          </div>

          {/* List of Sessions */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
            {loading ? (
              <div style={{ padding: '2.5rem' }}>
                <CommonLoader text="Loading sessions…" />
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>
                <p>No visitor sessions found.</p>
              </div>
            ) : (
              sessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isSelected={selectedId === s.id}
                  onClick={() => setSelectedId(s.id)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div style={{ padding: '0.625rem 1rem', borderTop: '1px solid var(--divider)' }}>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              hasNextPage={page < totalPages}
              hasPrevPage={page > 1}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        </div>

        {/* Right Panel: Full Message Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedId ? (
            <SessionDrawer
              key={selectedId}
              sessionId={selectedId}
              onClose={() => setSelectedId(null)}
              onEndSession={(sid) => setEndTarget(sid)}
              showToast={showToast}
            />
          ) : (
            <div className="sess-empty-drawer rag-card" style={{ flex: 1, minHeight: '520px' }}>
              <div className="sess-empty-drawer-icon">💬</div>
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text)' }}>No Session Selected</h3>
              <p className="rag-muted" style={{ margin: 0, maxWidth: '320px', textAlign: 'center' }}>
                Select a visitor session from the left to view the complete conversation transcript, RAG sources, and visitor stage progression.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm End Session Dialog */}
      <ConfirmDialog
        open={Boolean(endTarget)}
        title="End Session"
        message="Are you sure you want to end this active session? The visitor will have to restart if they return."
        confirmText="End Session"
        onConfirm={handleEndSession}
        onCancel={() => setEndTarget(null)}
        loading={ending}
      />
    </div>
  );
}

export default SessionsTab;
