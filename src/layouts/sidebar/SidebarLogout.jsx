import { LOGOUT_ITEM } from './navConfig';

function SidebarLogout({ onLogout }) {
  return (
    <button
      type="button"
      className="sidebar-button-logout"
      onClick={onLogout}
    >
      <img src={LOGOUT_ITEM.icon} alt="" />
      {LOGOUT_ITEM.label}
    </button>
  );
}

export default SidebarLogout;
