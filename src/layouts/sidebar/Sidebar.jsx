import { SIDEBAR_BRAND, SIDEBAR_NAV_ITEMS } from './navConfig';
import { useActiveNav } from './hooks/useActiveNav';
import { useSidebarLogout } from './hooks/useSidebarLogout';
import SidebarNavItem from './SidebarNavItem';
import SidebarLogout from './SidebarLogout';
import './Sidebar.css';

function Sidebar() {
  const activeId = useActiveNav(SIDEBAR_NAV_ITEMS);
  const handleLogout = useSidebarLogout();

  return (
    <aside className="sidebar">
      <img
        src={SIDEBAR_BRAND.logo}
        alt={SIDEBAR_BRAND.alt}
        className="sidebar-logo"
      />
      <nav className="sidebar-nav">
        <div className="sidebar-menu">
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeId === item.id}
            />
          ))}
        </div>
        <SidebarLogout onLogout={handleLogout} />
      </nav>
    </aside>
  );
}

export default Sidebar;
