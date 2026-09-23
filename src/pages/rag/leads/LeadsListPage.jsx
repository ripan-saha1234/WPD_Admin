import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../../components/common-button';
import CommonLoader from '../../../components/common-loader';
import { useLeads } from '../context/LeadsContext';
import LeadInsightCards from './components/LeadInsightCards';
import './leads.css';

function formatId(id) {
  if (!id) return '';
  if (id.length <= 12) return id;
  return `${id.substring(0, 8)}...`;
}

function LeadsListPage() {
  const navigate = useNavigate();
  const { leads, loading, refreshLeads } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [crmFilter, setCrmFilter] = useState('all');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (crmFilter !== 'all' && lead.crmSyncStatus !== crmFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (lead.name || '').toLowerCase().includes(q);
        const matchesEmail = (lead.email || '').toLowerCase().includes(q);
        const matchesCompany = (lead.company || '').toLowerCase().includes(q);
        const matchesDesc = (lead.projectDescription || '').toLowerCase().includes(q);
        const matchesService = (lead.interestedServiceName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesDesc && !matchesService) {
          return false;
        }
      }
      return true;
    });
  }, [leads, crmFilter, searchTerm]);

  return (
    <div className="leads-page">
      <section className="leads-intro">
        <h2>Leads &amp; Conversations</h2>
        <p>
          View incoming leads captured by the AI chatbot, review company requirements,
          check CRM webhook sync status, and inspect full session conversation history.
        </p>
      </section>

      <LeadInsightCards leads={leads} />

      <div className="rag-card leads-table-card">
        <div className="rag-panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="rag-panel-title">
            <span>Captured Leads</span>
            <span className="rag-badge-muted">{filteredLeads.length} of {leads.length}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
            <input
              type="text"
              className="rag-filter-select"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '200px', padding: '6px 12px' }}
            />

            <select
              className="rag-filter-select"
              value={crmFilter}
              onChange={(e) => setCrmFilter(e.target.value)}
              style={{ padding: '6px 12px' }}
            >
              <option value="all">All CRM Statuses</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <CommonButton
              text="Refresh"
              onClick={refreshLeads}
              backgroundColor="#fff"
              color="#0690fd"
              borderColor="#0690fd"
            />
          </div>
        </div>

        {loading ? (
          <CommonLoader text="Loading leads..." />
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>No captured leads found matching current criteria.</p>
          </div>
        ) : (
          <div className="rag-table-wrap">
            <table className="rag-table leads-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Project Description</th>
                  <th>Service</th>
                  <th>CRM Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <code title={lead.id}>{formatId(lead.id)}</code>
                    </td>
                    <td className="leads-name-cell">{lead.name}</td>
                    <td>
                      <div>{lead.email}</div>
                      {lead.phone && lead.phone !== '—' && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{lead.phone}</div>
                      )}
                    </td>
                    <td>
                      <strong>{lead.company}</strong>
                    </td>
                    <td
                      className="leads-message-cell"
                      title={lead.projectDescription || lead.shortMessage}
                      style={{ maxWidth: '320px' }}
                    >
                      {lead.projectDescription || lead.shortMessage}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#1e293b' }}>
                        {lead.interestedServiceName}
                      </span>
                    </td>
                    <td>
                      <span className={`leads-crm-badge leads-crm-badge--${lead.crmSyncStatus}`}>
                        {lead.crmSyncStatus === 'synced' && '✓ Synced'}
                        {lead.crmSyncStatus === 'pending' && '⏳ Pending'}
                        {lead.crmSyncStatus === 'failed' && '⚠️ Failed'}
                        {!['synced', 'pending', 'failed'].includes(lead.crmSyncStatus) && lead.crmSyncStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : '—'}
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
        )}
      </div>
    </div>
  );
}

export default LeadsListPage;
