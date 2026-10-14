import { LOGOUT_ITEM } from './navConfig';
import { LogoutIcon } from '../../components/ui/icons';

function SidebarLogout({ onLogout }) {
  return (
    <button
      type="button"
      className="sidebar-button-logout"
      onClick={onLogout}
      title={LOGOUT_ITEM.label}
    >
      <span className="sidebar-item-icon">
        <LogoutIcon size={19} />
      </span>
      <span className="sidebar-item-label">{LOGOUT_ITEM.label}</span>
    </button>
  );
}

export default SidebarLogout;
