import { useCallback, useContext, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { globalContext } from '../../context/context';
import { usePageHeader } from '../../hooks/usePageHeader';
import { RagAdminProvider, useRagAdmin } from './context/RagAdminContext';
import { LeadsProvider, useLeads } from './context/LeadsContext';
import { getSectionByPath } from './ragSections';
import './RagAdminPage.css';

function RagAdminLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useRagAdmin();
  const { getLeadById } = useLeads();

  const pathParts = location.pathname.replace(/^\/rag\/?/, '').split('/').filter(Boolean);
  const isHub = pathParts.length === 0;
  const sectionPath = pathParts[0] || '';
  const leadId = pathParts[1] || '';
  const activeSection = sectionPath ? getSectionByPath(sectionPath) : null;
  const lead = leadId ? getLeadById(leadId) : null;

  const breadcrumbs = useMemo(() => {
    const items = [
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Chatbot Admin', link: '/rag' },
    ];
    if (activeSection) {
      items.push({
        title: activeSection.label,
        link: `/rag/${activeSection.path}`,
      });
    }
    if (leadId && sectionPath === 'conversations') {
      items.push({
        title: lead?.name || leadId,
        link: `/rag/conversations/${leadId}`,
      });
    }
    return items;
  }, [activeSection, leadId, sectionPath, lead]);

  const handleBack = useCallback(() => {
    if (leadId) {
      navigate('/rag/conversations');
      return;
    }
    navigate('/rag');
  }, [navigate, leadId]);

  const headerButtons = useMemo(() => {
    const buttons = [];
    if (!isHub) {
      buttons.push({
        type: 'button',
        text: leadId ? 'Back to Leads' : 'Back to Hub',
        onClick: handleBack,
        backgroundColor: '#fff',
        textColor: '#0d0d0d',
        borderColor: '#e8e8e8',
      });
    }
    buttons.push({
      type: 'button',
      text: 'Refresh',
      onClick: refresh,
      backgroundColor: '#0690fd',
      textColor: '#FFFFFF',
      borderColor: '#0690fd',
    });
    return buttons;
  }, [isHub, leadId, handleBack, refresh]);

  const pageTitle = lead
    ? lead.name
    : activeSection
      ? activeSection.label
      : 'Chatbot Admin';

  usePageHeader({
    title: pageTitle,
    breadcrumbs,
    buttons: headerButtons,
  });

  return (
    <div className="rag-admin-page">
      <Outlet />
    </div>
  );
}

function RagAdminLayout() {
  const { showToast } = useContext(globalContext);

  return (
    <RagAdminProvider showToast={showToast}>
      <LeadsProvider>
        <RagAdminLayoutInner />
      </LeadsProvider>
    </RagAdminProvider>
  );
}

export default RagAdminLayout;
