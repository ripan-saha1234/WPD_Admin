import { useCallback, useEffect, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  createService,
  deleteService,
  getServicePriceHistory,
  getServices,
  updateService,
} from '../../../services/ragAdminService';

const PRICING_MODELS = [
  { value: 'custom_quote', label: 'Custom Quote' },
  { value: 'starting_at', label: 'Starting At' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'range', label: 'Price Range' },
];


const DEFAULT_SERVICE_FORM = {
  name: '',
  slug: '',
  short_description: '',
  pricing_model: 'custom_quote',
  price_amount: '',
  price_max: '',
  price_currency: 'INR',
  price_unit: '',
  price_note: '',
  enabled: true,
  display_order: 0,
};

function ServicesCatalogTab({ refreshKey, showToast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(DEFAULT_SERVICE_FORM);

  // Price history modal state
  const [historyModalService, setHistoryModalService] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getServices(true);
      if (!response.ok) throw new Error(data.error || 'Failed to load services');
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadServices();
  }, [refreshKey, loadServices]);

  const openCreateModal = () => {
    setEditId(null);
    setForm(DEFAULT_SERVICE_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (svc) => {
    setEditId(svc.id);
    setForm({
      name: svc.name || '',
      slug: svc.slug || '',
      short_description: svc.short_description || '',
      pricing_model: svc.pricing_model || 'custom_quote',
      price_amount: svc.price_amount ?? '',
      price_max: svc.price_max ?? '',
      price_currency: svc.price_currency || 'INR',
      price_unit: svc.price_unit || '',
      price_note: svc.price_note || '',
      enabled: Boolean(svc.enabled),
      display_order: svc.display_order || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_SERVICE_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      showToast?.('Service name and slug are required.', 'error');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      price_amount: form.price_amount !== '' ? Number(form.price_amount) : null,
      price_max: form.price_max !== '' ? Number(form.price_max) : null,
      display_order: Number(form.display_order) || 0,
    };

    setSaving(true);
    try {
      const { response, data } = editId
        ? await updateService(editId, payload)
        : await createService(payload);

      if (!response.ok) throw new Error(data.message || data.error || 'Save failed');

      showToast?.(editId ? 'Service updated' : 'Service created', 'success');
      closeModal();
      loadServices();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (svc) => {
    try {
      const { response, data } = await updateService(svc.id, {
        enabled: !svc.enabled,
      });
      if (!response.ok) throw new Error(data.message || 'Toggle failed');
      showToast?.(
        `Service ${!svc.enabled ? 'enabled' : 'disabled'}`,
        'success'
      );
      loadServices();
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  const openPriceHistory = async (svc) => {
    setHistoryModalService(svc);
    setHistoryLoading(true);
    try {
      const { response, data } = await getServicePriceHistory(svc.id);
      if (!response.ok) throw new Error(data.error || 'Failed to load history');
      setPriceHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setPriceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response, data } = await deleteService(deleteTarget.id);
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      showToast?.('Service deleted', 'success');
      setDeleteTarget(null);
      loadServices();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const enabledCount = services.filter((s) => s.enabled).length;

  return (
    <div className="rag-tab-content">
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="💼" label="Total Services" value={services.length} />
        <StatCard icon="✅" label="Active Services" value={enabledCount} />
      </div>

      <div className="rag-card">
        <div className="rag-panel-header">
          <div className="rag-panel-title">
            <span>Company Services &amp; Deterministic Pricing</span>
            <span className="rag-badge-muted">{services.length} registered</span>
          </div>
          <CommonButton
            text="+ Add Service"
            onClick={openCreateModal}
            backgroundColor="#0690fd"
            color="#fff"
          />
        </div>

        {loading ? (
          <CommonLoader text="Loading services..." size={16} />
        ) : services.length === 0 ? (
          <EmptyState message="No services defined. Add services to enable deterministic pricing in the AI chatbot." />
        ) : (
          <div className="rag-table-wrap">
            <table className="rag-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Service Name</th>
                  <th>Slug</th>
                  <th>Pricing Model</th>
                  <th>Price Display</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc.id}>
                    <td>{svc.display_order}</td>
                    <td>
                      <strong>{svc.name}</strong>
                      {svc.short_description && (
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                          {svc.short_description}
                        </p>
                      )}
                    </td>
                    <td>
                      <code>{svc.slug}</code>
                    </td>
                    <td>
                      <span className="rag-badge rag-badge-secondary">
                        {svc.pricing_model || 'custom_quote'}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {svc.price_display ||
                          (svc.price_amount
                            ? `${svc.price_currency} ${svc.price_amount}`
                            : 'Custom Quote')}
                      </strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`rag-toggle-btn ${
                          svc.enabled ? 'rag-toggle-btn--active' : ''
                        }`}
                        onClick={() => handleToggleEnabled(svc)}
                      >
                        {svc.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <CommonButton
                          text="Edit"
                          onClick={() => openEditModal(svc)}
                          backgroundColor="#f1f5f9"
                          color="#0f172a"
                        />
                        <CommonButton
                          text="History"
                          onClick={() => openPriceHistory(svc)}
                          backgroundColor="#fff"
                          color="#0690fd"
                          borderColor="#bae6fd"
                        />
                        <CommonButton
                          text="Delete"
                          onClick={() => setDeleteTarget(svc)}
                          backgroundColor="#fff"
                          color="#ef4444"
                          borderColor="#fecaca"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Service */}
      {isModalOpen && (
        <div className="rag-modal-backdrop">
          <div className="rag-modal-dialog">
            <div className="rag-modal-header">
              <h3>{editId ? 'Edit Service' : 'Add New Service'}</h3>
              <button
                type="button"
                className="rag-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="rag-service-form">
              <div className="rag-form-row">
                <div className="rag-form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug:
                          !editId && !form.slug
                            ? e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '')
                            : form.slug,
                      })
                    }
                    placeholder="e.g. AI & Machine Learning"
                  />
                </div>
                <div className="rag-form-group">
                  <label>Slug (Bot identifier) *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. ai-ml"
                  />
                </div>
              </div>

              <div className="rag-form-group">
                <label>Short Description</label>
                <textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(e) =>
                    setForm({ ...form, short_description: e.target.value })
                  }
                  placeholder="Summary used by the bot to explain this service..."
                />
              </div>

              <div className="rag-form-row">
                <div className="rag-form-group">
                  <label>Pricing Model</label>
                  <select
                    value={form.pricing_model}
                    onChange={(e) =>
                      setForm({ ...form, pricing_model: e.target.value })
                    }
                  >
                    {PRICING_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rag-form-group">
                  <label>Price Amount</label>
                  <input
                    type="number"
                    value={form.price_amount}
                    onChange={(e) =>
                      setForm({ ...form, price_amount: e.target.value })
                    }
                    placeholder="Optional starting price"
                  />
                </div>
                <div className="rag-form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    value={form.price_currency}
                    onChange={(e) =>
                      setForm({ ...form, price_currency: e.target.value })
                    }
                    placeholder="INR / USD"
                  />
                </div>
              </div>

              <div className="rag-form-row">
                <div className="rag-form-group">
                  <label>Price Unit</label>
                  <input
                    type="text"
                    value={form.price_unit}
                    onChange={(e) =>
                      setForm({ ...form, price_unit: e.target.value })
                    }
                    placeholder="e.g. month, project, hour"
                  />
                </div>
                <div className="rag-form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({ ...form, display_order: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="rag-form-group">
                <label>Pricing Note (Special conditions)</label>
                <input
                  type="text"
                  value={form.price_note}
                  onChange={(e) =>
                    setForm({ ...form, price_note: e.target.value })
                  }
                  placeholder="e.g. Depends on custom scope and models required"
                />
              </div>

              <div className="rag-modal-footer">
                <CommonButton
                  text="Cancel"
                  onClick={closeModal}
                  backgroundColor="#f1f5f9"
                  color="#475569"
                />
                <CommonButton
                  text={saving ? 'Saving...' : 'Save Service'}
                  type="submit"
                  disabled={saving}
                  backgroundColor="#0690fd"
                  color="#fff"
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Price Change History */}
      {historyModalService && (
        <div className="rag-modal-backdrop">
          <div className="rag-modal-dialog">
            <div className="rag-modal-header">
              <h3>
                Price Change Audit Log — {historyModalService.name}
              </h3>
              <button
                type="button"
                className="rag-modal-close"
                onClick={() => setHistoryModalService(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {historyLoading ? (
                <CommonLoader text="Loading price history..." size={16} />
              ) : priceHistory.length === 0 ? (
                <EmptyState message="No price changes logged for this service yet." />
              ) : (
                <div className="rag-table-wrap">
                  <table className="rag-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Old Price</th>
                        <th>New Price</th>
                        <th>Changed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.changed_at).toLocaleString()}</td>
                          <td>
                            {h.old_price_amount != null
                              ? `${h.old_price_currency || ''} ${h.old_price_amount}`
                              : 'None'}
                          </td>
                          <td>
                            <strong>
                              {h.new_price_amount != null
                                ? `${h.new_price_currency || ''} ${h.new_price_amount}`
                                : 'Custom Quote'}
                            </strong>
                          </td>
                          <td>{h.changed_by || 'Admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service"
        message={`Are you sure you want to remove service "${deleteTarget?.name}"?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default ServicesCatalogTab;
