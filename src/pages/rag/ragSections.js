export const RAG_SECTIONS = [
  {
    id: 'conversations',
    path: 'conversations',
    label: 'Leads & Conversations',
    description:
      'View incoming leads in a table, assign to BDMs, and open full chat history with AI scoring.',
    icon: '💬',
  },
  {
    id: 'questions',
    path: 'question-sets',
    label: 'Question Sets',
    description: 'Build your chatbot onboarding flow — create MCQ and poll questions, set order, and manage active steps.',
    icon: '📋',
  },
  {
    id: 'poll-results',
    path: 'survey-analytics',
    label: 'Survey Analytics',
    description: 'See how users responded to onboarding polls and multiple-choice questions.',
    icon: '📊',
  },
  {
    id: 'documents',
    path: 'document-ingestion',
    label: 'Document Ingestion',
    description: 'Upload PDFs to the vector database and manage indexed knowledge files.',
    icon: '📄',
  },
];

const LEGACY_PATH_ALIASES = {
  'chat-transcripts': 'conversations',
  'ai-insights': 'conversations',
};

export const getSectionById = (id) =>
  RAG_SECTIONS.find((section) => section.id === id);

export const getSectionByPath = (path) => {
  const normalized = LEGACY_PATH_ALIASES[path] || path;
  return RAG_SECTIONS.find((section) => section.path === normalized);
};
