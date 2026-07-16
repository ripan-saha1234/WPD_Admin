import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = 'wpd_blog_categories';

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'News',
    slug: 'news',
    description: 'Company and industry news',
    status: 'Active',
    created_at: '2026-01-10',
  },
  {
    id: 2,
    name: 'Guides',
    slug: 'guides',
    description: 'How-to guides and tutorials',
    status: 'Active',
    created_at: '2026-02-05',
  },
];

function authHeaders(json = false) {
  const token = getAuthToken();
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

function useApi() {
  return Boolean(API_BASE_URL && String(API_BASE_URL).trim());
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return [...DEFAULT_CATEGORIES];
    }
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

function writeLocal(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: 'Invalid server response' };
  }
}

export async function getBlogCategories() {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blog-categories`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  return {
    response: { ok: true },
    data: { success: true, data: readLocal() },
  };
}

export async function createBlogCategory(payload) {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blog-categories`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  const categories = readLocal();
  const name = payload.name?.trim();
  if (!name) {
    return {
      response: { ok: false },
      data: { success: false, message: 'Category name is required' },
    };
  }

  const category = {
    id: Date.now(),
    name,
    slug: slugify(name),
    description: payload.description?.trim() || '',
    status: payload.status || 'Active',
    created_at: new Date().toISOString().slice(0, 10),
  };
  categories.unshift(category);
  writeLocal(categories);
  return { response: { ok: true }, data: { success: true, data: category } };
}

export async function updateBlogCategory(id, payload) {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blog-categories/${id}`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  const categories = readLocal();
  const index = categories.findIndex((c) => String(c.id) === String(id));
  if (index === -1) {
    return {
      response: { ok: false },
      data: { success: false, message: 'Category not found' },
    };
  }

  categories[index] = {
    ...categories[index],
    name: payload.name?.trim() ?? categories[index].name,
    slug: payload.name ? slugify(payload.name) : categories[index].slug,
    description: payload.description?.trim() ?? categories[index].description,
    status: payload.status ?? categories[index].status,
  };
  writeLocal(categories);
  return {
    response: { ok: true },
    data: { success: true, data: categories[index] },
  };
}

export async function deleteBlogCategory(id) {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blog-categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  writeLocal(readLocal().filter((c) => String(c.id) !== String(id)));
  return { response: { ok: true }, data: { success: true } };
}
