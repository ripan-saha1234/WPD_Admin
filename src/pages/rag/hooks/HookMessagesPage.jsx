import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import HookMessageCard from './components/HookMessageCard';
import HookMessageDrawer from './components/HookMessageDrawer';
import {
  createHookMessage,
  deleteHookMessage,
  getHookMessages,
  updateHookMessage,
} from '../../../services/ragAdminService';
import './hookMessages.css';

function HookMessagesPage({ refreshKey, showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [displayFrequency, setDisplayFrequency] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive'

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getHookMessages();
      if (!response.ok) throw new Error(data.error || 'Failed to load hook messages');
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMessages();
  }, [refreshKey, loadMessages]);

  // ── Drawer Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreateDrawer = () => {
    setEditId('');
    setMessageText('');
    setDisplayFrequency(30);
    setIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (msg) => {
    setEditId(String(msg.id));
    setMessageText(msg.message_text || '');
    setDisplayFrequency(msg.display_frequency || 30);
    setIsActive(Boolean(msg.is_active));
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditId('');
    setMessageText('');
    setSaving(false);
  };

  const handleApplyPreset = (preset) => {
    setMessageText(preset);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!messageText.trim()) {
      showToast?.('Message copy cannot be empty.', 'error');
      return;
    }

    const payload = {
      message_text: messageText.trim(),
      display_frequency: Math.max(5, Number(displayFrequency) || 30),
      is_active: isActive,
    };

    setSaving(true);
    try {
      const { response, data } = editId
        ? await updateHookMessage(editId, payload)
        : await createHookMessage(payload);

      if (!response.ok) throw new Error(data.error || 'Failed to save hook message');
      showToast?.(
        editId ? 'Hook message updated successfully' : 'Hook nudge created successfully',
        'success'
      );
      handleCloseDrawer();
      loadMessages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response, data } = await deleteHookMessage(deleteTarget.id);
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      showToast?.('Hook message removed', 'success');
      setDeleteTarget(null);
      loadMessages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Inline Active Toggle ──────────────────────────────────────────────────────
  const handleToggleActive = async (msg) => {
    const nextState = !msg.is_active;
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_active: nextState } : m))
    );

    try {
      const { response, data } = await updateHookMessage(msg.id, { is_active: nextState });
      if (!response.ok) throw new Error(data.error || 'Update failed');
      showToast?.(
        nextState ? 'Nudge activated on live widget' : 'Nudge paused from live widget',
        'success'
      );
    } catch (err) {
      showToast?.(err.message, 'error');
      loadMessages(); // Revert on failure
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const activeCount = useMemo(() => messages.filter((m) => m.is_active).length, [messages]);
  const inactiveCount = messages.length - activeCount;
  const avgDelay = useMemo(() => {
    if (!messages.length) return 30;
    const sum = messages.reduce((acc, m) => acc + (m.display_frequency || 30), 0);
    return Math.round(sum / messages.length);
  }, [messages]);

  // ── Filtered List ─────────────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Tab filter
      if (filterTab === 'active' && !msg.is_active) return false;
      if (filterTab === 'inactive' && msg.is_active) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (msg.message_text || '').toLowerCase().includes(query);
      }
      return true;
    });
  }, [messages, filterTab, searchQuery]);

  return (
    <div className="hm-page-container">
      {/* ── Top Header Section ── */}
      <div className="hm-header-bar">
        <div className="hm-header-info">
          <h2>Hook Messages &amp; Proactive Nudges</h2>
          <p>
            Configure animated speech bubbles that appear next to Jerry's floating chat launcher orb
            after a configurable delay to engage visitors before they click.
          </p>
        </div>
        <div className="hm-header-actions">
          <CommonButton
            text="+ New Hook Message"
            onClick={handleOpenCreateDrawer}
            backgroundColor="var(--primary)"
            color="#ffffff"
            borderColor="var(--primary)"
          />
        </div>
      </div>

      {/* ── KPI Stat Cards Strip ── */}
      <div className="hm-kpi-grid">
        <div className="hm-kpi-card">
          <div className="hm-kpi-icon">💬</div>
          <div className="hm-kpi-info">
            <span className="hm-kpi-label">Total Hook Messages</span>
            <span className="hm-kpi-value">{messages.length}</span>
          </div>
        </div>

        <div className="hm-kpi-card">
          <div className="hm-kpi-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
            ✨
          </div>
          <div className="hm-kpi-info">
            <span className="hm-kpi-label">Active on Live Widget</span>
            <span className="hm-kpi-value">{activeCount}</span>
          </div>
        </div>

        <div className="hm-kpi-card">
          <div className="hm-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            ⏸️
          </div>
          <div className="hm-kpi-info">
            <span className="hm-kpi-label">Paused / Inactive</span>
            <span className="hm-kpi-value">{inactiveCount}</span>
          </div>
        </div>

        <div className="hm-kpi-card">
          <div className="hm-kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            ⏱️
          </div>
          <div className="hm-kpi-info">
            <span className="hm-kpi-label">Avg Display Delay</span>
            <span className="hm-kpi-value">{avgDelay}s</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar (Search & Filter Tabs) ── */}
      <div className="hm-toolbar-card">
        <div className="hm-filter-tabs">
          <button
            type="button"
            className={`hm-filter-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            className={`hm-filter-tab-btn ${filterTab === 'active' ? 'active' : ''}`}
            onClick={() => setFilterTab('active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`hm-filter-tab-btn ${filterTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterTab('inactive')}
          >
            Paused ({inactiveCount})
          </button>
        </div>

        <div className="hm-toolbar-right">
          <div className="hm-search-container">
            <span className="hm-search-icon">🔍</span>
            <input
              type="text"
              className="hm-search-field"
              placeholder="Search hook copy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="hm-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className="hm-refresh-action-btn"
            onClick={loadMessages}
            title="Reload hook messages"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Hook Cards List ── */}
      {loading ? (
        <div className="hm-loading-box">
          <CommonLoader text="Loading hook messages..." size={18} />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="hm-empty-box">
          <EmptyState
            icon={searchQuery ? '🔎' : '💬'}
            message={
              searchQuery
                ? `No hook messages match "${searchQuery}".`
                : filterTab !== 'all'
                ? `No ${filterTab} hook messages configured.`
                : 'No hook messages found. Create your first proactive nudge to greet visitors!'
            }
          />
          {searchQuery && (
            <button
              type="button"
              className="hm-reset-filter-btn"
              onClick={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="hm-cards-list">
          {filteredMessages.map((msg) => (
            <HookMessageCard
              key={msg.id}
              message={msg}
              onEdit={handleOpenEditDrawer}
              onDelete={(target) => setDeleteTarget(target)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* ── Slide-Over Drawer ── */}
      <HookMessageDrawer
        isOpen={isDrawerOpen}
        editId={editId}
        messageText={messageText}
        displayFrequency={displayFrequency}
        isActive={isActive}
        saving={saving}
        onClose={handleCloseDrawer}
        onTextChange={setMessageText}
        onFrequencyChange={setDisplayFrequency}
        onActiveChange={setIsActive}
        onApplyPreset={handleApplyPreset}
        onSave={handleSave}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Hook Message"
        message={`Delete "${deleteTarget?.message_text?.slice(0, 45)}..."? It will no longer pop up for visitors.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default HookMessagesPage;

