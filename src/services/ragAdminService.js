const RAG_API_BASE_URL = (
  import.meta.env.VITE_RAG_API_BASE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return { error: 'Unexpected server response' };
  }
};

export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const buildSessionQueryParams = ({
  page = 1,
  limit = 25,
  search = '',
  filter = 'all',
  leadType = '',
  sentiment = '',
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    filter,
  });
  if (leadType) params.set('lead_type', leadType);
  if (sentiment) params.set('sentiment', sentiment);
  return params;
};

const ragFetch = async (path, options = {}) => {
  const response = await fetch(`${RAG_API_BASE_URL}${path}`, options);
  const data = await parseJson(response);
  return { response, data };
};

export const getRagStats = () =>
  ragFetch('/api/admin/stats', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const getRagSessions = (queryParams) =>
  ragFetch(`/api/admin/sessions?${queryParams.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const getRagSession = (sessionId) =>
  ragFetch(`/api/admin/sessions/${sessionId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const deleteRagSession = (sessionId) =>
  ragFetch(`/api/admin/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const analyzeRagSession = (sessionId) =>
  ragFetch(`/api/admin/sessions/${sessionId}/insights/analyze`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

export const getRagQuestions = () =>
  ragFetch('/api/admin/questions', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const createRagQuestion = (payload) =>
  ragFetch('/api/admin/questions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const updateRagQuestion = (id, payload) =>
  ragFetch(`/api/admin/questions/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const deleteRagQuestion = (id) =>
  ragFetch(`/api/admin/questions/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const reorderRagQuestions = (orderedIds) =>
  ragFetch('/api/admin/questions/reorder', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderedIds }),
  });

export const getRagSurveyAnalytics = () =>
  ragFetch('/api/admin/survey-analytics', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const getRagDocuments = () =>
  ragFetch('/api/admin/documents', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const uploadRagDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return ragFetch('/api/admin/documents/upload', {
    method: 'POST',
    body: formData,
  });
};

export const deleteRagDocument = (source) =>
  ragFetch(`/api/admin/documents?source=${encodeURIComponent(source)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const getRagInsightsOverview = () =>
  ragFetch('/api/admin/insights/overview', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

export const formatSessionId = (id) => {
  if (!id || id.length < 12) return id || '';
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
};
