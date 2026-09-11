import { useNavigate, useParams } from 'react-router-dom';
import { useRagAdmin } from './context/RagAdminContext';
import { getSectionByPath } from './ragSections';
import QuestionSetsPage from './questions/QuestionSetsPage';
import SurveyAnalyticsTab from './tabs/SurveyAnalyticsTab';
import DocumentIngestionTab from './tabs/DocumentIngestionTab';

function RagSectionView() {
  const { sectionPath } = useParams();
  const navigate = useNavigate();
  const section = getSectionByPath(sectionPath);
  const { refreshKey, showToast } = useRagAdmin();

  if (!section || section.id === 'conversations') {
    return (
      <div className="rag-section-missing">
        <p>Module not found.</p>
        <button type="button" onClick={() => navigate('/rag')}>
          Back to Chatbot Admin
        </button>
      </div>
    );
  }

  const commonProps = { refreshKey, showToast };

  switch (section.id) {
    case 'questions':
      return <QuestionSetsPage {...commonProps} />;
    case 'poll-results':
      return <SurveyAnalyticsTab {...commonProps} />;
    case 'documents':
      return <DocumentIngestionTab {...commonProps} />;
    default:
      return null;
  }
}

export default RagSectionView;
