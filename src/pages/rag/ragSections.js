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
    id: 'sessions',
    path: 'sessions',
    label: 'Vistor Sessions',
    description:
      'View every visitor chat session browse transcripts, onboarding answers, and AI-generated lead insights.',
    icon: '🧑‍💻',
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
  {
    id: 'tracked-pages',
    path: 'tracked-pages',
    label: 'Tracked Pages',
    description: 'Add live website pages for the AI to crawl and cache — supports static HTML and React SPAs.',
    icon: '🌐',
  },
  {
    id: 'hook-messages',
    path: 'hook-messages',
    label: 'Hook Messages',
    description: 'Manage proactive chat widget popup messages that appear to visitors before they open the chat.',
    icon: '💬',
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
