import { getAuthToken } from '../utils/auth';

const RAG_API_BASE_URL = (
  import.meta.env.VITE_RAG_API_BASE_URL || 'http://localhost:8000'
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

export const formatSessionId = (id) => {
  if (!id || id.length < 12) return id || '';
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
};

export const buildSessionQueryParams = ({
  page = 1,
  limit = 25,
  search = '',
  stage = '',
  status = '',
  lead_status = '',
  filter = 'all',
  leadType = '',
} = {}) => {
  const offset = (Math.max(1, page) - 1) * limit;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const finalLeadStatus = lead_status || (leadType && leadType !== 'all' ? leadType : '');
  const finalStage = stage || (filter && filter !== 'all' ? filter : '');

  if (finalLeadStatus && finalLeadStatus !== 'all') {
    params.set('lead_status', finalLeadStatus);
  }
  if (finalStage && finalStage !== 'all') {
    params.set('stage', finalStage);
  }
  if (status && status !== 'all') {
    params.set('status', status);
  }
  if (search) {
    params.set('search', search);
  }

  return params;
};

const ragFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${RAG_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await parseJson(response);
  return { response, data };
};

// ─── Leads ───────────────────────────────────────────────────────────────────

export const getRagLeads = async (queryParams) => {
  let queryStr = '';
  if (queryParams instanceof URLSearchParams) {
    queryStr = queryParams.toString();
  } else if (typeof queryParams === 'string') {
    queryStr = queryParams;
  } else if (queryParams && typeof queryParams === 'object') {
    queryStr = new URLSearchParams(
      Object.entries(queryParams).filter(([_, v]) => v != null && v !== '')
    ).toString();
  }

  const { response, data } = await ragFetch(
    queryStr ? `/admin/leads?${queryStr}` : '/admin/leads'
  );

  if (!response.ok) return { response, data };

  const rawItems = data?.data?.items || data?.items || [];
  const total = data?.data?.total ?? rawItems.length;

  return {
    response,
    data: {
      items: rawItems,
      total,
      limit: data?.data?.limit || 50,
      offset: data?.data?.offset || 0,
    },
  };
};

export const getRagLead = async (leadId) => {
  const { response, data } = await ragFetch(`/admin/leads/${leadId}`);
  if (!response.ok) return { response, data };
  return { response, data: data?.data || data };
};

export const updateRagLead = async (leadId, payload) => {
  const { response, data } = await ragFetch(`/admin/leads/${leadId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return { response, data: data?.data || data };
};

// ─── Sessions & Conversation History ─────────────────────────────────────────


export const getRagStats = async () => {
  const { response, data } = await ragFetch('/admin/sessions?limit=200');
  if (!response.ok) return { response, data };

  const items = data?.data?.items || data?.items || [];
  const total = data?.data?.total ?? items.length;
  const qualified = items.filter(
    (s) => s.visitor_stage === 'QUALIFIED' || s.lead_status === 'POTENTIAL_LEAD'
  ).length;
  const leadsCount = items.filter(
    (s) => s.has_lead || s.lead_status === 'LEAD_CREATED'
  ).length;
  const activeCount = items.filter((s) => s.status === 'active').length;

  return {
    response,
    data: {
      totalSessions: total,
      activeSessions: activeCount,
      qualifiedSessions: qualified,
      totalLeads: leadsCount,
      avgMessages:
        items.length > 0
          ? Math.round(
              items.reduce((acc, curr) => acc + (curr.message_count || 0), 0) /
                items.length
            )
          : 0,
    },
  };
};

export const getRagSessions = async (queryParams) => {
  let queryStr = '';
  if (queryParams instanceof URLSearchParams) {
    queryStr = queryParams.toString();
  } else if (typeof queryParams === 'string') {
    queryStr = queryParams;
  } else if (queryParams && typeof queryParams === 'object') {
    queryStr = new URLSearchParams(queryParams).toString();
  }

  const { response, data } = await ragFetch(
    queryStr ? `/admin/sessions?${queryStr}` : '/admin/sessions'
  );


  if (!response.ok) return { response, data };

  const rawItems = data?.data?.items || data?.items || [];
  const total = data?.data?.total ?? rawItems.length;

  // Normalize session items for WPD_Admin UI
  const sessions = rawItems.map((item) => ({
    id: item.id,
    status: item.status || 'active',
    visitor_stage: item.visitor_stage || 'EXPLORER',
    lead_type: item.lead_status || 'UNKNOWN',
    lead_status: item.lead_status || 'UNKNOWN',
    sentiment: item.visitor_stage === 'QUALIFIED' ? 'positive' : 'neutral',
    message_count: item.message_count ?? 0,
    survey_answers_count: item.initial_question_id ? 1 : 0,
    lead_score:
      item.lead_status === 'LEAD_CREATED'
        ? 100
        : item.visitor_stage === 'QUALIFIED'
        ? 85
        : item.visitor_stage === 'REQUIREMENT_DISCOVERY'
        ? 60
        : item.visitor_stage === 'INTERESTED'
        ? 40
        : 15,
    has_lead: Boolean(item.has_lead),
    lead_name: item.lead_name,
    lead_email: item.lead_email,
    lead_company: item.lead_company,
    discussed_services: item.discussed_services || [],
    created_at: item.created_at,
    last_active_at: item.ended_at || item.created_at,
    last_message: item.discussed_services?.length
      ? `Discussing ${item.discussed_services.join(', ')}`
      : `Visitor Stage: ${item.visitor_stage}`,
  }));

  return {
    response,
    data: {
      sessions,
      total,
      limit: data?.data?.limit || 25,
      offset: data?.data?.offset || 0,
    },
  };
};

export const getRagSession = async (sessionId) => {
  const { response, data } = await ragFetch(`/admin/sessions/${sessionId}`);
  if (!response.ok) return { response, data };

  const sessionData = data?.data || data;
  const rawMsgs = sessionData?.messages || [];

  const messages = rawMsgs.map((m) => ({
    id: m.id,
    role: m.role === 'visitor' || m.role === 'user' ? 'user' : 'bot',
    content: m.content || '',
    rag_sources: m.rag_sources || [],
    detected_intent: m.detected_intent || null,
    discussed_service_name: m.discussed_service_name || null,
    timestamp: m.created_at,
  }));

  return {
    response,
    data: {
      session: {
        id: sessionData.id,
        status: sessionData.status,
        visitor_stage: sessionData.visitor_stage,
        lead_status: sessionData.lead_status,
        initial_question_id: sessionData.initial_question_id,
        initial_question_text: sessionData.initial_question_text,
        initial_response: sessionData.initial_response,
        consent_flags: sessionData.consent_flags || {},
        analytics_metadata: sessionData.analytics_metadata || {},
        created_at: sessionData.created_at,
        ended_at: sessionData.ended_at,
        lead: sessionData.lead,
        discussed_services: sessionData.discussed_services || [],
      },
      messages,
      lead: sessionData.lead,
    },
  };
};

export const deleteRagSession = (sessionId) =>
  ragFetch(`/chat/session/${sessionId}/end`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

export const analyzeRagSession = async (sessionId) => {
  const { response, data } = await getRagSession(sessionId);
  if (!response.ok) return { response, data };

  const s = data.session;
  return {
    response,
    data: {
      insights: {
        stage: s.visitor_stage,
        leadStatus: s.lead_status,
        services: s.discussed_services,
        summary: `Session progressed to stage ${s.visitor_stage} with lead status ${s.lead_status}. Services discussed: ${
          s.discussed_services.length ? s.discussed_services.join(', ') : 'General discovery'
        }.`,
      },
    },
  };
};

// ─── Opening Questions (Question Sets) ───────────────────────────────────────

export const getRagQuestions = async () => {
  const { response, data } = await ragFetch('/admin/opening-questions?all=true');
  if (!response.ok) return { response, data };

  const raw = data?.data || data || [];
  const normalized = raw.map((q, idx) => ({
    id: q.id,
    question_text: q.question_text,
    question_type: 'mcq',
    options: (q.options || []).map((o) => o.option_text || o.label || String(o)),
    is_active: Boolean(q.enabled),
    order: idx + 1,
    created_at: q.created_at,
  }));

  return { response, data: normalized };
};

export const createRagQuestion = async (payload) => {
  const rawOptions = payload.options || [];
  const options = rawOptions.map((opt) =>
    typeof opt === 'string' ? opt : opt.label || opt.text || String(opt)
  );

  const body = {
    question_text: payload.question_text,
    enabled: payload.is_active ?? payload.enabled ?? true,
    options,
  };

  const { response, data } = await ragFetch('/admin/opening-questions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return { response, data: data?.data || data };
};

export const updateRagQuestion = async (id, payload) => {
  const options = payload.options
    ? payload.options.map((opt) =>
        typeof opt === 'string' ? opt : opt.label || opt.text || String(opt)
      )
    : undefined;

  const body = {
    question_text: payload.question_text,
    enabled: payload.is_active ?? payload.enabled,
    ...(options ? { options } : {}),
  };

  const { response, data } = await ragFetch(`/admin/opening-questions/${id}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return { response, data: data?.data || data };
};

export const deleteRagQuestion = (id) =>
  ragFetch(`/admin/opening-questions/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const reorderRagQuestions = async (orderedIds) => {
  return { response: { ok: true }, data: { success: true } };
};

// ─── Survey Analytics ────────────────────────────────────────────────────────

export const getRagSurveyAnalytics = async () => {
  const { response, data } = await getRagQuestions();
  if (!response.ok) return { response, data };

  const questions = Array.isArray(data) ? data : [];
  const analytics = questions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    total_answers: 0,
    option_distribution: q.options.map((opt) => ({
      option: opt,
      count: 0,
      percentage: 0,
    })),
  }));

  return { response, data: analytics };
};

// ─── Knowledge Base Documents ────────────────────────────────────────────────

export const getRagDocuments = async () => {
  const { response, data } = await ragFetch('/admin/documents?limit=200');
  if (!response.ok) return { response, data };

  const chunks = data?.data || data || [];

  // Group chunks by source_title
  const groups = new Map();
  for (const chunk of chunks) {
    const title = chunk.source_title || 'Untitled Document';
    if (!groups.has(title)) {
      groups.set(title, {
        fileName: title,
        source: title,
        chunks: 0,
        origin: 'upload',
        created_at: chunk.created_at,
        doc_type: chunk.doc_type || 'markdown',
      });
    }
    groups.get(title).chunks += 1;
  }

  const documents = Array.from(groups.values());

  return {
    response,
    data: {
      documents,
      totalDocuments: documents.length,
      totalChunks: chunks.length,
    },
  };
};

export const uploadRagDocument = async (file) => {
  if (!file) {
    return {
      response: { ok: false },
      data: { error: 'No file provided' },
    };
  }

  let content = '';
  try {
    content = await file.text();
  } catch (err) {
    return {
      response: { ok: false },
      data: { error: `Could not read file text: ${err.message}` },
    };
  }

  const payload = {
    title: file.name,
    content: content || `# ${file.name}\n\nUploaded document content.`,
    visibility: 'public',
    replace_existing: true,
  };

  const { response, data } = await ragFetch('/admin/documents/ingest', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { response, data };
  }

  const ingestData = data?.data || data;
  return {
    response,
    data: {
      fileName: file.name,
      chunks: ingestData.total_chunks || 1,
    },
  };
};

export const deleteRagDocument = (sourceTitle) =>
  ragFetch(`/admin/documents/by-title/${encodeURIComponent(sourceTitle)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const getRagInsightsOverview = () =>
  ragFetch('/admin/sessions?limit=50', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

// ─── Hook Messages ────────────────────────────────────────────────────────────

export const getHookMessages = async () => {
  const { response, data } = await ragFetch('/admin/hook-messages?all=true');
  if (!response.ok) return { response, data };

  const raw = data?.data || data || [];
  const normalized = raw.map((item, idx) => ({
    id: item.id,
    message_text: item.text || item.message_text,
    is_active: Boolean(item.enabled ?? item.is_active ?? true),
    display_frequency: item.display_frequency || 1,
    order: idx + 1,
    created_at: item.created_at,
  }));

  return { response, data: normalized };
};

export const createHookMessage = async (payload) => {
  const body = {
    text: payload.text || payload.message_text,
    enabled: payload.is_active ?? payload.enabled ?? true,
    display_frequency: Math.max(5, Number(payload.display_frequency) || 30),
  };

  const { response, data } = await ragFetch('/admin/hook-messages', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return { response, data: data?.data || data };
};

export const updateHookMessage = async (id, payload) => {
  const body = {
    ...(payload.text || payload.message_text
      ? { text: payload.text || payload.message_text }
      : {}),
    ...(payload.is_active !== undefined || payload.enabled !== undefined
      ? { enabled: payload.is_active ?? payload.enabled }
      : {}),
    ...(payload.display_frequency
      ? { display_frequency: Math.max(5, Number(payload.display_frequency)) }
      : {}),
  };

  const { response, data } = await ragFetch(`/admin/hook-messages/${id}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return { response, data: data?.data || data };
};


export const deleteHookMessage = (id) =>
  ragFetch(`/admin/hook-messages/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

export const reorderHookMessages = async (orderedIds) => {
  return { response: { ok: true }, data: { success: true } };
};

// ─── Service Catalog & Price History ─────────────────────────────────────────

export const getServices = async (all = true) => {
  const { response, data } = await ragFetch(`/admin/services?all=${all}`);
  if (!response.ok) return { response, data };
  return { response, data: data?.data || data || [] };
};

export const getService = async (serviceId) => {
  const { response, data } = await ragFetch(`/admin/services/${serviceId}`);
  if (!response.ok) return { response, data };
  return { response, data: data?.data || data };
};

export const createService = async (payload) => {
  const { response, data } = await ragFetch('/admin/services', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return { response, data: data?.data || data };
};

export const updateService = async (serviceId, payload) => {
  const { response, data } = await ragFetch(`/admin/services/${serviceId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return { response, data: data?.data || data };
};

export const getServicePriceHistory = async (serviceId) => {
  const { response, data } = await ragFetch(
    `/admin/services/${serviceId}/price-history`
  );
  if (!response.ok) return { response, data };
  return { response, data: data?.data || data || [] };
};

export const deleteService = (serviceId) =>
  ragFetch(`/admin/services/${serviceId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

// ─── Tracked Pages (Compatibility) ──────────────────────────────────────────


export const getTrackedPages = async () => {
  return { response: { ok: true }, data: [] };
};

export const createTrackedPage = async (payload) => {
  return { response: { ok: true }, data: payload };
};

export const updateTrackedPage = async (id, payload) => {
  return { response: { ok: true }, data: payload };
};

export const deleteTrackedPage = async (id) => {
  return { response: { ok: true }, data: { success: true } };
};

export const testFetchTrackedPage = async (id) => {
  return { response: { ok: true }, data: { success: true } };
};

export const refreshAllTrackedPages = async () => {
  return { response: { ok: true }, data: { success: true } };
};

