import { useCallback, useEffect, useState } from 'react';
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

function DocumentIngestionTab({ refreshKey, showToast }) {
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [deleteSource, setDeleteSource] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagDocuments();
      if (!response.ok) throw new Error(data.error || 'Failed to load documents');

      setDocuments(data.documents || []);
      setTotalDocuments(data.totalDocuments ?? (data.documents || []).length);
      setTotalChunks(data.totalChunks ?? 0);
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

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus('Only PDF files are supported.');
      showToast?.('Only PDF files are supported.', 'error');
      return;
    }

    setUploading(true);
    setUploadStatus(`Uploading and indexing ${file.name}...`);

    try {
      const { response, data } = await uploadRagDocument(file);
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setUploadStatus(`${data.fileName} indexed (${data.chunks} chunks).`);
      showToast?.('Document uploaded and indexed', 'success');
      loadDocuments();
    } catch (err) {
      setUploadStatus(`Error: ${err.message}`);
      showToast?.(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSource) return;
    setDeleting(true);
    try {
      const { response, data } = await deleteRagDocument(deleteSource);
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      showToast?.('Document removed from vector database', 'success');
      setDeleteSource(null);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rag-tab-content">
      <div className="rag-stats-grid rag-stats-grid--compact">
        <StatCard icon="📚" label="Indexed Documents" value={totalDocuments} />
        <StatCard icon="🧩" label="Vector Chunks" value={totalChunks} />
      </div>

      <div className="rag-documents-layout">
        <div className="rag-card rag-upload-card">
          <div className="rag-panel-title">
            <span>Upload PDF to Vector DB</span>
          </div>
          <CommonFileUpload
            acceptedTypes="document"
            placeholder="Drop PDF here or click to browse"
            browseText="Browse PDF"
            supportText="Only PDF files are supported. Re-uploading replaces old vectors."
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
          <div className="rag-panel-header">
            <div className="rag-panel-title">
              <span>Indexed Knowledge Documents</span>
            </div>
          </div>

          {loading ? (
            <CommonLoader text="Loading documents..." size={16} />
          ) : documents.length === 0 ? (
            <EmptyState message="No documents indexed yet. Upload a PDF to get started." />
          ) : (
            <div className="rag-table-wrap">
              <table className="rag-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Source</th>
                    <th>Chunks</th>
                    <th>Origin</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.source}>
                      <td>{doc.fileName}</td>
                      <td>
                        <code>{doc.source}</code>
                      </td>
                      <td>{doc.chunks}</td>
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
                      <td>
                        <CommonButton
                          text="Delete"
                          onClick={() => setDeleteSource(doc.source)}
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
        open={Boolean(deleteSource)}
        title="Delete Document"
        message={`Remove "${deleteSource}" from the vector database?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteSource(null)}
        loading={deleting}
      />
    </div>
  );
}

export default DocumentIngestionTab;
