import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import Sidebar from '../sidebar';
import { globalContext } from '../../context/context';
import LayoutHeader from './LayoutHeader';
import LayoutToast from './LayoutToast';
import './AppLayout.css';

function AppLayout() {
  const { buttonList } = useContext(globalContext);
  const contentClassName = buttonList.length > 0
    ? 'common-layout-content common-layout-content--with-actions'
    : 'common-layout-content';

  return (
    <>
      <LayoutToast />
      <div className="common-layout-container">
        <aside className="common-layout-sidebar">
          <Sidebar />
        </aside>
        <div className="common-layout-content-container">
          <LayoutHeader />
          <main className={contentClassName}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default AppLayout;
