import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MOCK_LEADS, generateMockAiAnalysis } from '../mock/leadsMockData';

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState(MOCK_LEADS);

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
