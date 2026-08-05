import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CommonTextEditorBox from '../common-text-editor-box';
import './SeoSettingsDialog.css';

export const createEmptySeoSettings = () => ({
  metaTitle: '',
  metaDescription: '',
  relatedKeyphrases: [],
});

const META_TITLE_LIMIT = 60;
const META_DESCRIPTION_LIMIT = 160;

const getPlainTextLength = (html = '') => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return (temp.textContent || '').replace(/\u00a0/g, ' ').trim().length;
};

function SeoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h10M4 17h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M18 15.5V17l1 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ up = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={up ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SeoSettingsDialog({
  open,
  setOpen,
  value,
  onSave,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState(createEmptySeoSettings);
  const [expandedKeyphraseId, setExpandedKeyphraseId] = useState(null);

  useEffect(() => {
    if (!open) return;

    const next = {
      ...createEmptySeoSettings(),
      ...(value || {}),
      relatedKeyphrases: Array.isArray(value?.relatedKeyphrases)
        ? value.relatedKeyphrases.map((item, index) => ({
            id: item.id || `keyphrase-${index}-${Date.now()}`,
            text: item.text || '',
          }))
        : [],
    };

    setDraft(next);
    setCollapsed(false);
    setExpandedKeyphraseId(next.relatedKeyphrases[0]?.id || null);
  }, [open, value]);

  const updateField = (field, nextValue) => {
    setDraft((prev) => ({ ...prev, [field]: nextValue }));
  };

  const addRelatedKeyphrase = () => {
    const id = `keyphrase-${Date.now()}`;
    setDraft((prev) => ({
      ...prev,
      relatedKeyphrases: [...prev.relatedKeyphrases, { id, text: '' }],
    }));
    setExpandedKeyphraseId(id);
  };

  const updateKeyphrase = (id, text) => {
    setDraft((prev) => ({
      ...prev,
      relatedKeyphrases: prev.relatedKeyphrases.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    }));
  };

  const clearKeyphrase = (id) => {
    setDraft((prev) => ({
      ...prev,
      relatedKeyphrases: prev.relatedKeyphrases.map((item) =>
        item.id === id ? { ...item, text: '' } : item
      ),
    }));
  };

  const toggleKeyphrase = (id) => {
    setExpandedKeyphraseId((current) => (current === id ? null : id));
  };

  const handleSave = () => {
    const cleaned = {
      metaTitle: draft.metaTitle.trim(),
      metaDescription: draft.metaDescription,
      relatedKeyphrases: draft.relatedKeyphrases
        .map((item) => ({
          id: item.id,
          text: (item.text || '').trim(),
        }))
        .filter((item) => item.text),
    };

    onSave?.(cleaned);
    setOpen(false);
  };

  const handleClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="seo-settings-dialog"
      maxWidth="md"
      fullWidth
    >
      <DialogContent className="seo-settings-dialog-content">
        <div className="seo-settings-panel">
          <div className="seo-settings-header">
            <div className="seo-settings-header-left">
              <span className="seo-settings-header-icon">
                <SeoIcon />
              </span>
              <div>
                <h3 className="seo-settings-title">SEO Settings</h3>
                <p className="seo-settings-subtitle">
                  Optimize your page for search engines.
                </p>
              </div>
            </div>

            <div className="seo-settings-header-actions">
              <button
                type="button"
                className="seo-settings-icon-btn"
                aria-label={collapsed ? 'Expand SEO settings' : 'Collapse SEO settings'}
                onClick={() => setCollapsed((prev) => !prev)}
              >
                <ChevronIcon up={!collapsed} />
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="seo-settings-body">
              <div className="seo-settings-grid">
                <div className="seo-settings-field">
                  <p className="seo-settings-label">Meta Title</p>
                  <div className="seo-settings-input-wrap">
                    <input
                      type="text"
                      className="seo-settings-input"
                      value={draft.metaTitle}
                      maxLength={META_TITLE_LIMIT}
                      placeholder="About Us | MyCMS"
                      onChange={(e) => updateField('metaTitle', e.target.value)}
                    />
                    <span className="seo-settings-counter seo-settings-counter--input">
                      {draft.metaTitle.length} / {META_TITLE_LIMIT}
                    </span>
                  </div>
                  <p className="seo-settings-hint">Recommended: 50–60 characters</p>
                </div>

                <div className="seo-settings-field">
                  <p className="seo-settings-label">Meta Description</p>
                  <div className="seo-settings-editor-wrap">
                    <CommonTextEditorBox
                      placeholder="Learn more about MyCMS, our mission, values, and the team behind our success."
                      minHeight="120px"
                      value={draft.metaDescription}
                      onChange={(data) =>
                        updateField('metaDescription', data.html || '')
                      }
                    />
                    <span className="seo-settings-counter seo-settings-counter--editor">
                      {getPlainTextLength(draft.metaDescription)} /{' '}
                      {META_DESCRIPTION_LIMIT}
                    </span>
                  </div>
                  <p className="seo-settings-hint">Recommended: 150–160 characters</p>
                </div>
              </div>

              <div className="seo-settings-keyphrases">
                {draft.relatedKeyphrases.map((item) => {
                  const isExpanded = expandedKeyphraseId === item.id;

                  return (
                    <div key={item.id} className="seo-settings-keyphrase-row">
                      <button
                        type="button"
                        className="seo-settings-keyphrase-toggle"
                        onClick={() => toggleKeyphrase(item.id)}
                      >
                        <span className="seo-settings-keyphrase-toggle-left">
                          <PlusIcon />
                          <span>
                            {item.text
                              ? `Related keyphrase: ${item.text}`
                              : 'Add related keyphrase'}
                          </span>
                        </span>
                        <ChevronIcon up={isExpanded} />
                      </button>

                      {isExpanded && (
                        <div className="seo-settings-keyphrase-body">
                          <div className="seo-settings-field">
                            <div className="seo-settings-label-row">
                              <p className="seo-settings-label">Keyphrase</p>
                              <span
                                className="seo-settings-help"
                                title="Enter a related keyphrase you want this page to rank for."
                              >
                                ?
                              </span>
                            </div>
                            <div className="seo-settings-input-wrap">
                              <input
                                type="text"
                                className="seo-settings-input seo-settings-input--plain"
                                value={item.text}
                                placeholder="Enter keyphrase"
                                onChange={(e) =>
                                  updateKeyphrase(item.id, e.target.value)
                                }
                              />
                              {item.text ? (
                                <button
                                  type="button"
                                  className="seo-settings-clear-btn"
                                  aria-label="Clear keyphrase"
                                  onClick={() => clearKeyphrase(item.id)}
                                >
                                  <ClearIcon />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="seo-settings-keyphrase-row">
                  <button
                    type="button"
                    className="seo-settings-keyphrase-toggle"
                    onClick={addRelatedKeyphrase}
                  >
                    <span className="seo-settings-keyphrase-toggle-left">
                      <PlusIcon />
                      <span>Add related keyphrase</span>
                    </span>
                    <ChevronIcon up={false} />
                  </button>
                </div>
              </div>

              <div className="seo-settings-footer">
                <button
                  type="button"
                  className="seo-settings-btn seo-settings-btn--secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="seo-settings-btn seo-settings-btn--primary"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SeoSettingsDialog;
