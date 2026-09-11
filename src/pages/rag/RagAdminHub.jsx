import { useNavigate } from 'react-router-dom';
import { RAG_SECTIONS } from './ragSections';

function RagAdminHub() {
  const navigate = useNavigate();

  return (
    <div className="rag-hub">
      <section className="rag-hub-intro">
        <h2 className="rag-hub-title">Chatbot Management</h2>
        <p className="rag-hub-description">
          Choose a module below to manage conversations, onboarding questions,
          survey data, knowledge documents, and AI-powered lead insights.
        </p>
      </section>

      <section className="rag-hub-section">
        <h3 className="rag-hub-section-title">Modules</h3>
        <div className="rag-hub-grid">
          {RAG_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="rag-hub-card"
              onClick={() => navigate(`/rag/${section.path}`)}
            >
              <span className="rag-hub-card-icon" aria-hidden="true">
                {section.icon}
              </span>
              <span className="rag-hub-card-body">
                <span className="rag-hub-card-label">{section.label}</span>
                <span className="rag-hub-card-desc">{section.description}</span>
              </span>
              <span className="rag-hub-card-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RagAdminHub;
