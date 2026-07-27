import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getAuthToken } from '../../../utils/auth';
import { logoutAdmin } from '../../../services/authService';

export function useSidebarLogout() {
  const navigate = useNavigate();

  return useCallback(async () => {
    const token = getAuthToken();

    try {
      if (token) {
        await logoutAdmin(token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }

    clearAuthSession();
    navigate('/auth');
  }, [navigate]);
}
