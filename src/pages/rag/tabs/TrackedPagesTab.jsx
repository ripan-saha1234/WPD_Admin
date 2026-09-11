import { useCallback, useEffect, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  createTrackedPage,
  deleteTrackedPage,
  getTrackedPages,
  refreshAllTrackedPages,
  testFetchTrackedPage,
  updateTrackedPage,
} from '../../../services/ragAdminService';

const PAGE_TYPES = ['auto', 'static', 'react'];

const DEFAULT_FORM = { label: '', url: '', page_type: 'auto', is_active: true };

function StatusPill({ status }) {
  if (!status) return <span className="rag-muted">—</span>;
  const isOk = status === 'ok';
  return (
    <span
      className={`rag-origin-badge ${isOk ? 'rag-origin-badge--folder' : 'rag-origin-badge--upload'}`}
    >
      {isOk ? '✓ OK' : '✗ Error'}
    </span>
  );
}

function TrackedPagesTab({ refreshKey, showToast }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editId, setEditId] = useState(null); // null = create mode
  const [form, setForm] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [previewPage, setPreviewPage] = useState(null); // { id, label, text }
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getTrackedPages();
      if (!response.ok) throw new Error(data.error || 'Failed to load pages');
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPages();
  }, [refreshKey, loadPages]);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleEdit = (page) => {
    setEditId(page.id);
    setForm({
      label: page.label,
      url: page.url,
      page_type: page.page_type,
      is_active: page.is_active,
    });
  };

  // ── Save (create / update) ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      showToast?.('Label and URL are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { response, data } =
        editId !== null
          ? await updateTrackedPage(editId, form)
          : await createTrackedPage(form);
      if (!response.ok) throw new Error(data.error || 'Failed to save page');
      showToast?.(editId !== null ? 'Page updated' : 'Page added', 'success');
      resetForm();
      loadPages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response, data } = await deleteTrackedPage(deleteTarget.id);
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      showToast?.('Page removed', 'success');
      setDeleteTarget(null);
      loadPages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Refresh all ──────────────────────────────────────────────────────────────
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const { response, data } = await refreshAllTrackedPages();
      if (!response.ok) throw new Error(data.error || 'Refresh failed');
      showToast?.('All pages re-crawled successfully', 'success');
      loadPages();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // ── Test fetch ───────────────────────────────────────────────────────────────
  const handleTestFetch = async (page) => {
    setPreviewLoading(true);
    setPreviewPage({ id: page.id, label: page.label, text: null });
    try {
      const { response, data } = await testFetchTrackedPage(page.id);
      if (!response.ok) throw new Error(data.error || 'Test fetch failed');
      setPreviewPage({ id: page.id, label: page.label, text: data.extracted_text });
    } catch (err) {
      showToast?.(err.message, 'error');
      setPreviewPage(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const activeCount = pages.filter((p) => p.is_active).length;
  const okCount = pages.filter((p) => p.last_fetch_status === 'ok').length;

  return (
    <div className="rag-tab-content">
      {/* ── Stats ── */}
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="🌐" label="Total Pages" value={pages.length} />
        <StatCard icon="✅" label="Active" value={activeCount} />
        <StatCard icon="🔄" label="Last Crawl OK" value={okCount} />
      </div>

      <div className="rag-manager-layout">
        {/* ── Add / Edit Form ── */}
        <div className="rag-card rag-form-card">
          <div className="rag-panel-title">
            <span>{editId !== null ? 'Edit Page' : 'Add Tracked Page'}</span>
          </div>

          <div className="rag-field-group">
            <label className="rag-field-label" htmlFor="tp-label">Label</label>
            <input
              id="tp-label"
              className="rag-input"
              placeholder="e.g. Pricing Page"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>

          <div className="rag-field-group">
            <label className="rag-field-label" htmlFor="tp-url">URL</label>
            <input
              id="tp-url"
              className="rag-input"
              placeholder="https://example.com/pricing"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </div>

          <div className="rag-field-group">
            <label className="rag-field-label" htmlFor="tp-type">Page Type</label>
            <select
              id="tp-type"
              className="rag-select"
              value={form.page_type}
              onChange={(e) => setForm((f) => ({ ...f, page_type: e.target.value }))}
            >
              {PAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'auto' ? ' (Recommended)' : t === 'react' ? ' (SPA / JS rendered)' : ' (Plain HTML)'}
                </option>
              ))}
            </select>
          </div>

          <div className="rag-toggle-row">
            <input
              id="tp-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            <label htmlFor="tp-active" className="rag-field-label" style={{ margin: 0 }}>
              Active (include in crawl & agent context)
            </label>
          </div>

          <div className="rag-form-actions">
            <CommonButton
              text={saving ? 'Saving...' : editId !== null ? 'Update Page' : 'Add Page'}
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

          <div className="rag-panel-hint">
            Refresh all active pages to update cached content used by the AI.
          </div>
          <CommonButton
            text={refreshing ? 'Refreshing...' : '🔄 Refresh All Pages'}
            onClick={handleRefreshAll}
            disabled={refreshing}
            backgroundColor="#fff"
            color="#0690fd"
            borderColor="#0690fd"
          />
        </div>

        {/* ── Pages Table ── */}
        <div className="rag-card rag-table-card">
          <div className="rag-panel-header">
            <div className="rag-panel-title">
              <span>Tracked Pages</span>
              <span className="rag-badge-muted">{pages.length} total</span>
            </div>
          </div>

          {loading ? (
            <CommonLoader text="Loading pages..." size={16} />
          ) : pages.length === 0 ? (
            <EmptyState icon="🌐" message="No pages tracked yet. Add a URL above to get started." />
          ) : (
            <div className="rag-table-wrap">
              <table className="rag-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>URL</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Active</th>
                    <th>Last Cached</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td style={{ fontWeight: 600 }}>{page.label}</td>
                      <td>
                        <a
                          className="rag-accent-text"
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={page.url}
                          style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}
                        >
                          {page.url}
                        </a>
                      </td>
                      <td>
                        <span className="rag-order-badge">{page.page_type}</span>
                      </td>
                      <td><StatusPill status={page.last_fetch_status} /></td>
                      <td>
                        <span className={page.is_active ? 'rag-status-active' : 'rag-status-inactive'}>
                          {page.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="rag-muted" style={{ fontSize: '0.78rem' }}>
                        {page.cache_updated_at
                          ? new Date(page.cache_updated_at).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        <div className="rag-question-actions">
                          <button
                            type="button"
                            className="rag-icon-btn"
                            title="Test Fetch"
                            onClick={() => handleTestFetch(page)}
                          >
                            🔍
                          </button>
                          <button
                            type="button"
                            className="rag-icon-btn"
                            title="Edit"
                            onClick={() => handleEdit(page)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="rag-icon-btn rag-icon-btn--danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(page)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Test-fetch preview modal ── */}
      {previewPage && (
        <div className="rag-preview-backdrop" onClick={() => setPreviewPage(null)}>
          <div className="rag-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rag-preview-header">
              <span className="rag-preview-title">🔍 Preview — {previewPage.label}</span>
              <button type="button" className="rag-preview-close" onClick={() => setPreviewPage(null)}>✕</button>
            </div>
            <div className="rag-preview-body">
              {previewLoading ? (
                <CommonLoader text="Fetching page content..." size={16} />
              ) : (
                <pre className="rag-preview-text">{previewPage.text || 'No content extracted.'}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tracked Page"
        message={`Remove "${deleteTarget?.label}" from tracked pages?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default TrackedPagesTab;
