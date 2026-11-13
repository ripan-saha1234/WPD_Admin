import { useCallback, useEffect, useMemo, useState } from 'react';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionCard from './components/QuestionCard';
import QuestionDrawer from './components/QuestionDrawer';
import {
  createRagQuestion,
  deleteRagQuestion,
  getRagQuestions,
  updateRagQuestion,
} from '../../../services/ragAdminService';
import './questions.css';

const DEFAULT_OPTIONS = [
  'Web & Cloud Application',
  'Mobile App Development',
  'AI / Machine Learning',
  'Consulting & Architecture',
];

function QuestionSetsPage({ refreshKey, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([...DEFAULT_OPTIONS]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive'

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagQuestions();
      if (!response.ok) throw new Error(data.error || 'Failed to load questions');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadQuestions();
  }, [refreshKey, loadQuestions]);

  // Drawer handlers
  const handleOpenCreateDrawer = () => {
    setEditId('');
    setQuestionText('');
    setOptions([...DEFAULT_OPTIONS]);
    setIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (question) => {
    const rawOpts = question.options;
    let parsed = [];
    if (Array.isArray(rawOpts)) {
      parsed = rawOpts;
    } else if (typeof rawOpts === 'string') {
      try {
        parsed = JSON.parse(rawOpts);
      } catch {
        parsed = [];
      }
    }

    setEditId(String(question.id));
    setQuestionText(question.question_text || '');
    setOptions(
      parsed.length
        ? parsed.map((o) => (typeof o === 'object' ? o.option_text || o.label || '' : String(o)))
        : ['', '']
    );
    setIsActive(Boolean(question.is_active));
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditId('');
    setQuestionText('');
    setSaving(false);
  };

  const handleApplyTemplate = (tpl) => {
    setQuestionText(tpl.text);
    setOptions([...tpl.options]);
    setIsActive(true);
  };

  // Option modification handlers in Drawer
  const handleOptionChange = (idx, value) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, '']);
    }
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMoveOption = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= options.length) return;
    setOptions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Save question handler
  const handleSaveQuestion = async () => {
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionText.trim()) {
      showToast?.('Please enter the question text.', 'error');
      return;
    }
    if (trimmedOptions.length < 2) {
      showToast?.('Please provide at least 2 suggestion chips.', 'error');
      return;
    }

    const payload = {
      question_text: questionText.trim(),
      options: trimmedOptions,
      is_active: isActive,
    };

    setSaving(true);
    try {
      const { response, data } = editId
        ? await updateRagQuestion(editId, payload)
        : await createRagQuestion(payload);

      if (!response.ok) throw new Error(data.error || 'Failed to save question');

      showToast?.(editId ? 'Opening question updated' : 'Opening question published', 'success');
      handleCloseDrawer();
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Inline toggle active/pause
  const handleToggleActive = async (question) => {
    try {
      const newStatus = !question.is_active;
      const { response } = await updateRagQuestion(question.id, {
        is_active: newStatus,
      });
      if (!response.ok) throw new Error('Failed to update status');
      showToast?.(
        newStatus ? 'Prompt activated in live rotation' : 'Prompt paused',
        'success'
      );
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response } = await deleteRagQuestion(deleteTarget);
      if (!response.ok) throw new Error('Failed to delete question');
      showToast?.('Question deleted successfully', 'success');
      setDeleteTarget(null);
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filter computation
  const activeCount = useMemo(() => questions.filter((q) => q.is_active).length, [questions]);
  const inactiveCount = questions.length - activeCount;
  const totalResponses = useMemo(
    () => questions.reduce((sum, q) => sum + (q.response_count || 0), 0),
    [questions]
  );

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Tab filter
      if (filterTab === 'active' && !q.is_active) return false;
      if (filterTab === 'inactive' && q.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = (q.question_text || '').toLowerCase().includes(query);
        const rawOpts = q.options || [];
        const matchesOption = Array.isArray(rawOpts)
          ? rawOpts.some((opt) => {
              const label = typeof opt === 'object' ? opt.option_text || opt.label : String(opt);
              return (label || '').toLowerCase().includes(query);
            })
          : false;
        if (!matchesText && !matchesOption) return false;
      }
      return true;
    });
  }, [questions, filterTab, searchQuery]);

  return (
    <div className="qs-page-container">
      {/* ── Top Header Section ── */}
      <div className="qs-header-bar">
        <div className="qs-header-info">
          <h2>Opening Questions &amp; Suggestion Chips</h2>
          <p>
            Configure the greeting icebreakers presented to visitors when opening Jerry AI.
            Jerry randomly rotates between all active prompts and presents the chips as quick-replies.
          </p>
        </div>
        <div className="qs-header-actions">
          <CommonButton
            text="+ New Opening Question"
            onClick={handleOpenCreateDrawer}
            backgroundColor="var(--primary)"
            color="#ffffff"
            borderColor="var(--primary)"
          />
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="qs-kpi-grid">
        <div className="qs-kpi-card">
          <span className="qs-kpi-icon">📋</span>
          <div>
            <span className="qs-kpi-label">Total Prompts</span>
            <span className="qs-kpi-value">{questions.length}</span>
          </div>
        </div>

        <div className="qs-kpi-card">
          <span className="qs-kpi-icon" style={{ background: 'var(--success-soft)', color: 'var(--success-text)' }}>
            ✅
          </span>
          <div>
            <span className="qs-kpi-label">Active in Rotation</span>
            <span className="qs-kpi-value" style={{ color: 'var(--success-text)' }}>
              {activeCount}
            </span>
          </div>
        </div>

        <div className="qs-kpi-card">
          <span className="qs-kpi-icon" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
            ⏸️
          </span>
          <div>
            <span className="qs-kpi-label">Paused Prompts</span>
            <span className="qs-kpi-value">{inactiveCount}</span>
          </div>
        </div>

        <div className="qs-kpi-card">
          <span className="qs-kpi-icon" style={{ background: 'var(--info-soft)', color: 'var(--info-text)' }}>
            📊
          </span>
          <div>
            <span className="qs-kpi-label">Total Responses</span>
            <span className="qs-kpi-value" style={{ color: 'var(--info-text)' }}>
              {totalResponses}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="qs-filter-toolbar rag-card">
        <div className="qs-filter-tabs">
          <button
            type="button"
            className={`qs-filter-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Prompts ({questions.length})
          </button>
          <button
            type="button"
            className={`qs-filter-tab-btn ${filterTab === 'active' ? 'active' : ''}`}
            onClick={() => setFilterTab('active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`qs-filter-tab-btn ${filterTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterTab('inactive')}
          >
            Paused ({inactiveCount})
          </button>
        </div>

        <div className="qs-toolbar-right">
          <div className="qs-search-wrapper">
            <input
              type="text"
              className="qs-search-field"
              placeholder="Search questions or chips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="qs-search-reset-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className="qs-reload-btn"
            onClick={loadQuestions}
            title="Refresh questions list"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── Main Cards List ── */}
      {loading ? (
        <div className="qs-loading-box">
          <CommonLoader text="Loading opening questions..." />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="qs-empty-box rag-card">
          <EmptyState
            icon={searchQuery ? '🔍' : '📋'}
            message={
              searchQuery
                ? `No opening questions match "${searchQuery}".`
                : filterTab !== 'all'
                ? `No ${filterTab} opening questions found.`
                : 'No opening questions configured yet. Click "+ New Opening Question" to create your first icebreaker!'
            }
          />
          {questions.length === 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <CommonButton
                text="+ Create Opening Question"
                onClick={handleOpenCreateDrawer}
                backgroundColor="var(--primary)"
                color="#ffffff"
                borderColor="var(--primary)"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="qs-cards-grid">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onEdit={handleOpenEditDrawer}
              onDelete={(id) => setDeleteTarget(id)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* ── Slide-Over Drawer for Create / Edit ── */}
      <QuestionDrawer
        isOpen={isDrawerOpen}
        editId={editId}
        questionText={questionText}
        options={options}
        isActive={isActive}
        saving={saving}
        onClose={handleCloseDrawer}
        onQuestionTextChange={setQuestionText}
        onOptionChange={handleOptionChange}
        onAddOption={handleAddOption}
        onRemoveOption={handleRemoveOption}
        onMoveOption={handleMoveOption}
        onActiveChange={setIsActive}
        onApplyTemplate={handleApplyTemplate}
        onSave={handleSaveQuestion}
      />

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Opening Question"
        message="Are you sure you want to permanently delete this opening question? Website visitors will no longer see it."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        confirmColor="#ef4444"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default QuestionSetsPage;
