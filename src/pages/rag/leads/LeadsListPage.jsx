import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../../components/common-button';
import { globalContext } from '../../../context/context';
import { useLeads } from '../context/LeadsContext';
import { BDM_OPTIONS, LEAD_STATUS_OPTIONS } from '../mock/leadsMockData';
import LeadInsightCards from './components/LeadInsightCards';
import AssignLeadModal from './components/AssignLeadModal';
import LeadBadge from '../components/LeadBadge';
import './leads.css';

function LeadsListPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(globalContext);
  const { leads, assignLead } = useLeads();
  const [assignTarget, setAssignTarget] = useState(null);

  const getBdmName = (bdmId) =>
    BDM_OPTIONS.find((b) => b.id === bdmId)?.name || '—';

  const getStatusLabel = (status) =>
    LEAD_STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

  const handleAssign = (leadId, bdmId) => {
    assignLead(leadId, bdmId);
    const bdmName = getBdmName(bdmId);
    showToast?.(`Lead assigned to ${bdmName}`, 'success');
  };

  return (
    <div className="leads-page">
      <section className="leads-intro">
        <h2>Leads &amp; Conversations</h2>
        <p>
          Manage incoming leads from chat, SMS, and WhatsApp. Assign to a BDM or
          open a lead to view full conversation history and run AI analysis.
        </p>
      </section>

      <LeadInsightCards leads={leads} />

      <div className="rag-card leads-table-card">
        <div className="rag-panel-header">
          <div className="rag-panel-title">
            <span>All Leads</span>
            <span className="rag-badge-muted">{leads.length} total</span>
          </div>
        </div>

        <div className="rag-table-wrap">
          <table className="rag-table leads-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Type</th>
                <th>Assign To</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><code>{lead.id}</code></td>
                  <td className="leads-name-cell">{lead.name}</td>
                  <td>{lead.email}</td>
                  <td className="leads-message-cell" title={lead.shortMessage}>
                    {lead.shortMessage}
                  </td>
                  <td>
                    <span className={`leads-status-badge leads-status-badge--${lead.status}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td><LeadBadge type={lead.leadType} /></td>
                  <td>
                    {lead.assignedTo ? (
                      <button
                        type="button"
                        className="leads-link-btn"
                        onClick={() => setAssignTarget(lead)}
                      >
                        {getBdmName(lead.assignedTo)}
                      </button>
                    ) : (
                      <CommonButton
                        text="Assign"
                        onClick={() => setAssignTarget(lead)}
                        backgroundColor="#fff"
                        color="#0690fd"
                        borderColor="#0690fd"
                      />
                    )}
                  </td>
                  <td>
                    <CommonButton
                      text="View"
                      onClick={() => navigate(`/rag/conversations/${lead.id}`)}
                      backgroundColor="#0690fd"
                      color="#fff"
                      borderColor="#0690fd"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignLeadModal
        open={Boolean(assignTarget)}
        lead={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
      />
    </div>
  );
}

export default LeadsListPage;
