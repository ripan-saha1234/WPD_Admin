import { useCallback, useEffect, useState } from 'react';
import CommonLoader from '../../../components/common-loader';
import EmptyState from '../components/EmptyState';
import { getRagSurveyAnalytics } from '../../../services/ragAdminService';

function SurveyAnalyticsTab({ refreshKey, showToast }) {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagSurveyAnalytics();
      if (!response.ok) throw new Error(data.error || 'Failed to load analytics');
      setAnalytics(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(err.message, 'error');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [refreshKey, loadAnalytics]);

  if (loading) {
    return <CommonLoader text="Loading analytics..." />;
  }

  if (analytics.length === 0) {
    return (
      <div className="rag-tab-content">
        <EmptyState message="No question responses recorded yet." />
      </div>
    );
  }

  return (
    <div className="rag-tab-content">
      <h2 className="rag-section-title">
        User Onboarding Survey Responses &amp; Poll Results
      </h2>
      <div className="rag-survey-analytics-grid">
        {analytics.map((question) => (
          <div key={question.question_text} className="rag-analytics-card">
            <div className="rag-analytics-card-header">
              <h3>{question.question_text}</h3>
              <span className="rag-order-badge">
                {question.totalAnswers} Answers
              </span>
            </div>
            <div className="rag-analytics-bars">
              {(question.stats || []).map((opt) => (
                <div key={opt.option} className="rag-analytics-bar">
                  <div className="rag-analytics-bar-header">
                    <span>{opt.option}</span>
                    <span>
                      <strong>{opt.count}</strong> ({opt.percentage}%)
                    </span>
                  </div>
                  <div className="rag-bar-track">
                    <div
                      className="rag-bar-fill"
                      style={{ width: `${opt.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurveyAnalyticsTab;
