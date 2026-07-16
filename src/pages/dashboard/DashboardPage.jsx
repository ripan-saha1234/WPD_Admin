import { useContext, useMemo } from 'react';
import { globalContext } from '../../context/context';
import CommonButton from '../../components/common-button';
import { usePageHeader } from '../../hooks/usePageHeader';
import './DashboardPage.css';

/**
 * Example page — shows how inner pages connect to AppLayout via usePageHeader:
 * - title, breadcrumbs, subTitle, buttons (header actions)
 * - showToast for notifications
 * Add new pages under src/pages/ and register them in src/routes/AppRoutes.jsx
 */
function DashboardPage() {
  const { showToast, user } = useContext(globalContext);

  const breadcrumbs = useMemo(
    () => [{ title: 'Dashboard', link: '/dashboard' }],
    []
  );

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Example Action',
        onClick: () => showToast('Header button clicked', 'success'),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    [showToast]
  );

  usePageHeader({
    title: 'Dashboard',
    breadcrumbs,
    buttons: headerButtons,
  });

  return (
    <div className="dashboard-starter">
      <section className="dashboard-starter-welcome">
        <h3>Welcome{user?.name ? `, ${user.name}` : ''}</h3>
        <p>
          This is your starter admin shell. The sidebar and header come from
          <code> AppLayout </code>
          — each page only fills the content area below.
        </p>
      </section>

      <section className="dashboard-starter-grid">
        <div className="dashboard-starter-card">
          <h4>1. Register routes</h4>
          <p>
            Add pages in <code>src/pages/</code> and wire them in{' '}
            <code>src/routes/AppRoutes.jsx</code>.
          </p>
        </div>
        <div className="dashboard-starter-card">
          <h4>2. Set layout metadata</h4>
          <p>
            Use <code>usePageHeader</code> for title, breadcrumbs, and header
            buttons (see this file).
          </p>
        </div>
        <div className="dashboard-starter-card">
          <h4>3. Reuse components</h4>
          <p>
            Import shared UI from <code>src/components/</code> — tables, dialogs,
            inputs, loaders, etc.
          </p>
        </div>
      </section>

      <section className="dashboard-starter-actions">
        <CommonButton
          text="Show toast"
          onClick={() => showToast('Toast from page content', 'info')}
          backgroundColor="#0690fd"
          color="#FFFFFF"
          borderColor="#0690fd"
        />
      </section>
    </div>
  );
}

export default DashboardPage;
