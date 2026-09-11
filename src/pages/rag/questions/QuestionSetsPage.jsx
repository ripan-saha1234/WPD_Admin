import { useCallback, useEffect, useState } from 'react';
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

const DEFAULT_OPTIONS = ['Option A', 'Option B', 'Option C'];

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

      showToast?.(editId ? 'Question updated' : 'Question added to flow', 'success');
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

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const reordered = [...questions];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    try {
      const { response } = await reorderRagQuestions(reordered.map((q) => q.id));
      if (!response.ok) throw new Error('Reorder failed');
      loadQuestions();
      showToast?.('Flow order updated', 'success');
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  return (
    <div className="qs-page">
      <section className="qs-intro">
        <h2>Question Sets</h2>
        <p>
          Build your chatbot onboarding flow step by step. Questions appear to users
          in the order shown below — drag order with the up/down controls.
        </p>
      </section>

      <QuestionSummaryCards questions={questions} />

      <div className="qs-main-layout">
        <QuestionFormPanel
          editId={editId}
          questionText={questionText}
          questionType={questionType}
          options={options}
          isActive={isActive}
          saving={saving}
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

        <div className="qs-flow-panel rag-card">
          <div className="qs-flow-panel-header">
            <div>
              <h3>Chatbot Flow</h3>
              <p className="rag-muted">
                {questions.length} question{questions.length !== 1 ? 's' : ''} in sequence
              </p>
            </div>
            <div className="qs-flow-legend">
              <span><span className="qs-legend-dot qs-legend-dot--active" /> Active</span>
              <span><span className="qs-legend-dot qs-legend-dot--inactive" /> Inactive</span>
            </div>
          </div>

          <QuestionFlowList
            questions={questions}
            loading={loading}
            editId={editId}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onMove={handleMove}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Question"
        message="This question will be removed from the chatbot flow. Existing responses will be kept."
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default QuestionSetsPage;
