import React, { useState } from "react";
import CommonButton from "../../../components/common-button";
import CommonLoader from "../../../components/common-loader";

export default function DocumentQualityModal({
  isOpen,
  onClose,
  report,
  documentTitle,
  initialContent = "",
  isUploading = false,
  isAnalyzing = false,
  onReAnalyze,
  onApproveIngest,
  onSaveStaged,
  isReadOnly = false,
}) {
  if (!isOpen || !report) return null;

  const [activeTab, setActiveTab] = useState("issues"); // "issues" | "breakdown" | "kb_impact" | "safety" | "editor"
  const [severityFilter, setSeverityFilter] = useState("all"); // "all" | "critical" | "warning" | "suggestion"
  const [editableContent, setEditableContent] = useState(initialContent);

  const {
    overall_score = 0,
    letter_grade = "B",
    gate_status = "passed",
    status_message = "",
    is_safe = true,
    safety_violations = [],
    category_scores = {},
    issues = [],
    total_issues = 0,
    critical_issues = 0,
    warning_issues = 0,
    suggestion_issues = 0,
    previous_score = null,
    score_delta = null,
    delta_display = null,
    estimated_score = null,
    estimated_improvement = 0,
    kb_impact = null,
    recommendations_summary = [],
  } = report;

  // Filter issues based on active severity filter
  const filteredIssues = issues.filter((iss) => {
    if (severityFilter === "all") return true;
    return iss.severity === severityFilter;
  });

  // Color helper based on score
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const getGateBadge = () => {
    if (gate_status === "blocked" || !is_safe) {
      return {
        label: "Ingestion Blocked",
        bg: "rgba(239, 68, 68, 0.12)",
        color: "#dc2626",
        border: "rgba(239, 68, 68, 0.3)",
      };
    }
    if (gate_status === "review_required") {
      return {
        label: "Review Required",
        bg: "rgba(245, 158, 11, 0.12)",
        color: "#d97706",
        border: "rgba(245, 158, 11, 0.3)",
      };
    }
    return {
      label: "Quality Gate Passed",
      bg: "rgba(16, 185, 129, 0.12)",
      color: "#059669",
      border: "rgba(16, 185, 129, 0.3)",
    };
  };

  const gateBadge = getGateBadge();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1050px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            background: "linear-gradient(to right, var(--surface, #ffffff), var(--surface-2, #f8fafc))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🛡️</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "var(--text, #0f172a)",
                  letterSpacing: "-0.01em",
                }}
              >
                Pre-Ingestion Quality Analysis
              </h2>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-3, #64748b)" }}>
              Document: <strong style={{ color: "var(--text, #1e293b)" }}>{documentTitle}</strong>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--text-3, #94a3b8)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Quality Banner & Score Overview */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            backgroundColor: "var(--surface-2, #f8fafc)",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.25rem",
          }}
        >
          {/* Left: Overall Score Card */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                border: `4px solid ${getScoreColor(overall_score)}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--surface, #ffffff)",
                boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: getScoreColor(overall_score),
                  lineHeight: 1,
                }}
              >
                {overall_score}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-3, #64748b)", fontWeight: 600 }}>/ 100</span>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                <span
                  style={{
                    backgroundColor: gateBadge.bg,
                    color: gateBadge.color,
                    border: `1px solid ${gateBadge.border}`,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {gateBadge.label}
                </span>

                <span
                  style={{
                    backgroundColor: "var(--surface, #ffffff)",
                    border: "1px solid var(--border, #e2e8f0)",
                    color: "var(--text, #1e293b)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Grade: {letter_grade}
                </span>
              </div>

              <div style={{ fontSize: "12.5px", color: "var(--text-2, #475569)", maxWidth: "460px", lineHeight: "1.4" }}>
                {status_message}
              </div>
            </div>
          </div>

          {/* Right: Deltas & Potential */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {delta_display && (
              <div
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "var(--surface, #ffffff)",
                  border: "1px solid var(--border, #e2e8f0)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-3, #64748b)", fontWeight: 600, textTransform: "uppercase" }}>
                  Quality Delta
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: (score_delta ?? 0) >= 0 ? "#10b981" : "#ef4444",
                    marginTop: "2px",
                  }}
                >
                  {delta_display}
                </div>
                <div style={{ fontSize: "10px", color: "#10b981", fontWeight: 500 }}>Verified vs v{report.previous_version || "prev"}</div>
              </div>
            )}

            {estimated_improvement > 0 && (
              <div
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "rgba(6, 144, 253, 0.06)",
                  border: "1px solid rgba(6, 144, 253, 0.25)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#0690fd", fontWeight: 600, textTransform: "uppercase" }}>
                  Target Potential
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0690fd", marginTop: "2px" }}>
                  {estimated_score}/100 (+{estimated_improvement} pts)
                </div>
                <div style={{ fontSize: "10px", color: "#0690fd", fontWeight: 500 }}>Estimated if fixes applied</div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.6rem 1.75rem 0",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            backgroundColor: "var(--surface, #ffffff)",
          }}
        >
          {[
            { id: "issues", label: `Issues & Diagnostics (${total_issues})`, icon: "⚠️" },
            { id: "breakdown", label: "Rubric Scores", icon: "📊" },
            { id: "kb_impact", label: "KB Impact & Overlap", icon: "🌐" },
            { id: "safety", label: `Safety Checks (${safety_violations.length === 0 ? "Safe" : "Flagged"})`, icon: "🔒" },
            ...(!isReadOnly
              ? [{ id: "editor", label: "Edit Markdown In-Place", icon: "✏️" }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #0690fd" : "3px solid transparent",
                padding: "0.55rem 0.9rem 0.7rem",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "13px",
                color: activeTab === tab.id ? "#0690fd" : "var(--text-3, #64748b)",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ marginRight: "6px" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
          {/* TAB 1: Issues & Diagnostics */}
          {activeTab === "issues" && (
            <div>
              {/* Filter Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "12px", color: "var(--text-3, #64748b)", fontWeight: 600 }}>Filter:</span>
                {[
                  { id: "all", label: `All (${total_issues})` },
                  { id: "critical", label: `Critical (${critical_issues})`, color: "#ef4444" },
                  { id: "warning", label: `Warnings (${warning_issues})`, color: "#f59e0b" },
                  { id: "suggestion", label: `Suggestions (${suggestion_issues})`, color: "#3b82f6" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSeverityFilter(f.id)}
                    style={{
                      border: severityFilter === f.id ? `1px solid ${f.color || "#0690fd"}` : "1px solid var(--border, #e2e8f0)",
                      backgroundColor: severityFilter === f.id ? (f.color ? `${f.color}18` : "#0690fd18") : "var(--surface, #ffffff)",
                      color: severityFilter === f.id ? (f.color || "#0690fd") : "var(--text-2, #475569)",
                      padding: "3px 10px",
                      borderRadius: "14px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredIssues.length === 0 ? (
                <div
                  style={{
                    padding: "3.5rem 1rem",
                    textAlign: "center",
                    backgroundColor: "var(--surface-2, #f8fafc)",
                    borderRadius: "12px",
                    border: "1px dashed var(--border, #cbd5e1)",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>🎉</span>
                  <h3 style={{ margin: "0.5rem 0 0.25rem", fontSize: "16px", color: "var(--text, #1e293b)" }}>
                    No issues found in this category
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-3, #64748b)" }}>
                    The document content conforms with high quality standards.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {filteredIssues.map((issue) => {
                    const isCrit = issue.severity === "critical";
                    const isWarn = issue.severity === "warning";
                    const badgeBg = isCrit ? "rgba(239, 68, 68, 0.1)" : isWarn ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)";
                    const badgeCol = isCrit ? "#ef4444" : isWarn ? "#f59e0b" : "#3b82f6";

                    return (
                      <div
                        key={issue.id}
                        style={{
                          backgroundColor: "var(--surface, #ffffff)",
                          border: `1px solid ${isCrit ? "rgba(239, 68, 68, 0.3)" : "var(--border, #e2e8f0)"}`,
                          borderLeft: `4px solid ${badgeCol}`,
                          borderRadius: "10px",
                          padding: "1rem 1.25rem",
                          boxShadow: "var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04))",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeCol,
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {issue.severity}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text, #1e293b)" }}>
                              {issue.title}
                            </span>
                          </div>

                          <div style={{ fontSize: "11.5px", color: "var(--text-3, #64748b)" }}>
                            {issue.line_number ? `Line ${issue.line_number}` : issue.chunk_index !== null ? `Chunk #${issue.chunk_index}` : ""}
                            {issue.section ? ` • ${issue.section}` : ""}
                          </div>
                        </div>

                        {issue.passage && (
                          <div
                            style={{
                              backgroundColor: "var(--surface-2, #f1f5f9)",
                              padding: "0.6rem 0.85rem",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              fontFamily: "var(--font-mono, Consolas, Monaco, monospace)",
                              color: "var(--text, #0f172a)",
                              margin: "0.6rem 0",
                              border: "1px solid var(--border, #e2e8f0)",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {issue.passage}
                          </div>
                        )}

                        <div style={{ fontSize: "13px", color: "var(--text-2, #334155)", lineHeight: "1.5", marginBottom: "0.4rem" }}>
                          <strong>Problem:</strong> {issue.problem}
                        </div>

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#0369a1",
                            backgroundColor: "rgba(6, 144, 253, 0.05)",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(6, 144, 253, 0.15)",
                            lineHeight: "1.45",
                          }}
                        >
                          <strong>💡 Actionable Recommendation:</strong> {issue.recommendation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Rubric Scores */}
          {activeTab === "breakdown" && (
            <div>
              <p style={{ margin: "0 0 1.25rem", fontSize: "13.5px", color: "var(--text-2, #475569)" }}>
                Scores are computed across 6 dimensions evaluating contextual completeness, chunk self-containment, and vector retrieval readiness.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1rem" }}>
                {Object.entries(category_scores).map(([key, cat]) => {
                  const pct = cat.percentage ?? 0;
                  const catCol = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
                  const prettyTitle = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: "var(--surface, #ffffff)",
                        border: "1px solid var(--border, #e2e8f0)",
                        borderRadius: "12px",
                        padding: "1.1rem 1.25rem",
                        boxShadow: "var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.03))",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text, #1e293b)" }}>
                          {prettyTitle}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: "14px", color: catCol }}>
                          {cat.score} / {cat.max_score}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          height: "6px",
                          width: "100%",
                          backgroundColor: "var(--surface-2, #e2e8f0)",
                          borderRadius: "3px",
                          overflow: "hidden",
                          marginBottom: "0.6rem",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: catCol,
                            borderRadius: "3px",
                          }}
                        />
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--text-3, #64748b)", lineHeight: "1.4" }}>
                        {cat.details}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Knowledge Base Impact */}
          {activeTab === "kb_impact" && (
            <div>
              <div
                style={{
                  backgroundColor: "rgba(6, 144, 253, 0.05)",
                  border: "1px solid rgba(6, 144, 253, 0.2)",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#0369a1", marginBottom: "0.2rem" }}>
                    Knowledge Base Impact Summary
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-2, #334155)" }}>
                    {kb_impact?.summary || "Knowledge base impact analysis completed."}
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: kb_impact?.net_contribution === "high" ? "#10b98118" : "#f59e0b18",
                    color: kb_impact?.net_contribution === "high" ? "#10b981" : "#d97706",
                    border: `1px solid ${kb_impact?.net_contribution === "high" ? "#10b98140" : "#f59e0b40"}`,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Contribution: {kb_impact?.net_contribution || "moderate"}
                </span>
              </div>

              {/* New Topics Contributed */}
              {kb_impact?.new_topics && kb_impact.new_topics.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text, #1e293b)", marginBottom: "0.6rem" }}>
                    🌱 Novel Topics Introduced ({kb_impact.new_topics.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {kb_impact.new_topics.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                          color: "#059669",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          padding: "3px 10px",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        + {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overlapping Documents */}
              <div>
                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text, #1e293b)", marginBottom: "0.6rem" }}>
                  📚 Overlap with Existing Active Documents
                </div>
                {!kb_impact?.duplicate_documents || kb_impact.duplicate_documents.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "var(--text-3, #64748b)", fontStyle: "italic" }}>
                    No significant textual overlap with other active knowledge documents.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {kb_impact.duplicate_documents.map((dup, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "var(--surface, #ffffff)",
                          border: "1px solid var(--border, #e2e8f0)",
                          borderRadius: "8px",
                          padding: "0.85rem 1rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <strong style={{ fontSize: "13.5px", color: "var(--text, #1e293b)" }}>{dup.title}</strong>
                          <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                            {dup.match_count} overlapping section(s)
                          </span>
                        </div>
                        {dup.sample_overlap && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-3, #64748b)",
                              backgroundColor: "var(--surface-2, #f8fafc)",
                              padding: "0.4rem 0.6rem",
                              borderRadius: "4px",
                            }}
                          >
                            "{dup.sample_overlap}..."
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Safety & Compliance */}
          {activeTab === "safety" && (
            <div>
              <div
                style={{
                  backgroundColor: is_safe ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: `1px solid ${is_safe ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: is_safe ? "#059669" : "#dc2626",
                    marginBottom: "0.2rem",
                  }}
                >
                  {is_safe ? "✅ Zero-Bypass Safety Checks Passed" : "⛔ Hard Safety Violations Detected"}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text-2, #334155)" }}>
                  Mandatory security policies check for prompt injections, credential leaks, and unverified guarantees.
                  These checks cannot be bypassed by high quality scores.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  {
                    title: "Prompt Injection & System Instruction Override",
                    desc: "Scans for strings attempting to hijack bot persona or system instructions.",
                    violated: safety_violations.some((v) => v.type === "prompt_injection"),
                  },
                  {
                    title: "Credential & Secret Key Leakage",
                    desc: "Scans for API keys (OpenAI, Gemini, AWS), SSH private keys, and passwords.",
                    violated: safety_violations.some((v) => v.type === "credential_leak"),
                  },
                  {
                    title: "Unverified Legal & Financial Guarantees",
                    desc: "Scans for absolute promises (e.g. '100% money back guaranteed anytime with no exceptions').",
                    violated: safety_violations.some((v) => v.type === "unverified_claim"),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.85rem 1.1rem",
                      border: "1px solid var(--border, #e2e8f0)",
                      borderRadius: "8px",
                      backgroundColor: "var(--surface, #ffffff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text, #1e293b)" }}>{item.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-3, #64748b)" }}>{item.desc}</div>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        backgroundColor: item.violated ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: item.violated ? "#ef4444" : "#10b981",
                        border: `1px solid ${item.violated ? "#ef444430" : "#10b98130"}`,
                      }}
                    >
                      {item.violated ? "Violated" : "Passed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Document Editor (In-Place Fixer) */}
          {activeTab === "editor" && !isReadOnly && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "13px", color: "var(--text-2, #475569)" }}>
                  Directly edit the markdown below to resolve short bullets, placeholders, or missing headers:
                </span>
                <CommonButton
                  text={isAnalyzing ? "Re-Evaluating..." : "⚡ Re-Run Quality Analysis"}
                  onClick={() => onReAnalyze?.(editableContent)}
                  disabled={isAnalyzing || !editableContent.trim()}
                  backgroundColor="#0690fd"
                  color="#fff"
                  borderColor="#0690fd"
                />
              </div>

              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                style={{
                  width: "100%",
                  height: "360px",
                  padding: "1rem",
                  fontFamily: "var(--font-mono, Consolas, Monaco, monospace)",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  backgroundColor: "var(--surface-2, #f8fafc)",
                  color: "var(--text, #0f172a)",
                  border: "1px solid var(--border, #cbd5e1)",
                  borderRadius: "8px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                placeholder="# Paste or edit markdown content..."
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: "1rem 1.75rem",
            borderTop: "1px solid var(--border, #e2e8f0)",
            backgroundColor: "var(--surface-2, #f8fafc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-3, #64748b)" }}>
            {recommendations_summary.length > 0 ? recommendations_summary[0] : ""}
          </div>

          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <CommonButton
              text="Close"
              onClick={onClose}
              backgroundColor="#ffffff"
              color="#334155"
              borderColor="#cbd5e1"
              disabled={isUploading}
            />

            {!isReadOnly && onSaveStaged && (
              <CommonButton
                text="Save as Staged (Review Later)"
                onClick={() => onSaveStaged(editableContent)}
                disabled={isUploading || isAnalyzing || gate_status === "blocked"}
                backgroundColor="#f8fafc"
                color="#0f172a"
                borderColor="#cbd5e1"
              />
            )}

            {!isReadOnly && onApproveIngest && (
              <CommonButton
                text={
                  isUploading
                    ? "Embedding & Indexing..."
                    : gate_status === "blocked"
                    ? "Ingestion Blocked"
                    : gate_status === "review_required"
                    ? "Override & Ingest to Vector DB"
                    : "Approve & Ingest to Vector DB"
                }
                onClick={() => onApproveIngest(editableContent, gate_status === "review_required")}
                disabled={isUploading || isAnalyzing || gate_status === "blocked"}
                backgroundColor={gate_status === "review_required" ? "#f59e0b" : "#10b981"}
                color="#ffffff"
                borderColor={gate_status === "review_required" ? "#f59e0b" : "#10b981"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
