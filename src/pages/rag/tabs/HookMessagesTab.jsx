import { useCallback, useEffect, useState } from 'react';
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

function HookMessagesTab({ refreshKey, showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [editId, setEditId] = useState(null); // null = create
  const [form, setForm] = useState(DEFAULT_FORM);

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

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleEdit = (msg) => {
    setEditId(msg.id);
    setForm({ message_text: msg.message_text, is_active: msg.is_active });
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
      showToast?.(editId !== null ? 'Message updated' : 'Message added', 'success');
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
    try {
      const { response, data } = await updateHookMessage(msg.id, { is_active: !msg.is_active });
      if (!response.ok) throw new Error(data.error || 'Update failed');
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_active: !m.is_active } : m))
      );
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  // ── Reorder: move up / down ───────────────────────────────────────────────────
  const handleMove = async (index, direction) => {
    const newList = [...messages];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[index], newList[swapIdx]] = [newList[swapIdx], newList[index]];
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

  const activeCount = messages.filter((m) => m.is_active).length;

  return (
    <div className="rag-tab-content">
      {/* ── Stats ── */}
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="💬" label="Total Messages" value={messages.length} />
        <StatCard icon="✅" label="Active" value={activeCount} />
        <StatCard icon="🔇" label="Inactive" value={messages.length - activeCount} />
      </div>

      <div className="rag-manager-layout">
        {/* ── Add / Edit Form ── */}
        <div className="rag-card rag-form-card">
          <div className="rag-panel-title">
            <span>{editId !== null ? 'Edit Message' : 'Add Hook Message'}</span>
          </div>

          <div className="rag-panel-hint">
            Hook messages appear as proactive speech-bubble popups next to the chat widget launcher, to engage visitors before they start a conversation.
          </div>

          <div className="rag-field-group">
            <label className="rag-field-label" htmlFor="hm-text">Message Text</label>
            <textarea
              id="hm-text"
              className="rag-textarea"
              rows={4}
              placeholder="e.g. 👋 Hi! Need help choosing a plan? I'm here!"
              value={form.message_text}
              onChange={(e) => setForm((f) => ({ ...f, message_text: e.target.value }))}
            />
          </div>

          <div className="rag-toggle-row">
            <input
              id="hm-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            <label htmlFor="hm-active" className="rag-field-label" style={{ margin: 0 }}>
              Active (visible to widget visitors)
            </label>
          </div>

          <div className="rag-form-actions">
            <CommonButton
              text={saving ? 'Saving...' : editId !== null ? 'Update Message' : 'Add Message'}
              onClick={handleSave}
              disabled={saving}
              backgroundColor="#0690fd"
              color="#fff"
              borderColor="#0690fd"
            />
            {editId !== null && (
              <CommonButton
                text="Cancel"
                onClick={resetForm}
                backgroundColor="#fff"
                color="#0d0d0d"
                borderColor="#e8e8e8"
              />
            )}
          </div>

          <div className="rag-form-divider" />

          <p className="rag-panel-hint">
            💡 <strong>Tip:</strong> Messages are shown to visitors in sort order. Use the ↑ ↓ arrows in the list to reorder them.
          </p>
        </div>

        {/* ── Messages List ── */}
        <div className="rag-card rag-list-card">
          <div className="rag-panel-header">
            <div className="rag-panel-title">
              <span>All Hook Messages</span>
              <span className="rag-badge-muted">{messages.length} total</span>
            </div>
          </div>

          {loading ? (
            <CommonLoader text="Loading messages..." size={16} />
          ) : messages.length === 0 ? (
            <EmptyState
              icon="💬"
              message="No hook messages yet. Add one to engage visitors proactively."
            />
          ) : (
            <div className="rag-questions-list" style={{ padding: '1rem 1.25rem' }}>
              {messages.map((msg, index) => (
                <div key={msg.id} className="rag-question-card">
                  <div className="rag-question-card-header">
                    <div className="rag-question-meta">
                      <span className="rag-order-badge">#{index + 1}</span>
                      <span className={msg.is_active ? 'rag-status-active' : 'rag-status-inactive'}>
                        {msg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="rag-question-actions">
                      <button
                        type="button"
                        className="rag-icon-btn"
                        title="Move Up"
                        disabled={index === 0 || reordering}
                        onClick={() => handleMove(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rag-icon-btn"
                        title="Move Down"
                        disabled={index === messages.length - 1 || reordering}
                        onClick={() => handleMove(index, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rag-icon-btn"
                        title={msg.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleActive(msg)}
                      >
                        {msg.is_active ? '🔇' : '🔔'}
                      </button>
                      <button
                        type="button"
                        className="rag-icon-btn"
                        title="Edit"
                        onClick={() => handleEdit(msg)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="rag-icon-btn rag-icon-btn--danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(msg)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Message bubble preview */}
                  <div className="hm-bubble-preview">
                    <span className="hm-bubble-text">{msg.message_text}</span>
                  </div>

                  <div className="rag-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Created {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Hook Message"
        message={`Delete this hook message? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default HookMessagesTab;
