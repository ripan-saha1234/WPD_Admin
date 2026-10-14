import { Outlet } from 'react-router-dom';
import { useCallback, useContext, useState } from 'react';
import Sidebar from '../sidebar';
import { globalContext } from '../../context/context';
import LayoutHeader from './LayoutHeader';
import LayoutToast from './LayoutToast';
import './AppLayout.css';

const COLLAPSE_KEY = 'wpd-admin-sidebar-collapsed';

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function AppLayout() {
  const { buttonList } = useContext(globalContext);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const contentClassName = buttonList.length > 0
    ? 'common-layout-content common-layout-content--with-actions'
    : 'common-layout-content';

  return (
    <>
      <LayoutToast />
      <div className={`common-layout-container${collapsed ? ' is-collapsed' : ''}`}>
        <aside className="common-layout-sidebar">
          <Sidebar collapsed={collapsed} />
        </aside>
        <div className="common-layout-content-container">
          <LayoutHeader onToggleSidebar={toggleSidebar} sidebarCollapsed={collapsed} />
          <main className={contentClassName}>
            <div className="common-layout-content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default AppLayout;
