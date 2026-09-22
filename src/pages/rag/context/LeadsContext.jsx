import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_LEADS, generateMockAiAnalysis } from '../mock/leadsMockData';
import { getRagSessions } from '../../../services/ragAdminService';

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState(MOCK_LEADS);

  useEffect(() => {
    let mounted = true;
    getRagSessions({ limit: 100 }).then(({ data }) => {
      if (!mounted) return;
      const sessions = data?.sessions || [];
      const liveLeads = sessions
        .filter(
          (s) =>
            s.has_lead ||
            s.lead_name ||
            s.visitor_stage === 'QUALIFIED' ||
            s.visitor_stage === 'CONTACT_COLLECTED' ||
            s.lead_status === 'POTENTIAL_LEAD' ||
            s.lead_status === 'LEAD_CREATED'
        )
        .map((s) => ({
          id: s.id,
          name: s.lead_name || `Visitor (${s.id.substring(0, 8)})`,
          email: s.lead_email || '—',
          phone: '—',
          company: s.lead_company || '—',
          shortMessage: s.discussed_services?.length
            ? `Interested in ${s.discussed_services.join(', ')}`
            : s.last_message || `Stage: ${s.visitor_stage}`,
          status: s.lead_status === 'LEAD_CREATED' ? 'contacted' : 'new',
          type: s.visitor_stage === 'QUALIFIED' ? 'hot' : 'warm',
          assignedTo: null,
          channels: { sms: 0, whatsapp: 0, chat: s.message_count || 1 },
          chats: [],
          chatSignals: s.discussed_services || [],
          timestamp: s.created_at,
          visitor_stage: s.visitor_stage,
          lead_status: s.lead_status,
        }));

      if (liveLeads.length > 0) {
        setLeads(liveLeads);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const getLeadById = useCallback(
    (leadId) => leads.find((lead) => lead.id === leadId),
    [leads]
  );

  const assignLead = useCallback((leadId, bdmId) => {
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
    () => ({ leads, getLeadById, assignLead, runAiAnalysis }),
    [leads, getLeadById, assignLead, runAiAnalysis]
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadsProvider');
  return context;
}

export default LeadsContext;
