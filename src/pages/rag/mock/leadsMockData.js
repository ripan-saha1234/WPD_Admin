export const BDM_OPTIONS = [
  { id: 'bdm-1', name: 'Sarah Mitchell' },
  { id: 'bdm-2', name: 'James Carter' },
  { id: 'bdm-3', name: 'Priya Sharma' },
  { id: 'bdm-4', name: 'Michael Okafor' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export const MOCK_LEADS = [
  {
    id: 'LD-1001',
    name: 'John Smith',
    email: 'john.smith@acmelogistics.com',
    shortMessage: 'Interested in enterprise pricing for our logistics fleet across 3 regions.',
    status: 'new',
    leadType: 'hot',
    assignedTo: null,
    channels: { sms: 4, whatsapp: 12, chat: 18 },
    chats: [
      { id: 'c1', channel: 'whatsapp', role: 'user', content: 'Hi, we need a quote for 50+ vehicles.', timestamp: '2026-03-08T10:15:00Z' },
      { id: 'c2', channel: 'whatsapp', role: 'bot', content: 'I can help with fleet solutions. What regions are you operating in?', timestamp: '2026-03-08T10:15:30Z' },
      { id: 'c3', channel: 'chat', role: 'user', content: 'North America, UK, and Germany. Budget approved for Q2.', timestamp: '2026-03-08T11:02:00Z' },
      { id: 'c4', channel: 'sms', role: 'user', content: 'Please send the enterprise deck to my email.', timestamp: '2026-03-08T14:20:00Z' },
    ],
    aiAnalysis: null,
  },
  {
    id: 'LD-1002',
    name: 'Emily Chen',
    email: 'emily.chen@startup.io',
    shortMessage: 'Looking for chatbot integration for our SaaS onboarding flow.',
    status: 'assigned',
    leadType: 'warm',
    assignedTo: 'bdm-2',
    channels: { sms: 2, whatsapp: 5, chat: 9 },
    chats: [
      { id: 'c5', channel: 'chat', role: 'user', content: 'Does your bot support custom question flows?', timestamp: '2026-03-07T09:30:00Z' },
      { id: 'c6', channel: 'chat', role: 'bot', content: 'Yes — you can configure MCQ and poll-style onboarding questions.', timestamp: '2026-03-07T09:30:45Z' },
      { id: 'c7', channel: 'whatsapp', role: 'user', content: 'We have about 2k signups per month.', timestamp: '2026-03-07T16:00:00Z' },
    ],
    aiAnalysis: {
      leadScore: 72,
      icpFit: 68,
      sentiment: 'positive',
      leadType: 'warm',
      verdict: 'Good fit for mid-market SaaS package',
      summary: 'Decision-maker exploring onboarding automation with meaningful volume.',
      icpReasoning: 'Monthly signup volume and technical questions indicate serious evaluation.',
      recommendedAction: 'Schedule a product demo focused on question-set builder.',
      topics: ['SaaS', 'Onboarding', 'Integration'],
      profileSignals: ['Technical buyer', 'Volume: 2k/mo'],
      chatSignals: ['Asked about custom flows', 'Compared to current manual process'],
      analyzedAt: '2026-03-07T18:00:00Z',
    },
  },
  {
    id: 'LD-1003',
    name: 'Robert Williams',
    email: 'r.williams@gmail.com',
    shortMessage: 'Just browsing — might need something later this year.',
    status: 'contacted',
    leadType: 'cold',
    assignedTo: 'bdm-1',
    channels: { sms: 1, whatsapp: 0, chat: 3 },
    chats: [
      { id: 'c8', channel: 'chat', role: 'user', content: 'What do you offer?', timestamp: '2026-03-06T15:00:00Z' },
      { id: 'c9', channel: 'chat', role: 'bot', content: 'We provide AI-powered chatbots with lead qualification.', timestamp: '2026-03-06T15:00:20Z' },
    ],
    aiAnalysis: {
      leadScore: 28,
      icpFit: 22,
      sentiment: 'neutral',
      leadType: 'cold',
      verdict: 'Low intent — nurture only',
      summary: 'Early-stage curiosity with no budget or timeline signals.',
      icpReasoning: 'Personal email and vague timeline suggest non-urgent prospect.',
      recommendedAction: 'Add to monthly newsletter; no active outreach.',
      topics: ['General inquiry'],
      profileSignals: ['No company domain'],
      chatSignals: ['Single generic question'],
      analyzedAt: '2026-03-06T16:30:00Z',
    },
  },
  {
    id: 'LD-1004',
    name: 'Aisha Patel',
    email: 'aisha@retailgroup.co',
    shortMessage: 'Need WhatsApp support for 20 store locations — urgent rollout.',
    status: 'qualified',
    leadType: 'hot',
    assignedTo: 'bdm-3',
    channels: { sms: 6, whatsapp: 22, chat: 11 },
    chats: [
      { id: 'c10', channel: 'whatsapp', role: 'user', content: 'We need to go live in 6 weeks across all stores.', timestamp: '2026-03-08T08:00:00Z' },
      { id: 'c11', channel: 'whatsapp', role: 'bot', content: 'I can outline a phased rollout plan. How many agents per location?', timestamp: '2026-03-08T08:01:00Z' },
      { id: 'c12', channel: 'sms', role: 'user', content: '2-3 agents each. Budget is approved.', timestamp: '2026-03-08T09:30:00Z' },
    ],
    aiAnalysis: {
      leadScore: 91,
      icpFit: 88,
      sentiment: 'positive',
      leadType: 'hot',
      verdict: 'High-priority enterprise opportunity',
      summary: 'Urgent multi-location rollout with approved budget and clear timeline.',
      icpReasoning: 'Retail group with WhatsApp-first strategy matches enterprise ICP.',
      recommendedAction: 'Immediate call with solutions architect; send rollout proposal.',
      topics: ['WhatsApp', 'Retail', 'Multi-location'],
      profileSignals: ['Approved budget', '6-week deadline'],
      chatSignals: ['Urgency language', 'Specific agent count'],
      analyzedAt: '2026-03-08T10:00:00Z',
    },
  },
  {
    id: 'LD-1005',
    name: 'David Kim',
    email: 'david.kim@fintech.dev',
    shortMessage: 'Evaluating RAG chatbot for compliance-heavy customer support.',
    status: 'new',
    leadType: 'warm',
    assignedTo: null,
    channels: { sms: 0, whatsapp: 3, chat: 14 },
    chats: [
      { id: 'c13', channel: 'chat', role: 'user', content: 'Can documents be indexed for regulated FAQ responses?', timestamp: '2026-03-08T12:00:00Z' },
      { id: 'c14', channel: 'chat', role: 'bot', content: 'Yes — PDF ingestion with vector search is supported.', timestamp: '2026-03-08T12:00:40Z' },
    ],
    aiAnalysis: null,
  },
];

export const getLeadInsightSummary = (leads) => {
  const hot = leads.filter((l) => l.leadType === 'hot').length;
  const warm = leads.filter((l) => l.leadType === 'warm').length;
  const cold = leads.filter((l) => l.leadType === 'cold').length;
  const pending = leads.filter((l) => !l.aiAnalysis).length;
  const assigned = leads.filter((l) => l.assignedTo).length;
  const total = leads.length;

  return { hot, warm, cold, pending, assigned, total };
};

export const generateMockAiAnalysis = (lead) => {
  const scoreMap = { hot: 88, warm: 65, cold: 30 };
  const base = scoreMap[lead.leadType] || 50;

  return {
    leadScore: base + Math.floor(Math.random() * 8),
    icpFit: base - 5 + Math.floor(Math.random() * 10),
    sentiment: lead.leadType === 'cold' ? 'neutral' : 'positive',
    leadType: lead.leadType,
    verdict: lead.leadType === 'hot'
      ? 'Strong ICP match — prioritize outreach'
      : lead.leadType === 'warm'
        ? 'Moderate fit — schedule discovery call'
        : 'Low priority — nurture campaign',
    summary: `AI analysis for ${lead.name}: based on ${lead.channels.chat + lead.channels.whatsapp + lead.channels.sms} touchpoints across channels.`,
    icpReasoning: 'Derived from message intent, channel engagement, and profile signals in mock data.',
    recommendedAction: lead.leadType === 'hot'
      ? 'Assign senior BDM and send proposal within 24h.'
      : 'Follow up with tailored case study.',
    topics: ['Product interest', 'Support automation'],
    profileSignals: [`Email: ${lead.email.split('@')[1]}`],
    chatSignals: [`${lead.chats.length} messages analyzed`],
    analyzedAt: new Date().toISOString(),
  };
};
