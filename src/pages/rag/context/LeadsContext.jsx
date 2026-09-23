import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { generateMockAiAnalysis } from '../mock/leadsMockData';
import { getRagLeads, getRagLead, updateRagLead } from '../../../services/ragAdminService';

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [assignments, setAssignments] = useState({});

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getRagLeads({ limit: 100 });
      if (response?.ok && data?.items) {
        const normalized = data.items.map((item) => ({
          id: item.id,
          sessionId: item.session_id,
          name: item.name || `Visitor (${item.id.substring(0, 8)})`,
          email: item.email || '—',
          phone: item.phone || '—',
          company: item.company || '—',
          projectDescription: item.project_description || '',
          shortMessage:
            item.project_description ||
            (item.interested_service_name
              ? `Interested in ${item.interested_service_name}`
              : 'Discovery conversation'),
          interestedServiceName: item.interested_service_name || '—',
          crmSyncStatus: item.crm_sync_status || 'pending',
          status: item.crm_sync_status === 'synced' ? 'contacted' : 'new',
          leadType: item.visitor_stage === 'CONTACT_COLLECTED' ? 'hot' : 'warm',
          assignedTo: assignments[item.id] || null,
          channels: { sms: 0, whatsapp: 0, chat: item.message_count || 1 },
          chats: [],
          timestamp: item.created_at,
          visitor_stage: item.visitor_stage,
          session_status: item.session_status,
          message_count: item.message_count || 0,
        }));
        setLeads(normalized);
        setTotal(data.total ?? normalized.length);
      }
    } catch (err) {
      console.error('Failed to load leads from RAG API:', err);
    } finally {
      setLoading(false);
    }
  }, [assignments]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const getLeadById = useCallback(
    (leadId) => leads.find((lead) => lead.id === leadId),
    [leads]
  );

  const fetchLeadWithMessages = useCallback(async (leadId) => {
    try {
      const { response, data } = await getRagLead(leadId);
      if (response?.ok && data?.lead) {
        const l = data.lead;
        const messages = (data.messages || []).map((m) => ({
          id: m.id,
          role: m.role === 'visitor' || m.role === 'user' ? 'user' : 'bot',
          channel: 'chat',
          content: m.content || '',
          rag_sources: m.rag_sources || [],
          detected_intent: m.detected_intent || null,
          discussed_service_name: m.discussed_service_name || null,
          timestamp: m.created_at,
        }));

        const detailedLead = {
          id: l.id,
          sessionId: l.session_id,
          name: l.name || `Visitor (${l.id.substring(0, 8)})`,
          email: l.email || '—',
          phone: l.phone || '—',
          company: l.company || '—',
          projectDescription: l.project_description || '',
          shortMessage:
            l.project_description ||
            (l.interested_service_name
              ? `Interested in ${l.interested_service_name}`
              : 'Discovery conversation'),
          interestedServiceName: l.interested_service_name || '—',
          crmSyncStatus: l.crm_sync_status || 'pending',
          status: l.crm_sync_status === 'synced' ? 'contacted' : 'new',
          leadType: l.visitor_stage === 'CONTACT_COLLECTED' ? 'hot' : 'warm',
          assignedTo: assignments[l.id] || null,
          channels: { sms: 0, whatsapp: 0, chat: messages.length || l.message_count || 1 },
          chats: messages,
          discussedServices: data.discussed_services || [],
          timestamp: l.created_at,
          visitor_stage: l.visitor_stage,
          message_count: messages.length,
        };

        // Cache into leads list
        setLeads((prev) =>
          prev.map((item) => (item.id === leadId ? { ...item, ...detailedLead } : item))
        );

        return detailedLead;
      }
    } catch (err) {
      console.error(`Failed to fetch lead ${leadId} detail:`, err);
    }
    return null;
  }, [assignments]);

  const assignLead = useCallback((leadId, bdmId) => {
    setAssignments((prev) => ({ ...prev, [leadId]: bdmId }));
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, assignedTo: bdmId, status: 'assigned' }
          : lead
      )
    );
  }, []);

  const runAiAnalysis = useCallback((leadId) => {
    let analysis = null;
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        analysis = lead.aiAnalysis || generateMockAiAnalysis(lead);
        return { ...lead, aiAnalysis: analysis };
      })
    );
    return analysis;
  }, []);

  const value = useMemo(
    () => ({
      leads,
      loading,
      total,
      refreshLeads: loadLeads,
      getLeadById,
      fetchLeadWithMessages,
      assignLead,
      runAiAnalysis,
    }),
    [leads, loading, total, loadLeads, getLeadById, fetchLeadWithMessages, assignLead, runAiAnalysis]
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadsProvider');
  return context;
}

export default LeadsContext;
