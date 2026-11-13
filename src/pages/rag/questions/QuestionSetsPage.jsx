import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionSummaryCards from './components/QuestionSummaryCards';
import QuestionFormPanel from './components/QuestionFormPanel';
import QuestionFlowList from './components/QuestionFlowList';
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
  'AI / Machine Learning Solution',
  'Consulting & Architecture',
];

const QUESTION_TEMPLATES = [
  {
    text: 'What brings you here today?',
    options: [
      'I need a website or web app',
      'I need a mobile app',
      "I'm looking for AI or automation",
      'Just exploring your services',
    ],
  },
  {
    text: 'What is your planned timeline for this project?',
    options: [
      'Immediately (< 1 month)',
      '1 to 3 months',
      '3 to 6 months',
      'Flexible / Research phase',
    ],
  },
  {
    text: 'What is your estimated budget range?',
    options: [
      'Under $5,000',
      '$5,000 - $15,000',
      '$15,000 - $50,000',
      '$50,000+ Enterprise',
    ],
  },
];

function QuestionSetsPage({ refreshKey, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([...DEFAULT_OPTIONS]);
  const [isActive, setIsActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search and filter tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive'

  // Interactive Simulator hovered state
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

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

  const resetForm = () => {
    setEditId('');
    setQuestionText('');
    setOptions([...DEFAULT_OPTIONS]);
    setIsActive(true);
    setHoveredQuestion(null);
  };

  const applyTemplate = (tpl) => {
    setQuestionText(tpl.text);
    setOptions([...tpl.options]);
    setIsActive(true);
  };

  const handleSave = async () => {
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionText.trim()) {
      showToast?.('Question text is required.', 'error');
      return;
    }
    if (trimmedOptions.length < 2) {
      showToast?.('Please provide at least 2 options.', 'error');
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

      showToast?.(editId ? 'Question updated' : 'Opening question published', 'success');
      resetForm();
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question) => {
    const parsedOptions = Array.isArray(question.options)
      ? question.options
      : typeof question.options === 'string'
        ? JSON.parse(question.options)
        : [];

    setEditId(String(question.id));
    setQuestionText(question.question_text);
    setOptions(parsedOptions.length ? parsedOptions.map(o => typeof o === 'object' ? (o.option_text || o.label || '') : String(o)) : ['', '']);
    setIsActive(Boolean(question.is_active));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response } = await deleteRagQuestion(deleteTarget);
      if (!response.ok) throw new Error('Failed to delete question');
      showToast?.('Question deleted', 'success');
      setDeleteTarget(null);
      if (String(editId) === String(deleteTarget)) resetForm();
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (question) => {
    try {
      const newStatus = !question.is_active;
      const { response } = await updateRagQuestion(question.id, {
        is_active: newStatus,
      });
      if (!response.ok) throw new Error('Failed to update status');
      showToast?.(
        newStatus ? 'Question activated' : 'Question paused',
        'success'
      );
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  // Option actions
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

  // Filter and search computation
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question_text?.toLowerCase().includes(query);
        const parsedOpts = Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string'
            ? JSON.parse(q.options || '[]')
            : [];
        const matchesOpts = parsedOpts.some((opt) => {
          const str = typeof opt === 'object' ? (opt.option_text || opt.label || '') : String(opt);
          return str.toLowerCase().includes(query);
        });
        if (!matchesText && !matchesOpts) return false;
      }

      // 2. Tab filter
      if (filterTab === 'active' && !q.is_active) return false;
      if (filterTab === 'inactive' && q.is_active) return false;

      return true;
    });
  }, [questions, searchQuery, filterTab]);

  return (
    <div className="qs-page">
      {/* Intro section */}
      <section className="qs-intro">
        <h2>Opening Questions &amp; Suggestion Chips</h2>
        <p>
          Configure the interactive opening icebreakers presented to new visitors when launching Jerry AI.
          Jerry randomly selects one active opening question to start the conversation, presenting its options as clickable chips.
        </p>
      </section>

      {/* Summary KPI Cards */}
      <QuestionSummaryCards questions={questions} />

      {/* Main 2-Column Workspace */}
      <div className="qs-workspace-grid">
        {/* Left Column: Form & Simulator */}
        <div className="qs-left-col">
          <QuestionFormPanel
            editId={editId}
            questionText={questionText}
            options={options}
            isActive={isActive}
            saving={saving}
            templates={QUESTION_TEMPLATES}
            onApplyTemplate={applyTemplate}
            onQuestionTextChange={setQuestionText}
            onOptionChange={handleOptionChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onActiveChange={setIsActive}
            onSave={handleSave}
            onCancel={resetForm}
          />
        </div>

        {/* Right Column: List of Questions */}
        <div className="qs-right-col rag-card">
          {/* Header Toolbar */}
          <div className="qs-list-toolbar">
            <div className="qs-toolbar-title-row">
              <span className="qs-list-title">
                Configured Opening Prompts ({filteredQuestions.length})
              </span>
              <button
                type="button"
                className="qs-refresh-btn"
                onClick={loadQuestions}
                title="Refresh question pool"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Filter Tabs & Search Row */}
            <div className="qs-filter-search-row">
              <div className="qs-filter-tabs">
                <button
                  type="button"
                  className={`qs-filter-tab ${filterTab === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  className={`qs-filter-tab ${filterTab === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterTab('active')}
                >
                  Active ({questions.filter((q) => q.is_active).length})
                </button>
                <button
                  type="button"
                  className={`qs-filter-tab ${filterTab === 'inactive' ? 'active' : ''}`}
                  onClick={() => setFilterTab('inactive')}
                >
                  Paused ({questions.filter((q) => !q.is_active).length})
                </button>
              </div>

              <div className="qs-search-box">
                <input
                  type="text"
                  className="qs-search-input"
                  placeholder="Search questions &amp; chips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="qs-search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Component */}
          <QuestionFlowList
            questions={filteredQuestions}
            totalCount={questions.length}
            loading={loading}
            editId={editId}
            searchQuery={searchQuery}
            onHoverQuestion={setHoveredQuestion}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Opening Question"
        message="Are you sure you want to delete this opening question? Visitors will no longer see it."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default QuestionSetsPage;
