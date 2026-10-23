import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  createHookMessage,
  deleteHookMessage,
  getHookMessages,
  reorderHookMessages,
  updateHookMessage,
} from '../../../services/ragAdminService';

const DEFAULT_FORM = { message_text: '', is_active: true };

const INSPIRATION_PRESETS = [
  "👋 Need help finding the right solution? I'm here!",
  "💡 Looking for custom web, app, or AI development? Let's talk!",
  "🚀 Want an instant quote or service breakdown? Ask Jerry!",
  "✨ Have questions about pricing or tech stacks?",
];

function HookMessagesTab({ refreshKey, showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [editId, setEditId] = useState(null); // null = create
  const [form, setForm] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive'

  // Hovered or focused message for live preview simulation
  const [hoveredPreviewText, setHoveredPreviewText] = useState(null);

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

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setHoveredPreviewText(null);
  };

  const handleEdit = (msg) => {
    setEditId(msg.id);
    setForm({ message_text: msg.message_text, is_active: msg.is_active });
    // Scroll smoothly to creator form if on mobile/narrow view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyPreset = (presetText) => {
    setForm((f) => ({ ...f, message_text: presetText }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.message_text.trim()) {
      showToast?.('Message text is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { response, data } =
        editId !== null
          ? await updateHookMessage(editId, form)
          : await createHookMessage(form);
      if (!response.ok) throw new Error(data.error || 'Failed to save message');
      showToast?.(editId !== null ? 'Message updated' : 'Hook message created', 'success');
      resetForm();
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
      showToast?.('Message deleted', 'success');
      if (editId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      loadMessages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle active inline ──────────────────────────────────────────────────────
  const handleToggleActive = async (msg) => {
    const nextState = !msg.is_active;
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_active: nextState } : m))
    );
    try {
      const { response, data } = await updateHookMessage(msg.id, { is_active: nextState });
      if (!response.ok) throw new Error(data.error || 'Update failed');
      showToast?.(`Message marked as ${nextState ? 'Active' : 'Inactive'}`, 'success');
    } catch (err) {
      showToast?.(err.message, 'error');
      loadMessages(); // Revert on failure
    }
  };

  // ── Reorder: move up / down ───────────────────────────────────────────────────
  const handleMove = async (indexInFiltered, direction) => {
    // Locate true index in full messages array
    const targetMsg = filteredMessages[indexInFiltered];
    if (!targetMsg) return;

    const actualIdx = messages.findIndex((m) => m.id === targetMsg.id);
    const swapIdx = actualIdx + direction;
    if (swapIdx < 0 || swapIdx >= messages.length) return;

    const newList = [...messages];
    [newList[actualIdx], newList[swapIdx]] = [newList[swapIdx], newList[actualIdx]];
    setMessages(newList);
    setReordering(true);
    try {
      const { response, data } = await reorderHookMessages(newList.map((m) => m.id));
      if (!response.ok) throw new Error(data.error || 'Reorder failed');
    } catch (err) {
      showToast?.(err.message, 'error');
      loadMessages(); // revert
    } finally {
      setReordering(false);
    }
  };

  // ── Filtered List ─────────────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Filter by tab
      if (filterTab === 'active' && !msg.is_active) return false;
      if (filterTab === 'inactive' && msg.is_active) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return msg.message_text.toLowerCase().includes(query);
      }
      return true;
    });
  }, [messages, filterTab, searchQuery]);

  const activeCount = useMemo(() => messages.filter((m) => m.is_active).length, [messages]);
  const inactiveCount = messages.length - activeCount;

  // Active preview text: either hovered item in list, current form input, or first active message
  const previewText =
    hoveredPreviewText ||
    form.message_text.trim() ||
    messages.find((m) => m.is_active)?.message_text ||
    "Hi there! Welcome to Web Prism Dynamics. Let's build something great!";

  const charCount = form.message_text.length;

  return (
    <div className="rag-tab-content hm-tab-container">
      {/* ── Top Stats Strip ── */}
      <div className="rag-stats-grid rag-stats-grid--compact hm-stats-grid">
        <StatCard icon="💬" label="Total Hook Messages" value={messages.length} />
        <StatCard icon="✨" label="Active on Live Widget" value={activeCount} />
        <StatCard icon="⏸️" label="Disabled / Paused" value={inactiveCount} />
      </div>

      <div className="hm-two-column-layout">
        {/* ── LEFT COLUMN: Form + Live Widget Simulator ── */}
        <div className="hm-left-column">
          {/* Creator / Editor Card */}
          <div className="rag-card hm-editor-card">
            <div className="hm-card-header">
              <div className="hm-card-title-group">
                <span className="hm-card-badge">{editId !== null ? 'Editing Mode' : 'New Hook'}</span>
                <h3 className="hm-card-title">
                  {editId !== null ? 'Edit Hook Message' : 'Create Hook Nudge'}
                </h3>
              </div>
              {editId !== null && (
                <button
                  type="button"
                  className="hm-cancel-edit-btn"
                  onClick={resetForm}
                  title="Cancel editing"
                >
                  ✕ Discard
                </button>
              )}
            </div>

            <p className="hm-card-description">
              Hook messages pop up as animated speech bubbles next to the Jerry AI launcher to capture visitor interest.
            </p>

            {/* Inspiration presets */}
            <div className="hm-presets-section">
              <span className="hm-presets-label">⚡ Quick inspiration:</span>
              <div className="hm-presets-chips">
                {INSPIRATION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="hm-preset-chip"
                    onClick={() => applyPreset(preset)}
                    title="Click to use this text"
                  >
                    {preset.length > 34 ? `${preset.slice(0, 34)}…` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Field */}
            <div className="hm-input-group">
              <div className="hm-input-header">
                <label className="hm-input-label" htmlFor="hm-text">
                  Message Copy
                </label>
                <span
                  className={`hm-char-counter ${
                    charCount > 120 ? 'hm-char-counter--warn' : ''
                  }`}
                >
                  {charCount} / 140 chars
                </span>
              </div>
              <textarea
                id="hm-text"
                className="rag-textarea hm-custom-textarea"
                rows={3}
                maxLength={140}
                placeholder="e.g. Need help choosing the right tech stack? Ask me!"
                value={form.message_text}
                onChange={(e) => setForm((f) => ({ ...f, message_text: e.target.value }))}
              />
            </div>

            {/* Active Toggle Switch */}
            <div className="hm-switch-row">
              <label className="hm-switch-container" htmlFor="hm-active-toggle">
                <input
                  id="hm-active-toggle"
                  type="checkbox"
                  className="hm-switch-input"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <span className="hm-switch-slider" />
              </label>
              <div className="hm-switch-label-group">
                <span className="hm-switch-title">Active immediately</span>
                <span className="hm-switch-sub">
                  When enabled, visitors will see this in rotation on the live site.
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="hm-form-actions">
              <CommonButton
                text={saving ? 'Saving...' : editId !== null ? 'Save Changes' : 'Publish Hook'}
                onClick={handleSave}
                disabled={saving || !form.message_text.trim()}
                backgroundColor="var(--primary)"
                color="#ffffff"
                borderColor="var(--primary)"
              />
              {editId !== null && (
                <button type="button" className="hm-secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* ── Real-Time Chat Widget Simulator ── */}
          <div className="rag-card hm-simulator-card">
            <div className="hm-simulator-header">
              <div className="hm-simulator-badge">
                <span className="hm-pulse-dot" />
                Live Client Preview
              </div>
              <span className="hm-simulator-hint">How visitors see it</span>
            </div>

            <div className="hm-simulator-canvas">
              {/* Background website mockup lines */}
              <div className="hm-mockup-bg">
                <div className="hm-mockup-line" style={{ width: '60%' }} />
                <div className="hm-mockup-line" style={{ width: '85%' }} />
                <div className="hm-mockup-line" style={{ width: '45%' }} />
              </div>

              {/* Proactive Nudge Bubble */}
              <div className="hm-sim-nudge-wrapper">
                <div className="hm-sim-nudge-card">
                  <div className="hm-sim-nudge-body">
                    <div className="hm-sim-nudge-head">
                      <span className="hm-sim-orb">
                        <span className="hm-sim-orb-inner" />
                      </span>
                      <span className="hm-sim-nudge-name">Jerry</span>
                      <span className="hm-sim-nudge-tag">AI</span>
                      <span className="hm-sim-wave" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                    <div className="hm-sim-nudge-text">{previewText}</div>
                    <div className="hm-sim-nudge-cta">Chat with Jerry →</div>
                  </div>
                  <span className="hm-sim-nudge-close" title="Dismiss preview">
                    ✕
                  </span>
                </div>

                {/* Simulated Jerry Launcher Orb */}
                <div className="hm-sim-launcher">
                  <div className="hm-sim-launcher-glow" />
                  <div className="hm-sim-launcher-orb">
                    <span className="hm-sim-launcher-pulse" />
                    💬
                  </div>
                </div>
              </div>
            </div>
            <div className="hm-simulator-footer">
              Hover over any message card in the list or type above to test the preview.
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Filterable Message Management List ── */}
        <div className="hm-right-column">
          <div className="rag-card hm-list-card">
            {/* Header with Search and Filter Tabs */}
            <div className="hm-list-header">
              <div className="hm-list-title-row">
                <h3 className="hm-list-title">
                  All Hook Messages
                  <span className="hm-list-count">{filteredMessages.length}</span>
                </h3>
                <span className="hm-list-hint">Ordered by priority</span>
              </div>

              {/* Search & Filter Bar */}
              <div className="hm-controls-bar">
                {/* Search Input */}
                <div className="hm-search-box">
                  <span className="hm-search-icon">🔍</span>
                  <input
                    type="text"
                    className="hm-search-input"
                    placeholder="Search hook messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="hm-search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="hm-filter-pills">
                  <button
                    type="button"
                    className={`hm-filter-pill ${filterTab === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterTab('all')}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    type="button"
                    className={`hm-filter-pill ${filterTab === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterTab('active')}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    type="button"
                    className={`hm-filter-pill ${filterTab === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilterTab('inactive')}
                  >
                    Inactive ({inactiveCount})
                  </button>
                </div>
              </div>
            </div>

            {/* List Body */}
            {loading ? (
              <div className="hm-loading-state">
                <CommonLoader text="Loading hook messages..." size={18} />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="hm-empty-state">
                <EmptyState
                  icon={searchQuery ? '🔎' : '💬'}
                  message={
                    searchQuery
                      ? `No hook messages match "${searchQuery}".`
                      : filterTab !== 'all'
                      ? `No ${filterTab} hook messages found.`
                      : 'No hook messages yet. Create your first teaser above to engage visitors proactively!'
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
              <div className="hm-items-container">
                {filteredMessages.map((msg, index) => {
                  const isCurrentEditing = editId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`hm-item-card ${isCurrentEditing ? 'hm-item-card--editing' : ''} ${
                        !msg.is_active ? 'hm-item-card--inactive' : ''
                      }`}
                      onMouseEnter={() => setHoveredPreviewText(msg.message_text)}
                      onMouseLeave={() => setHoveredPreviewText(null)}
                    >
                      {/* Left: Reorder Arrows & Priority Number */}
                      <div className="hm-item-reorder-col">
                        <button
                          type="button"
                          className="hm-reorder-btn"
                          title="Move Up"
                          disabled={index === 0 || reordering || filterTab !== 'all'}
                          onClick={() => handleMove(index, -1)}
                        >
                          ▲
                        </button>
                        <span className="hm-item-rank">#{index + 1}</span>
                        <button
                          type="button"
                          className="hm-reorder-btn"
                          title="Move Down"
                          disabled={
                            index === filteredMessages.length - 1 || reordering || filterTab !== 'all'
                          }
                          onClick={() => handleMove(index, 1)}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Middle: Content */}
                      <div className="hm-item-content">
                        <div className="hm-item-meta-row">
                          <span
                            className={`hm-status-tag ${
                              msg.is_active ? 'hm-status-tag--active' : 'hm-status-tag--inactive'
                            }`}
                          >
                            <span className="hm-status-dot" />
                            {msg.is_active ? 'Active' : 'Disabled'}
                          </span>
                          <span className="hm-item-date">
                            Created {new Date(msg.created_at).toLocaleDateString()} at{' '}
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Speech Bubble representation */}
                        <div className="hm-item-speech-bubble">
                          <span className="hm-speech-avatar">✨</span>
                          <p className="hm-speech-text">{msg.message_text}</p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="hm-item-actions-col">
                        {/* Quick inline status switch */}
                        <button
                          type="button"
                          className={`hm-toggle-btn ${
                            msg.is_active ? 'hm-toggle-btn--active' : 'hm-toggle-btn--inactive'
                          }`}
                          onClick={() => handleToggleActive(msg)}
                          title={msg.is_active ? 'Click to disable hook' : 'Click to enable hook'}
                        >
                          {msg.is_active ? 'Enabled' : 'Paused'}
                        </button>

                        <div className="hm-action-icon-group">
                          <button
                            type="button"
                            className="hm-action-btn hm-action-btn--edit"
                            title="Edit message"
                            onClick={() => handleEdit(msg)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="hm-action-btn hm-action-btn--delete"
                            title="Delete message"
                            onClick={() => setDeleteTarget(msg)}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="hm-list-footer">
              <span className="hm-footer-hint">
                💡 <strong>Tip:</strong> Visitors are shown an active hook at random or prioritized order on their visit. You can reorder active nudges when viewing the "All" tab.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Hook Message"
        message={`Delete "${deleteTarget?.message_text?.slice(0, 40)}..."? This will remove it from the chat widget.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default HookMessagesTab;

