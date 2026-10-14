import { useContext } from 'react';
import Breadcrums from '../../components/breadcrums';
import { globalContext } from '../../context/context';
import { PanelLeftIcon } from '../../components/ui/icons';
import ThemeToggle from '../../components/ui/ThemeToggle';
import HeaderActions from './HeaderActions';

function LayoutHeader({ onToggleSidebar, sidebarCollapsed }) {
  const { pageTitle, user, buttonList, subTitle } = useContext(globalContext);
  const { text, textColor, backgroundColor } = subTitle;
  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin';

  return (
    <>
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button
            type="button"
            className="app-icon-button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeftIcon size={18} />
          </button>
          <span className="app-topbar-divider" aria-hidden="true" />
          <Breadcrums />
        </div>
        <div className="app-topbar-right">
          <ThemeToggle />
          <span className="app-topbar-divider" aria-hidden="true" />
          <div className="app-user-chip">
            <div className="app-user-avatar">
              <img src={user.image || '/avatar.svg'} alt={displayName} />
            </div>
            <div className="app-user-meta">
              <span className="app-user-name">{displayName}</span>
              {user?.email && <span className="app-user-email">{user.email}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="common-layout-header">
        <div className="common-layout-header-title-container">
          <h2>
            {pageTitle}
            {text && (
              <span
                className="common-layout-header-title-container-sub-title"
                style={{ color: textColor, backgroundColor }}
              >
                {text}
              </span>
            )}
          </h2>
        </div>
        <HeaderActions items={buttonList} />
      </div>
    </>
  );
}

export default LayoutHeader;
