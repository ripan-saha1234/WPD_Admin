import { getAuthToken } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/?$/, '/');

export const loginAdmin = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: 'Unexpected server response',
    };
  }

  return { response, data };
};

export const logoutAdmin = async (token) => {
  const authToken = token || getAuthToken();

  const response = await fetch(`${API_BASE_URL}auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      token: authToken,
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = { success: true };
  }

  return { response, data };
};
