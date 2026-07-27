import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/?$/, '/');

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: 'Unexpected server response',
    };
  }
};

export const getBlogCategories = async () => {
  const response = await fetch(`${API_BASE_URL}blog-categories`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await parseJson(response);
  return { response, data };
};

export const createBlogCategory = async ({
  name,
  parent_id = '',
  status = 'active',
}) => {
  const response = await fetch(`${API_BASE_URL}blog-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      name,
      parent_id,
      status,
    }),
  });

  const data = await parseJson(response);
  return { response, data };
};

export const updateBlogCategory = async (
  id,
  { name, parent_id = '', status = 'active' }
) => {
  const response = await fetch(`${API_BASE_URL}blog-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      name,
      parent_id,
      status,
    }),
  });

  const data = await parseJson(response);
  return { response, data };
};

export const deleteBlogCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}blog-categories/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      response,
      data: {
        success: response.ok,
        message: response.ok
          ? 'Blog category deleted successfully.'
          : 'Failed to delete blog category',
      },
    };
  }

  const data = await parseJson(response);
  return { response, data };
};

export const mapBlogCategoryFromApi = (category = {}) => ({
  id: category.id ?? null,
  name: category.name || '',
  parent_id: category.parent_id ?? '',
  status: category.status || 'active',
  blogCount:
    category.blog_count ??
    category.blogs_count ??
    category.blogCount ??
    0,
});

export const extractBlogCategoriesList = (apiData) => {
  const payload = apiData?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.blog_categories)) return payload.blog_categories;
  if (Array.isArray(apiData?.categories)) return apiData.categories;
  if (Array.isArray(apiData?.blog_categories)) return apiData.blog_categories;
  if (Array.isArray(apiData)) return apiData;

  return [];
};

export const toBlogCategorySelectOptions = (apiData) =>
  extractBlogCategoriesList(apiData)
    .map(mapBlogCategoryFromApi)
    .filter((category) => category.id != null && category.name)
    .map((category) => ({
      label: category.name,
      value: String(category.id),
    }));
