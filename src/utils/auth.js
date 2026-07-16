export const AUTH_TOKEN_KEY = 'Wpd_admin_token';
export const AUTH_USER_KEY = 'wpd_admin_user';

/** Static login until backend auth API is ready */
export const STATIC_CREDENTIALS = {
  email: 'admin@wpd.com',
  password: 'admin123',
};

export const STATIC_AUTH_USER = {
  id: 1,
  name: 'Wpd Admin',
  first_name: 'Wpd',
  last_name: 'Admin',
  email: STATIC_CREDENTIALS.email,
  phone: '',
  image: '/avatar.svg',
  roles: ['admin'],
};

export const STATIC_AUTH_TOKEN = 'wpd-static-dev-token';

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

    return typeof token === 'string' ? token : null;
  } catch (error) {
    console.log('Error getting token:', error);
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
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const mapUserFromApi = (userData) => ({
  id: userData.id || null,
  name: userData.name || '',
  firstName: userData.first_name || '',
  lastName: userData.last_name || '',
  phone: userData.phone || '',
  email: userData.email || '',
  image: userData.image || '/avatar.svg',
  roles: userData.roles || [],
});
