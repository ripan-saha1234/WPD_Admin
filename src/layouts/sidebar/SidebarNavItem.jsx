import { useNavigate } from 'react-router-dom';

function SidebarNavItem({ item, isActive }) {
  const navigate = useNavigate();
  const className = isActive ? 'sidebar-button-active' : '';

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigate(item.path)}
    >
      <img src={item.icon} alt="" />
      {item.label}
    </button>
  );
}

export default SidebarNavItem;
