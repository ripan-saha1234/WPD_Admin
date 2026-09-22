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
    label: 'Visitor Sessions',
    description:
      'View every visitor chat session, browse transcripts, RAG sources, and AI-generated lead insights.',
    icon: '🧑‍💻',
  },
  {
    id: 'services',
    path: 'services',
    label: 'Services & Pricing',
    description:
      'Manage company service catalog, pricing models, and deterministic lookup data used by the AI chatbot.',
    icon: '💼',
  },
  {
    id: 'questions',
    path: 'question-sets',
    label: 'Opening Questions',
    description: 'Configure interactive opening questions and suggestion chips randomly presented to new visitors.',
    icon: '📋',
  },
  {
    id: 'poll-results',
    path: 'survey-analytics',
    label: 'Survey Analytics',
    description: 'See how users responded to onboarding polls and opening question options.',
    icon: '📊',
  },
  {
    id: 'documents',
    path: 'document-ingestion',
    label: 'Document Ingestion',
    description: 'Upload markdown, text, or docs to pgvector and manage indexed knowledge files.',
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
