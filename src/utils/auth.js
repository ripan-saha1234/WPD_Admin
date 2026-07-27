export const AUTH_TOKEN_KEY = 'wpd_admin_token';
export const AUTH_USER_KEY = 'wpd_admin_user';

export const getAuthToken = () => {
  try {
    const tokenItem = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!tokenItem) return null;

    let token;
    try {
      token = JSON.parse(tokenItem);
    } catch {
      token = tokenItem;
    }

    return typeof token === 'string' && token.trim() ? token : null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  if (!token) {
    throw new Error('Auth token is required');
  }

  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || {}));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getAuthHeader = () => {
  const token = getAuthToken();
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const mapUserFromApi = (userData = {}) => ({
  id: userData.id || null,
  name: userData.name || '',
  firstName: userData.first_name || '',
  lastName: userData.last_name || '',
  phone: userData.phone || '',
  email: userData.email || '',
  image: userData.image || '/avatar.svg',
  roles: Array.isArray(userData.roles) ? userData.roles : [],
});
