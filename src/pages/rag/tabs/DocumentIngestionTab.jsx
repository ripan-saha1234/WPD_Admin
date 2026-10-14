import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonFileUpload from '../../../components/common-file-upload';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useRagAdmin } from '../context/RagAdminContext';
import {
  deleteRagDocument,
  getRagDocuments,
  getRagDocumentVersions,
  rollbackRagDocumentVersion,
  uploadRagDocument,
} from '../../../services/ragAdminService';

const formatTitle = (text) => {
  if (!text) return 'Untitled Document';
  return text.replace(/\uFFFD/g, '—');
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All Documents', icon: '📚' },
  { id: 'company', label: 'Company', icon: '🏢' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'services', label: 'Services', icon: '🛠️' },
];

function DocumentIngestionTab({ refreshKey, showToast }) {
  const { setCustomHeaderButtons } = useRagAdmin();

  // Data & List State
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Ingest Drawer State
  const [isIngestDrawerOpen, setIsIngestDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'loading'|'success'|'error', message: string } | null
  const [changeSummary, setChangeSummary] = useState('');

  // Delete State
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Version History Modal State
  const [selectedDocForHistory, setSelectedDocForHistory] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [rollingBackVer, setRollingBackVer] = useState(null);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagDocuments();
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Failed to load documents');

      const docs = data.documents || [];
      setDocuments(docs);
      setTotalDocuments(data.totalDocuments ?? docs.length);
      setTotalChunks(data.totalChunks ?? docs.reduce((acc, d) => acc + (d.chunks || 0), 0));
    } catch (err) {
      showToast?.(err.message, 'error');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDocuments();
  }, [refreshKey, loadDocuments]);

  // Register "+ Ingest Document" button in Top-Right Header near Refresh
  useEffect(() => {
    setCustomHeaderButtons([
      {
        type: 'button',
        text: '+ Ingest Document',
        onClick: () => {
          setUploadStatus(null);
          setIsIngestDrawerOpen(true);
        },
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ]);
    return () => setCustomHeaderButtons([]);
  }, [setCustomHeaderButtons]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isIngestDrawerOpen && !uploading) {
        setIsIngestDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIngestDrawerOpen, uploading]);

  // Category matching logic
  const matchesCategoryTab = useCallback((doc, tabId) => {
    if (tabId === 'all') return true;
    const cat = (doc.category || '').toLowerCase().trim();
    const title = (doc.title || doc.fileName || '').toLowerCase();

    if (tabId === 'company') {
      return (
        cat === 'company' ||
        cat === 'policy' ||
        cat === 'compliance' ||
        cat === 'organization' ||
        title.includes('about us') ||
        title.includes('founder') ||
        title.includes('sla') ||
        title.includes('security') ||
        title.includes('compliance') ||
        title.includes('policy')
      );
    }

    if (tabId === 'projects') {
      return (
        cat === 'project' ||
        cat === 'projects' ||
        cat === 'case-study' ||
        cat === 'casestudy' ||
        title.includes('case study')
      );
    }

    if (tabId === 'services') {
      return (
        cat === 'service' ||
        cat === 'services' ||
        Boolean(doc.service_id)
      );
    }

    return false;
  }, []);

  // Compute category counts dynamically
  const tabCounts = useMemo(() => {
    return {
      all: documents.length,
      company: documents.filter((d) => matchesCategoryTab(d, 'company')).length,
      projects: documents.filter((d) => matchesCategoryTab(d, 'projects')).length,
      services: documents.filter((d) => matchesCategoryTab(d, 'services')).length,
    };
  }, [documents, matchesCategoryTab]);

  // Filter documents by Active Tab & Search Query
  const filteredDocuments = useMemo(() => {
    let result = documents.filter((doc) => matchesCategoryTab(doc, activeTab));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (doc) =>
          doc.fileName?.toLowerCase().includes(q) ||
          doc.title?.toLowerCase().includes(q) ||
          doc.source?.toLowerCase().includes(q) ||
          doc.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [documents, activeTab, searchQuery, matchesCategoryTab]);

  // Upload handler inside drawer
  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadStatus({
      type: 'loading',
      message: `Chunking, embedding, and indexing ${file.name}...`,
    });

    try {
      const { response, data } = await uploadRagDocument(file, changeSummary.trim());
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Upload failed');

      if (data.is_deduplicated) {
        setUploadStatus({
          type: 'success',
          message: `"${data.fileName}" is already up-to-date (v${data.version}). Identical SHA-256 hash detected — duplicate embedding skipped.`,
        });
        showToast?.('Identical document content detected — re-embedding skipped', 'info');
      } else {
        setUploadStatus({
          type: 'success',
          message: `"${data.fileName}" indexed and activated as v${data.version} (${data.chunks} vector chunks).`,
        });
        showToast?.(`Document uploaded & activated as v${data.version}`, 'success');
      }
      setChangeSummary('');
      loadDocuments();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message,
      });
      showToast?.(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      const targetIdentifier = docToDelete.id || docToDelete.title || docToDelete.source || docToDelete.fileName;
      const { response, data } = await deleteRagDocument(targetIdentifier);
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Delete failed');

      showToast?.(`"${formatTitle(docToDelete.fileName)}" removed from vector database`, 'success');
      setDocToDelete(null);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // History modal handler
  const openVersionHistory = async (doc) => {
    setSelectedDocForHistory(doc);
    if (!doc.id) {
      setVersions([
        {
          version_number: doc.current_version || 1,
          status: 'active',
          total_chunks: doc.chunks || 0,
          created_at: doc.created_at,
          change_summary: 'Legacy version',
        },
      ]);
      return;
    }

    setLoadingVersions(true);
    try {
      const { response, data } = await getRagDocumentVersions(doc.id);
      if (!response.ok) throw new Error(data?.error || 'Failed to load versions');
      setVersions(data || []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Rollback version handler
  const handleRollback = async (verNumber) => {
    if (!selectedDocForHistory?.id) return;
    setRollingBackVer(verNumber);
    try {
      const { response, data } = await rollbackRagDocumentVersion(selectedDocForHistory.id, verNumber);
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Rollback failed');

      showToast?.(`Successfully rolled back to v${verNumber}`, 'success');
      openVersionHistory(selectedDocForHistory);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setRollingBackVer(null);
    }
  };

  // Format category badge helper
  const renderCategoryBadge = (category) => {
    const cat = (category || 'general').toLowerCase();
    let badgeClass = 'rag-badge-cat--general';
    if (cat === 'service') badgeClass = 'rag-badge-cat--service';
    else if (cat === 'company') badgeClass = 'rag-badge-cat--company';
    else if (cat === 'project') badgeClass = 'rag-badge-cat--project';
    else if (cat === 'policy') badgeClass = 'rag-badge-cat--policy';

    return <span className={`rag-badge-cat ${badgeClass}`}>{category || 'general'}</span>;
  };

  // Format document file icon
  const getFileIcon = (fileName) => {
    const lower = (fileName || '').toLowerCase();
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) return '📘';
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) return '📝';
    return '📄';
  };

  return (
    <div className="rag-tab-content">
      {/* 1. Responsive Stat Cards */}
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="📚" label="Indexed Documents" value={totalDocuments} />
        <StatCard icon="🧩" label="Active Vector Chunks" value={totalChunks} />
      </div>

      {/* 2. Full-Width Document Management Card */}
      <div className="rag-documents-layout">
        <div className="rag-card rag-table-card" style={{ width: '100%' }}>
          
          {/* Navigation Bar: Category Tabs + Toolbar */}
          <div className="rag-doc-tabs-bar">
            {/* Category Tabs */}
            <div className="rag-category-tabs" role="tablist">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tabCounts[tab.id] ?? 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`rag-category-tab ${isActive ? 'rag-category-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className="rag-tab-badge">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Right-aligned Search Input */}
            <div className="rag-docs-toolbar-actions">
              <div className="rag-docs-search-wrap">
                <span className="rag-docs-search-icon">🔍</span>
                <input
                  type="text"
                  className="rag-docs-search-input rag-docs-search-input-with-icon"
                  placeholder={`Search in ${CATEGORY_TABS.find((t) => t.id === activeTab)?.label}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="rag-docs-search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Document Table View */}
          {loading ? (
            <div style={{ padding: '3rem 1rem' }}>
              <CommonLoader text="Loading knowledge documents..." size={20} />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '2rem 1rem' }}>
              <EmptyState message="No documents indexed in your knowledge base yet. Click '+ Ingest Document' to upload Markdown or Word (.docx) files." />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem' }}>
              <EmptyState
                message={
                  searchQuery
                    ? `No documents matching "${searchQuery}" in ${CATEGORY_TABS.find((t) => t.id === activeTab)?.label}.`
                    : `No documents in ${CATEGORY_TABS.find((t) => t.id === activeTab)?.label} yet.`
                }
              />
            </div>
          ) : (
            <div className="rag-table-wrap">
              <table className="rag-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '280px' }}>Document</th>
                    <th style={{ width: '130px' }}>Version</th>
                    <th style={{ width: '130px' }}>Category</th>
                    <th style={{ width: '120px' }}>Chunks</th>
                    <th style={{ width: '150px' }}>Origin</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, idx) => (
                    <tr key={`${doc.id || doc.title || doc.source}-${idx}`}>
                      {/* Document Name & Filename */}
                      <td>
                        <div className="rag-doc-name-group">
                          <span className="rag-doc-main-title" title={doc.fileName}>
                            <span>{getFileIcon(doc.source || doc.fileName)}</span>
                            <span>{formatTitle(doc.title || doc.fileName)}</span>
                          </span>
                          <span className="rag-doc-sub-source">
                            {doc.source || doc.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Version */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span className="rag-badge-ver">
                            v{doc.current_version || 1}
                          </span>
                          {doc.total_versions > 1 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                              ({doc.total_versions} vers)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td>{renderCategoryBadge(doc.category)}</td>

                      {/* Number of Chunks */}
                      <td>
                        <span className="rag-badge-chunks">
                          🧩 {doc.chunks || 0}
                        </span>
                      </td>

                      {/* Origin */}
                      <td>
                        <span
                          className={`rag-badge-origin ${
                            doc.origin === 'upload' ? 'rag-badge-origin--upload' : 'rag-badge-origin--folder'
                          }`}
                        >
                          {doc.origin === 'upload' ? '☁️ Admin Upload' : '📁 Knowledge Base'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <CommonButton
                            text="History"
                            onClick={() => openVersionHistory(doc)}
                            backgroundColor="#f8fafc"
                            color="#334155"
                            borderColor="#cbd5e1"
                          />
                          <CommonButton
                            text="Delete"
                            onClick={() => setDocToDelete(doc)}
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
      </div>

      {/* 3. Right-Side Ingestion Drawer */}
      {isIngestDrawerOpen && (
        <>
          <div
            className="rag-drawer-backdrop"
            onClick={() => !uploading && setIsIngestDrawerOpen(false)}
          />

          <div
            className="rag-ingest-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ingest-drawer-title"
          >
            {/* Drawer Header */}
            <div className="rag-drawer-header">
              <div className="rag-drawer-title-group">
                <h3 id="ingest-drawer-title">
                  <span>📥</span> Ingest Document
                </h3>
                <p>
                  Upload Markdown or Word (.docx) files to automatically chunk, embed, and snapshot into pgvector.
                </p>
              </div>
              <button
                type="button"
                className="rag-drawer-close-btn"
                onClick={() => !uploading && setIsIngestDrawerOpen(false)}
                disabled={uploading}
                title="Close drawer (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="rag-drawer-body">
              {/* Optional Changelog / Version Note */}
              <div className="rag-drawer-field">
                <label className="rag-drawer-label">
                  Changelog / Version Note (Optional)
                </label>
                <input
                  type="text"
                  className="rag-drawer-input"
                  placeholder="e.g. Updated Q4 pricing tiers or service details"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  disabled={uploading}
                />
                <p className="rag-drawer-helper">
                  Recorded in the immutable version history snapshot for audit logs and rollback tracking.
                </p>
              </div>

              {/* Drag-and-Drop Dropzone */}
              <div className="rag-drawer-field">
                <label className="rag-drawer-label">Document File</label>
                <CommonFileUpload
                  acceptedTypes=".md,.markdown,.txt,.docx"
                  placeholder="Drop Markdown (.md, .txt) or Word (.docx) here"
                  browseText="Browse Files"
                  supportText="Markdown (.md, .txt) and Word (.docx). Automatically versioned, chunked, and embedded via pgvector."
                  disabled={uploading}
                  onFilesChange={(file) => handleUpload(file)}
                />
              </div>

              {/* Upload Status / Progress Feedback */}
              {uploadStatus && (
                <div
                  className={`rag-drawer-status-card ${uploadStatus.type}`}
                  role="status"
                >
                  {uploadStatus.type === 'loading' && <span>⏳</span>}
                  {uploadStatus.type === 'success' && <span>✅</span>}
                  {uploadStatus.type === 'error' && <span>⚠️</span>}
                  <div style={{ flex: 1 }}>{uploadStatus.message}</div>
                </div>
              )}

              {/* Automated Pipeline Info Card */}
              <div className="rag-drawer-pipeline-info">
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
                  ⚙️ Production Pipeline Features:
                </div>
                <div className="rag-drawer-pipeline-item">
                  <span>⚡</span>
                  <span><strong>Sub-second Versioning:</strong> Staged chunks are atomically swapped with zero downtime.</span>
                </div>
                <div className="rag-drawer-pipeline-item">
                  <span>🎯</span>
                  <span><strong>SHA-256 Deduplication:</strong> Identical content skips external embedding calls automatically.</span>
                </div>
                <div className="rag-drawer-pipeline-item">
                  <span>📘</span>
                  <span><strong>Word (.docx) Conversion:</strong> Headings, bullet points, and tables are converted to clean Markdown.</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="rag-drawer-footer">
              <CommonButton
                text={uploading ? 'Processing...' : 'Done'}
                onClick={() => setIsIngestDrawerOpen(false)}
                disabled={uploading}
                backgroundColor="#0690fd"
                color="#FFFFFF"
                borderColor="#0690fd"
              />
            </div>
          </div>
        </>
      )}

      {/* 4. Version History Modal */}
      {selectedDocForHistory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedDocForHistory(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              width: '90%',
              maxWidth: '750px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--divider)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 650, letterSpacing: '-0.01em', color: 'var(--text)' }}>
                  Version History
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                  {formatTitle(selectedDocForHistory.fileName)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForHistory(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingVersions ? (
                <CommonLoader text="Loading version history..." size={16} />
              ) : versions.length === 0 ? (
                <EmptyState message="No previous versions found for this document." />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-3)', background: 'var(--surface-2)', fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Version</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Chunks</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Changelog</th>
                      <th style={{ padding: '0.5rem 0.6rem' }}>Date</th>
                      <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((ver) => {
                      const isActive = ver.status === 'active';
                      return (
                        <tr
                          key={ver.id || ver.version_number}
                          style={{
                            borderBottom: '1px solid var(--divider)',
                            backgroundColor: isActive ? 'var(--success-soft)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.6rem', fontWeight: 600 }}>
                            v{ver.version_number}
                          </td>
                          <td style={{ padding: '0.75rem 0.6rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: isActive ? 'var(--success-soft)' : 'var(--neutral-soft)',
                                color: isActive ? 'var(--success-text)' : 'var(--neutral-text)',
                              }}
                            >
                              {ver.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.6rem' }}>
                            🧩 {ver.total_chunks}
                          </td>
                          <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-2)' }}>
                            {ver.change_summary || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-3)', fontSize: '0.78rem' }}>
                            {ver.created_at ? new Date(ver.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                            {isActive ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--success-text)', fontWeight: 600 }}>
                                Current
                              </span>
                            ) : (
                              <CommonButton
                                text={rollingBackVer === ver.version_number ? 'Activating...' : 'Rollback'}
                                onClick={() => handleRollback(ver.version_number)}
                                disabled={Boolean(rollingBackVer)}
                                backgroundColor="#3b82f6"
                                color="#fff"
                                borderColor="#3b82f6"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: '0.9rem 1.5rem',
                borderTop: '1px solid var(--divider)',
                background: 'var(--surface-2)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <CommonButton
                text="Close"
                onClick={() => setSelectedDocForHistory(null)}
                backgroundColor="#fff"
                color="#475569"
                borderColor="#cbd5e1"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirm Deletion Dialog */}
      <ConfirmDialog
        open={Boolean(docToDelete)}
        title="Delete Knowledge Document"
        message={`Remove "${formatTitle(docToDelete?.fileName || docToDelete?.title)}" (${docToDelete?.chunks || 0} chunks) and all its version history from the vector database?`}
        confirmText="Delete Document"
        onConfirm={handleDelete}
        onCancel={() => setDocToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

export default DocumentIngestionTab;
