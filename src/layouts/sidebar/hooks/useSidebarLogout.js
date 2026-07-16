import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../../utils/auth';
// import { logoutAdmin } from '../../../services/authService';
// import { getAuthToken } from '../../../utils/auth';

export function useSidebarLogout() {
  const navigate = useNavigate();

  return useCallback(async () => {
    // API logout — enable when backend is ready
    // const token = getAuthToken();
    // try {
    //   if (token) await logoutAdmin(token);
    // } catch (error) {
    //   console.log('Logout API error:', error);
    // }

    clearAuthSession();
    navigate('/auth');
  }, [navigate]);
}
