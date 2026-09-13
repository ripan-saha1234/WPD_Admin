import { useNavigate, useParams } from 'react-router-dom';
import { useRagAdmin } from './context/RagAdminContext';
import { getSectionByPath } from './ragSections';
import QuestionSetsPage from './questions/QuestionSetsPage';
import SurveyAnalyticsTab from './tabs/SurveyAnalyticsTab';
import DocumentIngestionTab from './tabs/DocumentIngestionTab';
import TrackedPagesTab from './tabs/TrackedPagesTab';
import HookMessagesTab from './tabs/HookMessagesTab';
import SessionsTab from './tabs/SessionsTab';

function RagSectionView() {
  const { sectionPath } = useParams();
  const navigate = useNavigate();
  const section = getSectionByPath(sectionPath);
  const { refreshKey, showToast } = useRagAdmin();

  // 'conversations' is handled externally (legacy Leads & Conversations page)
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
    case 'sessions':
      return <SessionsTab {...commonProps} />;
    case 'questions':
      return <QuestionSetsPage {...commonProps} />;
    case 'poll-results':
      return <SurveyAnalyticsTab {...commonProps} />;
    case 'documents':
      return <DocumentIngestionTab {...commonProps} />;
    case 'tracked-pages':
      return <TrackedPagesTab {...commonProps} />;
    case 'hook-messages':
      return <HookMessagesTab {...commonProps} />;
    default:
      return null;
  }
}

export default RagSectionView;
