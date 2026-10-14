import { useCallback, useEffect, useMemo, useState } from "react";
import CommonFileUpload from "../../../components/common-file-upload";
import CommonButton from "../../../components/common-button";
import CommonLoader from "../../../components/common-loader";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useRagAdmin } from "../context/RagAdminContext";
import {
  deleteRagDocument,
  getRagDocuments,
  getRagDocumentVersions,
  getRagDocumentContent,
  rollbackRagDocumentVersion,
  uploadRagDocument,
} from "../../../services/ragAdminService";

const formatTitle = (text) => {
  if (!text) return "Untitled Document";
  return text.replace(/\uFFFD/g, "—");
};

const CATEGORY_TABS = [
  { id: "all", label: "All Documents", icon: "📚" },
  { id: "company", label: "Company", icon: "🏢" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "services", label: "Services", icon: "🛠️" },
];

const STANDARD_TAGS = [
  "ai",
  "machine-learning",
  "chatbots",
  "automation",
  "predictive-analytics",
  "computer-vision",
  "website-development",
  "e-commerce",
  "cms",
  "seo",
  "web-application",
  "app-development",
  "mobile-apps",
  "ios",
  "android",
  "cross-platform",
  "ui-ux",
  "saas",
  "cloud-native",
  "multi-tenant",
  "subscription-billing",
  "dedicated-hiring",
  "staff-augmentation",
  "remote-team",
  "maintenance",
  "support",
  "security-patches",
  "qa",
  "testing",
  "performance-testing",
  "security-testing",
  "digital-marketing",
  "ppc",
  "social-media-marketing",
  "content-marketing",
  "creative-services",
  "branding",
  "graphic-design",
  "blockchain",
  "web3",
  "smart-contracts",
  "ar",
  "vr",
  "iot",
  "smart-devices",
  "about",
  "mission",
  "vision",
  "founder",
  "leadership",
  "sla",
  "policy",
  "compliance",
  "case-study",
  "project",
];

function DocumentIngestionTab({ refreshKey, showToast }) {
  const { setCustomHeaderButtons } = useRagAdmin();

  // Data & List State
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Ingest Drawer State
  const [isIngestDrawerOpen, setIsIngestDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'loading'|'success'|'error', message: string } | null
  const [changeSummary, setChangeSummary] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("service");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("public");
  const [tagsInput, setTagsInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Parse currently typed tag token for autocomplete
  const currentTagToken = useMemo(() => {
    const parts = tagsInput.split(",");
    return parts[parts.length - 1].trim().toLowerCase();
  }, [tagsInput]);

  // Existing tags already typed
  const activeTagsList = useMemo(() => {
    return tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }, [tagsInput]);

  // Filtered tag suggestions based on user typing
  const filteredTagSuggestions = useMemo(() => {
    if (!currentTagToken) {
      // Suggest standard tags for the selected category if nothing typed yet
      return STANDARD_TAGS.filter((t) => !activeTagsList.includes(t)).slice(0, 8);
    }
    return STANDARD_TAGS.filter(
      (t) => t.includes(currentTagToken) && !activeTagsList.includes(t)
    ).slice(0, 8);
  }, [currentTagToken, activeTagsList]);

  // Handle selecting a tag suggestion
  const handleSelectTagSuggestion = (tag) => {
    const parts = tagsInput.split(",");
    parts[parts.length - 1] = tag;
    const newTags = parts
      .map((p) => p.trim())
      .filter(Boolean)
      .join(", ") + ", ";
    setTagsInput(newTags);
    setShowTagSuggestions(false);
  };

  // Delete State
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Version History Modal State
  const [selectedDocForHistory, setSelectedDocForHistory] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [rollingBackVer, setRollingBackVer] = useState(null);

  // Document View Modal State
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [viewTab, setViewTab] = useState("preview"); // 'preview' | 'chunks'

  // Open Document Viewer
  const openDocumentViewer = async (doc) => {
    setViewingDoc(doc);
    setDocContent(null);
    setViewTab("preview");
    if (!doc.id) {
      setDocContent({
        title: doc.title || doc.fileName,
        full_text: "Document content is not available for legacy items without a document ID.",
        chunks: [],
      });
      return;
    }

    setLoadingContent(true);
    try {
      const { response, data } = await getRagDocumentContent(doc.id);
      if (!response.ok) throw new Error(data?.error || "Failed to load document content");
      setDocContent(data);
    } catch (err) {
      showToast?.(err.message, "error");
      setDocContent({
        title: doc.title || doc.fileName,
        full_text: `Error loading document content: ${err.message}`,
        chunks: [],
      });
    } finally {
      setLoadingContent(false);
    }
  };

  // Load documents
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagDocuments();
      if (!response.ok)
        throw new Error(
          data?.error || data?.detail || "Failed to load documents",
        );

      const docs = data.documents || [];
      setDocuments(docs);
      setTotalDocuments(data.totalDocuments ?? docs.length);
      setTotalChunks(
        data.totalChunks ?? docs.reduce((acc, d) => acc + (d.chunks || 0), 0),
      );
    } catch (err) {
      showToast?.(err.message, "error");
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
        type: "button",
        text: "+ Ingest Document",
        onClick: () => {
          setUploadStatus(null);
          setIsIngestDrawerOpen(true);
        },
        backgroundColor: "#0690fd",
        textColor: "#FFFFFF",
        borderColor: "#0690fd",
      },
    ]);
    return () => setCustomHeaderButtons([]);
  }, [setCustomHeaderButtons]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isIngestDrawerOpen && !uploading) {
        setIsIngestDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIngestDrawerOpen, uploading]);

  // Category matching logic
  const matchesCategoryTab = useCallback((doc, tabId) => {
    if (tabId === "all") return true;
    const cat = (doc.category || "").toLowerCase().trim();
    const title = (doc.title || doc.fileName || "").toLowerCase();

    if (tabId === "company") {
      return (
        cat === "company" ||
        cat === "policy" ||
        cat === "compliance" ||
        cat === "organization" ||
        title.includes("about us") ||
        title.includes("founder") ||
        title.includes("sla") ||
        title.includes("security") ||
        title.includes("compliance") ||
        title.includes("policy")
      );
    }

    if (tabId === "projects") {
      return (
        cat === "project" ||
        cat === "projects" ||
        cat === "case-study" ||
        cat === "casestudy" ||
        title.includes("case study")
      );
    }

    if (tabId === "services") {
      return cat === "service" || cat === "services" || Boolean(doc.service_id);
    }

    return false;
  }, []);

  // Compute category counts dynamically
  const tabCounts = useMemo(() => {
    return {
      all: documents.length,
      company: documents.filter((d) => matchesCategoryTab(d, "company")).length,
      projects: documents.filter((d) => matchesCategoryTab(d, "projects"))
        .length,
      services: documents.filter((d) => matchesCategoryTab(d, "services"))
        .length,
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
          doc.category?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [documents, activeTab, searchQuery, matchesCategoryTab]);

  // Upload handler inside drawer
  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadStatus({
      type: "loading",
      message: `Chunking, embedding, and indexing ${file.name}...`,
    });

    try {
      const { response, data } = await uploadRagDocument(file, {
        changeSummary: changeSummary.trim(),
        category: selectedCategory,
        service_id:
          selectedCategory === "service" || selectedCategory === "projects"
            ? selectedServiceId
            : "",
        tags: tagsInput.trim(),
        visibility: selectedVisibility,
      });
      if (!response.ok)
        throw new Error(data?.error || data?.detail || "Upload failed");

      if (data.is_deduplicated) {
        setUploadStatus({
          type: "success",
          message: `"${data.fileName}" is already up-to-date (v${data.version}). Identical SHA-256 hash detected — duplicate embedding skipped.`,
        });
        showToast?.(
          "Identical document content detected — re-embedding skipped",
          "info",
        );
      } else {
        setUploadStatus({
          type: "success",
          message: `"${data.fileName}" indexed and activated as v${data.version} (${data.chunks} vector chunks).`,
        });
        showToast?.(
          `Document uploaded & activated as v${data.version}`,
          "success",
        );
      }
      setChangeSummary("");
      loadDocuments();
    } catch (err) {
      setUploadStatus({
        type: "error",
        message: err.message,
      });
      showToast?.(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      const targetIdentifier =
        docToDelete.id ||
        docToDelete.title ||
        docToDelete.source ||
        docToDelete.fileName;
      const { response, data } = await deleteRagDocument(targetIdentifier);
      if (!response.ok)
        throw new Error(data?.error || data?.detail || "Delete failed");

      showToast?.(
        `"${formatTitle(docToDelete.fileName)}" removed from vector database`,
        "success",
      );
      setDocToDelete(null);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, "error");
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
          status: "active",
          total_chunks: doc.chunks || 0,
          created_at: doc.created_at,
          change_summary: "Legacy version",
        },
      ]);
      return;
    }

    setLoadingVersions(true);
    try {
      const { response, data } = await getRagDocumentVersions(doc.id);
      if (!response.ok)
        throw new Error(data?.error || "Failed to load versions");
      setVersions(data || []);
    } catch (err) {
      showToast?.(err.message, "error");
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
      const { response, data } = await rollbackRagDocumentVersion(
        selectedDocForHistory.id,
        verNumber,
      );
      if (!response.ok)
        throw new Error(data?.error || data?.detail || "Rollback failed");

      showToast?.(`Successfully rolled back to v${verNumber}`, "success");
      openVersionHistory(selectedDocForHistory);
      loadDocuments();
    } catch (err) {
      showToast?.(err.message, "error");
    } finally {
      setRollingBackVer(null);
    }
  };

  // Format category badge helper
  const renderCategoryBadge = (category) => {
    const cat = (category || "general").toLowerCase();
    let badgeClass = "rag-badge-cat--general";
    if (cat === "service") badgeClass = "rag-badge-cat--service";
    else if (cat === "company") badgeClass = "rag-badge-cat--company";
    else if (cat === "project") badgeClass = "rag-badge-cat--project";
    else if (cat === "policy") badgeClass = "rag-badge-cat--policy";

    return (
      <span className={`rag-badge-cat ${badgeClass}`}>
        {category || "general"}
      </span>
    );
  };

  // Format document file icon
  const getFileIcon = (fileName) => {
    const lower = (fileName || "").toLowerCase();
    if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "📘";
    if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "📝";
    return "📄";
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
        <div className="rag-card rag-table-card" style={{ width: "100%" }}>
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
                    className={`rag-category-tab ${isActive ? "rag-category-tab--active" : ""}`}
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
                    onClick={() => setSearchQuery("")}
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
            <div style={{ padding: "3rem 1rem" }}>
              <CommonLoader text="Loading knowledge documents..." size={20} />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: "2rem 1rem" }}>
              <EmptyState message="No documents indexed in your knowledge base yet. Click '+ Ingest Document' to upload Markdown or Word (.docx) files." />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem" }}>
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
                    <th style={{ minWidth: "280px" }}>Document</th>
                    <th style={{ width: "130px" }}>Version</th>
                    <th style={{ width: "130px" }}>Category</th>
                    <th style={{ width: "120px" }}>Chunks</th>
                    <th style={{ width: "150px" }}>Origin</th>
                    <th style={{ width: "220px", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, idx) => (
                    <tr key={`${doc.id || doc.title || doc.source}-${idx}`}>
                      {/* Document Name & Filename */}
                      <td>
                        <div className="rag-doc-name-group">
                          <span
                            className="rag-doc-main-title"
                            title={doc.fileName}
                          >
                            <span>
                              {getFileIcon(doc.source || doc.fileName)}
                            </span>
                            <span>
                              {formatTitle(doc.title || doc.fileName)}
                            </span>
                          </span>
                          <span className="rag-doc-sub-source">
                            {doc.source || doc.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Version */}
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span className="rag-badge-ver">
                            v{doc.current_version || 1}
                          </span>
                          {doc.total_versions > 1 && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-3)",
                              }}
                            >
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
                            doc.origin === "upload"
                              ? "rag-badge-origin--upload"
                              : "rag-badge-origin--folder"
                          }`}
                        >
                          {doc.origin === "upload"
                            ? "☁️ Admin Upload"
                            : "📁 Knowledge Base"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <CommonButton
                            text="View"
                            onClick={() => openDocumentViewer(doc)}
                            backgroundColor="#eff6ff"
                            color="#2563eb"
                            borderColor="#bfdbfe"
                          />
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
                  Upload Markdown or Word (.docx) files to automatically chunk,
                  embed, and snapshot into pgvector.
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
              {/* Category Selection */}
              <div className="rag-drawer-field">
                <label className="rag-drawer-label">Document Category</label>
                <select
                  className="rag-drawer-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={uploading}
                >
                  <option value="service">
                    🛠️ Services (Offerings & Capabilities)
                  </option>
                  <option value="company">
                    🏢 Company (About, Leadership, Policies)
                  </option>
                  <option value="projects">🚀 Projects & Case Studies</option>
                  <option value="general">📚 General Knowledge</option>
                </select>
              </div>

              {/* Service Slug / Identifier (shown when relevant) */}
              {(selectedCategory === "service" ||
                selectedCategory === "projects") && (
                <div className="rag-drawer-field">
                  <label className="rag-drawer-label">
                    Service Association
                  </label>
                  <select
                    className="rag-drawer-input"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="">None / General</option>
                    <option value="ai-ml">AI & ML Solutions (ai-ml)</option>
                    <option value="website-development">
                      Website Development (website-development)
                    </option>
                    <option value="app-development">
                      Mobile App Development (app-development)
                    </option>
                    <option value="saas-development">
                      SaaS Development (saas-development)
                    </option>
                    <option value="dedicated-hiring">
                      Dedicated Hiring (dedicated-hiring)
                    </option>
                    <option value="maintenance">
                      Maintenance & Support (maintenance)
                    </option>
                    <option value="qa-testing">
                      QA & Testing (qa-testing)
                    </option>
                    <option value="digital-marketing">
                      Digital Marketing (digital-marketing)
                    </option>
                    <option value="creative-services">
                      Creative & UI/UX (creative-services)
                    </option>
                    <option value="blockchain-web3">
                      Blockchain & Web3 (blockchain-web3)
                    </option>
                    <option value="ar-vr">AR / VR (ar-vr)</option>
                    <option value="iot">IoT Solutions (iot)</option>
                  </select>
                </div>
              )}

              {/* Visibility and Tags in a compact row with tag suggestions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  position: "relative",
                }}
              >
                <div className="rag-drawer-field">
                  <label className="rag-drawer-label">Visibility</label>
                  <select
                    className="rag-drawer-input"
                    value={selectedVisibility}
                    onChange={(e) => setSelectedVisibility(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </div>

                <div className="rag-drawer-field" style={{ position: "relative" }}>
                  <label className="rag-drawer-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    className="rag-drawer-input"
                    placeholder="e.g. ai, chatbots, ml"
                    value={tagsInput}
                    onChange={(e) => {
                      setTagsInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => {
                      // Small delay to allow click on suggestions
                      setTimeout(() => setShowTagSuggestions(false), 200);
                    }}
                    disabled={uploading}
                    autoComplete="off"
                  />

                  {/* Tag Suggestions Dropdown */}
                  {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "4px",
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius-sm)",
                        boxShadow: "var(--shadow-md)",
                        zIndex: 100,
                        maxHeight: "160px",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-3)",
                          borderBottom: "1px solid var(--divider)",
                          background: "var(--surface-2)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Suggested Standard Tags
                      </div>
                      {filteredTagSuggestions.map((tag) => (
                        <div
                          key={tag}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input onBlur
                            handleSelectTagSuggestion(tag);
                          }}
                          style={{
                            padding: "6px 10px",
                            fontSize: "12.5px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "var(--text)",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span style={{ color: "var(--primary)", fontSize: "11px" }}>🏷️</span>
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Changelog / Version Note */}
              <div className="rag-drawer-field">
                <label className="rag-drawer-label">
                  Changelog / Version Note
                </label>
                <input
                  type="text"
                  className="rag-drawer-input"
                  placeholder="e.g. Updated Q4 pricing tiers or service details"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {/* Drag-and-Drop Dropzone */}
              <div className="rag-drawer-field" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label className="rag-drawer-label">Document File</label>
                <CommonFileUpload
                  acceptedTypes=".md,.markdown,.txt,.docx"
                  placeholder="Drop Markdown (.md, .txt) or Word (.docx) here"
                  browseText="Browse Files"
                  supportText="Markdown (.md, .txt) and Word (.docx)"
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
                  {uploadStatus.type === "loading" && <span>⏳</span>}
                  {uploadStatus.type === "success" && <span>✅</span>}
                  {uploadStatus.type === "error" && <span>⚠️</span>}
                  <div style={{ flex: 1 }}>{uploadStatus.message}</div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="rag-drawer-footer">
              <CommonButton
                text={uploading ? "Processing..." : "Done"}
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
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--overlay)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedDocForHistory(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              width: "90%",
              maxWidth: "750px",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--divider)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 650,
                    letterSpacing: "-0.01em",
                    color: "var(--text)",
                  }}
                >
                  Version History
                </h3>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "0.82rem",
                    color: "var(--text-3)",
                  }}
                >
                  {formatTitle(selectedDocForHistory.fileName)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForHistory(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}
            >
              {loadingVersions ? (
                <CommonLoader text="Loading version history..." size={16} />
              ) : versions.length === 0 ? (
                <EmptyState message="No previous versions found for this document." />
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border)",
                        textAlign: "left",
                        color: "var(--text-3)",
                        background: "var(--surface-2)",
                        fontSize: "0.75rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      <th style={{ padding: "0.5rem 0.6rem" }}>Version</th>
                      <th style={{ padding: "0.5rem 0.6rem" }}>Status</th>
                      <th style={{ padding: "0.5rem 0.6rem" }}>Chunks</th>
                      <th style={{ padding: "0.5rem 0.6rem" }}>Changelog</th>
                      <th style={{ padding: "0.5rem 0.6rem" }}>Date</th>
                      <th
                        style={{ padding: "0.5rem 0.6rem", textAlign: "right" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((ver) => {
                      const isActive = ver.status === "active";
                      return (
                        <tr
                          key={ver.id || ver.version_number}
                          style={{
                            borderBottom: "1px solid var(--divider)",
                            backgroundColor: isActive
                              ? "var(--success-soft)"
                              : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.75rem 0.6rem",
                              fontWeight: 600,
                            }}
                          >
                            v{ver.version_number}
                          </td>
                          <td style={{ padding: "0.75rem 0.6rem" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 10px",
                                borderRadius: "var(--radius-full)",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: isActive
                                  ? "var(--success-soft)"
                                  : "var(--neutral-soft)",
                                color: isActive
                                  ? "var(--success-text)"
                                  : "var(--neutral-text)",
                              }}
                            >
                              {ver.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 0.6rem" }}>
                            🧩 {ver.total_chunks}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.6rem",
                              color: "var(--text-2)",
                            }}
                          >
                            {ver.change_summary || "—"}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.6rem",
                              color: "var(--text-3)",
                              fontSize: "0.78rem",
                            }}
                          >
                            {ver.created_at
                              ? new Date(ver.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.6rem",
                              textAlign: "right",
                            }}
                          >
                            {isActive ? (
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--success-text)",
                                  fontWeight: 600,
                                }}
                              >
                                Current
                              </span>
                            ) : (
                              <CommonButton
                                text={
                                  rollingBackVer === ver.version_number
                                    ? "Activating..."
                                    : "Rollback"
                                }
                                onClick={() =>
                                  handleRollback(ver.version_number)
                                }
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
                padding: "0.9rem 1.5rem",
                borderTop: "1px solid var(--divider)",
                background: "var(--surface-2)",
                display: "flex",
                justifyContent: "flex-end",
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

      {/* 5. Document Reader / Viewer Modal */}
      {viewingDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--overlay)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setViewingDoc(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              width: "92%",
              maxWidth: "850px",
              height: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.1rem 1.5rem",
                borderBottom: "1px solid var(--divider)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{getFileIcon(viewingDoc.source || viewingDoc.fileName)}</span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 650,
                      letterSpacing: "-0.01em",
                      color: "var(--text)",
                    }}
                  >
                    {formatTitle(viewingDoc.title || viewingDoc.fileName)}
                  </h3>
                  <span className="rag-badge-ver" style={{ marginLeft: "4px" }}>
                    v{viewingDoc.current_version || 1}
                  </span>
                  {renderCategoryBadge(viewingDoc.category)}
                </div>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--text-3)",
                  }}
                >
                  {viewingDoc.source || viewingDoc.fileName} • {docContent?.total_chunks || viewingDoc.chunks || 0} vector chunks in PostgreSQL
                </p>
              </div>

              {/* View Mode Toggle & Close */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    backgroundColor: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewTab("preview")}
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "calc(var(--radius-sm) - 2px)",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: viewTab === "preview" ? "var(--surface)" : "transparent",
                      color: viewTab === "preview" ? "var(--primary)" : "var(--text-3)",
                      boxShadow: viewTab === "preview" ? "var(--shadow-xs)" : "none",
                    }}
                  >
                    📖 Document View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab("chunks")}
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "calc(var(--radius-sm) - 2px)",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: viewTab === "chunks" ? "var(--surface)" : "transparent",
                      color: viewTab === "chunks" ? "var(--primary)" : "var(--text-3)",
                      boxShadow: viewTab === "chunks" ? "var(--shadow-xs)" : "none",
                    }}
                  >
                    🧩 Chunks ({docContent?.chunks?.length || 0})
                  </button>
                </div>

                <button
                  onClick={() => setViewingDoc(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                    color: "var(--text-3)",
                    padding: "0 4px",
                  }}
                  title="Close (Esc)"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {loadingContent ? (
                <div style={{ padding: "4rem 0" }}>
                  <CommonLoader text="Loading document content from vector store..." size={20} />
                </div>
              ) : viewTab === "preview" ? (
                <div
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "1.5rem",
                    color: "var(--text)",
                    fontSize: "14px",
                    lineHeight: "1.65",
                    whiteSpace: "pre-wrap",
                    fontFamily: "var(--font-mono, Consolas, Monaco, monospace)",
                    maxHeight: "100%",
                    overflowY: "auto",
                  }}
                >
                  {docContent?.full_text || "No content found in this document."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(!docContent?.chunks || docContent.chunks.length === 0) ? (
                    <EmptyState message="No chunks found for this document." />
                  ) : (
                    docContent.chunks.map((chunk, cIdx) => (
                      <div
                        key={chunk.id || cIdx}
                        style={{
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          padding: "1rem 1.25rem",
                          boxShadow: "var(--shadow-xs)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "0.6rem",
                            paddingBottom: "0.4rem",
                            borderBottom: "1px solid var(--divider)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--primary)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            CHUNK #{chunk.chunk_index ?? cIdx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-3)",
                              backgroundColor: "var(--surface-2)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            {chunk.metadata?.section ? `Section: ${chunk.metadata.section}` : `${chunk.content.length} chars`}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "13.5px",
                            lineHeight: "1.6",
                            color: "var(--text-2)",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {chunk.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "0.85rem 1.5rem",
                borderTop: "1px solid var(--divider)",
                background: "var(--surface-2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                {docContent?.full_text ? `${docContent.full_text.length} characters` : ""}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {docContent?.full_text && (
                  <CommonButton
                    text="Copy Text"
                    onClick={() => {
                      navigator.clipboard.writeText(docContent.full_text);
                      showToast?.("Document text copied to clipboard", "success");
                    }}
                    backgroundColor="#fff"
                    color="#334155"
                    borderColor="#cbd5e1"
                  />
                )}
                <CommonButton
                  text="Close"
                  onClick={() => setViewingDoc(null)}
                  backgroundColor="#0690fd"
                  color="#fff"
                  borderColor="#0690fd"
                />
              </div>
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
