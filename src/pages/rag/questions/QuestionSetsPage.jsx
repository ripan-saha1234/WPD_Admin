import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionSummaryCards from './components/QuestionSummaryCards';
import QuestionFormPanel from './components/QuestionFormPanel';
import QuestionFlowList from './components/QuestionFlowList';
import {
  createRagQuestion,
  deleteRagQuestion,
  getRagQuestions,
  reorderRagQuestions,
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
    type: 'mcq',
    options: [
      'I need a website or web app',
      'I need a mobile app',
      "I'm looking for AI or automation",
      'Just exploring your services',
    ],
  },
  {
    text: 'What is your planned timeline for this project?',
    type: 'poll',
    options: [
      'Immediately (< 1 month)',
      '1 to 3 months',
      '3 to 6 months',
      'Flexible / Research phase',
    ],
  },
  {
    text: 'What is your estimated budget range?',
    type: 'mcq',
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
  const [questionType, setQuestionType] = useState('mcq');
  const [options, setOptions] = useState([...DEFAULT_OPTIONS]);
  const [isActive, setIsActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search and filter tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive' | 'mcq' | 'poll'

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
    setQuestionType('mcq');
    setOptions([...DEFAULT_OPTIONS]);
    setIsActive(true);
    setHoveredQuestion(null);
  };

  const applyTemplate = (tpl) => {
    setQuestionText(tpl.text);
    setQuestionType(tpl.type);
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
      question_type: questionType,
      options: trimmedOptions,
      is_active: isActive,
    };

    setSaving(true);
    try {
      const { response, data } = editId
        ? await updateRagQuestion(editId, payload)
        : await createRagQuestion(payload);

      if (!response.ok) throw new Error(data.error || 'Failed to save question');

      showToast?.(editId ? 'Question updated' : 'Question added to sequence', 'success');
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
    setQuestionType(question.question_type || 'mcq');
    setOptions(parsedOptions.length ? parsedOptions : ['', '']);
    setIsActive(Boolean(question.is_active));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { response } = await deleteRagQuestion(deleteTarget);
      if (!response.ok) throw new Error('Failed to delete question');
      showToast?.('Question removed from flow', 'success');
      setDeleteTarget(null);
      if (String(editId) === String(deleteTarget)) resetForm();
      loadQuestions();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (indexInFiltered, direction) => {
    const targetQ = filteredQuestions[indexInFiltered];
    if (!targetQ) return;

    const actualIdx = questions.findIndex((q) => q.id === targetQ.id);
    const swapIdx = actualIdx + direction;
    if (swapIdx < 0 || swapIdx >= questions.length) return;

    const reordered = [...questions];
    [reordered[actualIdx], reordered[swapIdx]] = [reordered[swapIdx], reordered[actualIdx]];
    setQuestions(reordered);

    try {
      const { response } = await reorderRagQuestions(reordered.map((q) => q.id));
      if (!response.ok) throw new Error('Reorder failed');
      showToast?.('Sequence order updated', 'success');
    } catch (err) {
      showToast?.(err.message, 'error');
      loadQuestions(); // revert
    }
  };

  const handleToggleActive = async (question) => {
    const nextState = !question.is_active;
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, is_active: nextState } : q))
    );
    try {
      const parsedOptions = Array.isArray(question.options)
        ? question.options
        : typeof question.options === 'string'
          ? JSON.parse(question.options)
          : [];

      const { response } = await updateRagQuestion(question.id, {
        question_text: question.question_text,
        question_type: question.question_type || 'mcq',
        options: parsedOptions,
        is_active: nextState,
      });
      if (!response.ok) throw new Error('Update failed');
      showToast?.(`Question marked as ${nextState ? 'Active' : 'Inactive'}`, 'success');
    } catch (err) {
      showToast?.(err.message, 'error');
      loadQuestions();
    }
  };

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterTab === 'active' && !q.is_active) return false;
      if (filterTab === 'inactive' && q.is_active) return false;
      if (filterTab === 'mcq' && q.question_type !== 'mcq') return false;
      if (filterTab === 'poll' && q.question_type !== 'poll') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question_text.toLowerCase().includes(query);
        const optionsList = Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string'
            ? JSON.parse(q.options || '[]')
            : [];
        const matchesOption = optionsList.some((opt) =>
          String(opt).toLowerCase().includes(query)
        );
        return matchesText || matchesOption;
      }
      return true;
    });
  }, [questions, filterTab, searchQuery]);

  // Preview simulator data
  const previewData = useMemo(() => {
    if (hoveredQuestion) {
      const opts = Array.isArray(hoveredQuestion.options)
        ? hoveredQuestion.options
        : typeof hoveredQuestion.options === 'string'
          ? JSON.parse(hoveredQuestion.options || '[]')
          : [];
      return {
        text: hoveredQuestion.question_text,
        type: hoveredQuestion.question_type || 'mcq',
        options: opts,
      };
    }
    if (questionText.trim()) {
      return {
        text: questionText.trim(),
        type: questionType,
        options: options.filter((o) => o.trim()),
      };
    }
    const firstActive = questions.find((q) => q.is_active);
    if (firstActive) {
      const opts = Array.isArray(firstActive.options)
        ? firstActive.options
        : typeof firstActive.options === 'string'
          ? JSON.parse(firstActive.options || '[]')
          : [];
      return {
        text: firstActive.question_text,
        type: firstActive.question_type || 'mcq',
        options: opts,
      };
    }
    return {
      text: 'How can we help your team succeed today?',
      type: 'mcq',
      options: ['Custom Web App', 'Mobile Development', 'AI Integration', 'Pricing Consultation'],
    };
  }, [hoveredQuestion, questionText, questionType, options, questions]);

  return (
    <div className="qs-page">
      {/* ── Summary Cards Strip ── */}
      <QuestionSummaryCards questions={questions} />

      <div className="qs-main-layout">
        {/* ── LEFT COLUMN: Form + Widget Interactive Simulator ── */}
        <div className="qs-left-column">
          <QuestionFormPanel
            editId={editId}
            questionText={questionText}
            questionType={questionType}
            options={options}
            isActive={isActive}
            saving={saving}
            templates={QUESTION_TEMPLATES}
            onApplyTemplate={applyTemplate}
            onQuestionTextChange={setQuestionText}
            onQuestionTypeChange={setQuestionType}
            onOptionChange={(index, value) =>
              setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
            }
            onAddOption={() => setOptions((prev) => [...prev, ''])}
            onRemoveOption={(index) =>
              setOptions((prev) => prev.filter((_, i) => i !== index))
            }
            onActiveChange={setIsActive}
            onSave={handleSave}
            onCancel={resetForm}
          />

          {/* ── Real-Time Chat Widget Onboarding Simulator ── */}
          <div className="rag-card qs-sim-card">
            <div className="qs-sim-header">
              <div className="qs-sim-badge">
                <span className="qs-pulse-dot" />
                Live Chat Simulator
              </div>
              <span className="qs-sim-type-badge">
                {previewData.type === 'poll' ? '📊 Poll Mode' : '🔘 MCQ Chips'}
              </span>
            </div>

            <div className="qs-sim-window">
              {/* Window Header */}
              <div className="qs-sim-window-header">
                <div className="qs-sim-avatar">
                  <span className="qs-sim-avatar-orb" />
                  <div>
                    <span className="qs-sim-name">Jerry</span>
                    <span className="qs-sim-sub">AI Consultant</span>
                  </div>
                </div>
                <div className="qs-sim-window-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              {/* Bot Message Bubble */}
              <div className="qs-sim-body">
                <div className="qs-sim-msg-row">
                  <div className="qs-sim-bubble">
                    <p className="qs-sim-msg-text">{previewData.text}</p>
                  </div>
                </div>

                {/* Option Chips */}
                <div className="qs-sim-chips-container">
                  {previewData.options.map((opt, i) => (
                    <div key={i} className="qs-sim-chip">
                      <span className="qs-sim-chip-dot" />
                      <span>{opt || `Option ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="qs-sim-footer">
              💡 New visitors see this onboarding prompt when they open Jerry AI.
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Sequence / Flow Management ── */}
        <div className="qs-right-column">
          <div className="qs-flow-panel rag-card">
            {/* Header with Search and Filter Tabs */}
            <div className="qs-flow-panel-header">
              <div className="qs-flow-title-row">
                <div>
                  <h3 className="qs-flow-title">
                    Chatbot Onboarding Flow
                    <span className="qs-flow-count">{filteredQuestions.length}</span>
                  </h3>
                  <p className="rag-muted">
                    Questions are triggered sequentially or picked to initiate visitor dialog.
                  </p>
                </div>

                {/* Controls Bar */}
                <div className="qs-controls-bar">
                  <div className="qs-search-box">
                    <span className="qs-search-icon">🔍</span>
                    <input
                      type="text"
                      className="qs-search-input"
                      placeholder="Search questions or options..."
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

                  <div className="qs-filter-pills">
                    <button
                      type="button"
                      className={`qs-filter-pill ${filterTab === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterTab('all')}
                    >
                      All ({questions.length})
                    </button>
                    <button
                      type="button"
                      className={`qs-filter-pill ${filterTab === 'active' ? 'active' : ''}`}
                      onClick={() => setFilterTab('active')}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className={`qs-filter-pill ${filterTab === 'inactive' ? 'active' : ''}`}
                      onClick={() => setFilterTab('inactive')}
                    >
                      Inactive
                    </button>
                    <button
                      type="button"
                      className={`qs-filter-pill ${filterTab === 'mcq' ? 'active' : ''}`}
                      onClick={() => setFilterTab('mcq')}
                    >
                      MCQ
                    </button>
                    <button
                      type="button"
                      className={`qs-filter-pill ${filterTab === 'poll' ? 'active' : ''}`}
                      onClick={() => setFilterTab('poll')}
                    >
                      Poll
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <QuestionFlowList
              questions={filteredQuestions}
              totalCount={questions.length}
              loading={loading}
              editId={editId}
              searchQuery={searchQuery}
              onHoverQuestion={setHoveredQuestion}
              onToggleActive={handleToggleActive}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onMove={handleMove}
            />

            <div className="qs-flow-footer">
              <span className="qs-flow-footer-hint">
                💡 <strong>Tip:</strong> Use the ▲ and ▼ buttons to order the onboarding priority. Visitors pick one option to immediately branch their chat topic.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Question"
        message="This question will be removed from the chatbot flow. Existing user analytics will be preserved."
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default QuestionSetsPage;

