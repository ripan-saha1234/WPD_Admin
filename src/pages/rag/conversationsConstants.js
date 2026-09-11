export const SESSION_FILTER_OPTIONS = [
  { label: 'All sessions', value: 'all' },
  { label: 'With messages', value: 'with_messages' },
  { label: 'With survey answers', value: 'with_survey' },
  { label: 'AI analyzed', value: 'analyzed' },
  { label: 'Pending analysis', value: 'pending_analysis' },
];

export const LEAD_FILTER_OPTIONS = [
  { label: 'All lead types', value: '' },
  { label: 'Hot', value: 'hot' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cold', value: 'cold' },
];

export const SENTIMENT_FILTER_OPTIONS = [
  { label: 'All sentiments', value: '' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

export const PAGE_SIZE_OPTIONS = [
  { label: '15 / page', value: '15' },
  { label: '25 / page', value: '25' },
  { label: '50 / page', value: '50' },
  { label: '100 / page', value: '100' },
];

export const MAIN_VIEW_OPTIONS = [
  { id: 'explorer', label: 'Session Explorer', icon: '💬', hint: 'Browse & read chats' },
  { id: 'intelligence', label: 'Lead Intelligence', icon: '🧠', hint: 'Scores & reports' },
];

export const DETAIL_TAB_OPTIONS = [
  { id: 'insights', label: 'AI Insights' },
  { id: 'chat', label: 'Conversation' },
  { id: 'profile', label: 'Onboarding' },
];
