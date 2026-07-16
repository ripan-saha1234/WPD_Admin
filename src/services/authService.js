import {
  STATIC_AUTH_TOKEN,
  STATIC_AUTH_USER,
  STATIC_CREDENTIALS,
} from '../utils/auth';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginAdmin = async ({ email, password }) => {
  // --- API auth (enable when backend is ready) ---
  // const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json',
  //   },
  //   body: JSON.stringify({ email, password }),
  // });
  // const data = await response.json();
  // return { response, data };

  await new Promise((resolve) => setTimeout(resolve, 400));

  const isValid =
    email === STATIC_CREDENTIALS.email &&
    password === STATIC_CREDENTIALS.password;

  if (isValid) {
    return {
      response: { ok: true },
      data: {
        success: true,
        data: {
          token: STATIC_AUTH_TOKEN,
          user: STATIC_AUTH_USER,
        },
      },
    };
  }

  return {
    response: { ok: false },
    data: {
      success: false,
      message: 'Invalid email or password',
    },
  };
};

export const logoutAdmin = async (_token) => {
  // --- API auth (enable when backend is ready) ---
  // const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json',
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({}),
  // });
  // const data = await response.json();
  // return { response, data };

  return {
    response: { ok: true },
    data: { success: true },
  };
};
