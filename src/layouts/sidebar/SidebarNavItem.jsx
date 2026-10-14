import { useNavigate } from 'react-router-dom';
import { ChatbotIcon, CmsIcon, DashboardIcon } from '../../components/ui/icons';

const NAV_ICONS = {
  dashboard: DashboardIcon,
  cms: CmsIcon,
  'rag-admin': ChatbotIcon,
};

function SidebarNavItem({ item, isActive }) {
  const navigate = useNavigate();
  const className = isActive ? 'sidebar-button-active' : '';
  const Icon = NAV_ICONS[item.id];

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate(item.path)}
      title={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="sidebar-item-icon">
        {Icon ? <Icon size={19} /> : <img src={item.icon} alt="" />}
      </span>
      <span className="sidebar-item-label">{item.label}</span>
    </button>
  );
}

export default SidebarNavItem;
