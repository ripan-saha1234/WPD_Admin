import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonFileUpload from '../../../components/common-file-upload';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  deleteRagDocument,
  getRagDocuments,
  uploadRagDocument,
} from '../../../services/ragAdminService';

const formatTitle = (text) => {
  if (!text) return 'Untitled Document';
  return text.replace(/\uFFFD/g, '—');
};

function DocumentIngestionTab({ refreshKey, showToast }) {
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(`Chunking, embedding, and indexing ${file.name}...`);

    try {
      const { response, data } = await uploadRagDocument(file);
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Upload failed');

      setUploadStatus(`${data.fileName} indexed (${data.chunks} chunks).`);
      showToast?.('Document uploaded, chunked, and embedded', 'success');
      loadDocuments();
    } catch (err) {
      setUploadStatus(`Error: ${err.message}`);
      showToast?.(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      const targetIdentifier = docToDelete.title || docToDelete.source || docToDelete.fileName;
      const { response, data } = await deleteRagDocument(targetIdentifier);
      if (!response.ok) throw new Error(data?.error || data?.detail || 'Delete failed');

      showToast?.(`"${formatTitle(targetIdentifier)}" removed from vector database`, 'success');
      setDocToDelete(null);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.fileName?.toLowerCase().includes(q) ||
        doc.title?.toLowerCase().includes(q) ||
        doc.source?.toLowerCase().includes(q) ||
        doc.category?.toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  return (
    <div className="rag-tab-content">
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="📚" label="Indexed Documents" value={totalDocuments} />
        <StatCard icon="🧩" label="Vector Chunks" value={totalChunks} />
      </div>

      <div className="rag-documents-layout">
        <div className="rag-card rag-upload-card">
          <div className="rag-panel-title">
            <span>Upload Document to Vector DB</span>
          </div>
          <CommonFileUpload
            acceptedTypes=".md,.markdown,.txt,.pdf,.doc,.docx"
            placeholder="Drop Markdown (.md, .txt) or documentation here"
            browseText="Browse Files"
            supportText="Supports Markdown (.md), text (.txt) and PDF documents. Chunks & vectors are indexed into pgvector."
            disabled={uploading}
            onFilesChange={(file) => handleUpload(file)}
          />

          {uploadStatus && (
            <p className={`rag-upload-status ${uploading ? 'loading' : ''}`}>
              {uploadStatus}
            </p>
          )}
        </div>

        <div className="rag-card rag-table-card">
          <div className="rag-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="rag-panel-title">
              <span>Indexed Knowledge Documents</span>
              {documents.length > 0 && (
                <span className="rag-count-badge" style={{ marginLeft: '0.5rem' }}>
                  {filteredDocuments.length}
                </span>
              )}
            </div>
            {documents.length > 0 && (
              <input
                type="text"
                className="rag-docs-search-input"
                placeholder="Search documents, sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          {loading ? (
            <CommonLoader text="Loading documents..." size={16} />
          ) : documents.length === 0 ? (
            <EmptyState message="No documents indexed yet. Upload a Markdown or documentation file to get started." />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState message={`No documents matching "${searchQuery}"`} />
          ) : (
            <div className="rag-table-wrap">
              <table className="rag-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Source File</th>
                    <th>Category</th>
                    <th>Chunks</th>
                    <th>Origin</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, idx) => (
                    <tr key={`${doc.title || doc.source}-${idx}`}>
                      <td>
                        <span className="rag-doc-title-cell" title={doc.fileName}>
                          <span>📄</span>
                          <span>{formatTitle(doc.fileName)}</span>
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {doc.source}
                        </code>
                      </td>
                      <td>
                        <span className={`rag-category-badge rag-category-badge--${doc.category || 'general'}`}>
                          {doc.category || 'general'}
                        </span>
                      </td>
                      <td>
                        <span className="rag-chunk-count-badge">
                          🧩 {doc.chunks}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`rag-origin-badge rag-origin-badge--${
                            doc.origin === 'upload' ? 'upload' : 'folder'
                          }`}
                        >
                          {doc.origin === 'upload'
                            ? 'Admin Upload'
                            : 'Knowledge Folder'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <CommonButton
                          text="Delete"
                          onClick={() => setDocToDelete(doc)}
                          backgroundColor="#fff"
                          color="#ef4444"
                          borderColor="#fecaca"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(docToDelete)}
        title="Delete Knowledge Document"
        message={`Remove "${formatTitle(docToDelete?.fileName || docToDelete?.title)}" (${docToDelete?.chunks || 0} chunks) from the vector database? This action cannot be undone.`}
        confirmText="Delete Document"
        onConfirm={handleDelete}
        onCancel={() => setDocToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

export default DocumentIngestionTab;

