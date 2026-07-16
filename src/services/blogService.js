import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = 'wpd_blogs';

const DEFAULT_BLOGS = [
  {
    id: 1,
    name: 'Welcome to WPD Blog',
    blog_category_id: 1,
    blog_category: { id: 1, name: 'News' },
    description: '<p>Welcome to the WPD blog.</p>',
    thumbnail_image: '',
    share_facebook: true,
    share_twitter: false,
    share_linkedin: true,
    sections: [],
    created_at: '2026-03-01',
    status: 'Published',
  },
];

function authHeaders() {
  const token = getAuthToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function useApi() {
  return Boolean(API_BASE_URL && String(API_BASE_URL).trim());
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BLOGS));
      return [...DEFAULT_BLOGS];
    }
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_BLOGS];
  }
}

function writeLocal(blogs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: 'Invalid server response' };
  }
}

async function fileToDataUrl(file) {
  if (!file) return '';
  if (typeof file === 'string') return file;
  if (file.url) return file.url;
  const blob = file instanceof File ? file : file.file;
  if (!(blob instanceof Blob)) return '';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Build multipart FormData for create/update blog.
 * Does not set Content-Type (browser sets boundary).
 */
export function buildBlogFormData(formData, { isEdit = false } = {}) {
  const fd = new FormData();

  fd.append('name', formData.name || '');
  fd.append('blog_category_id', String(formData.blog_category_id || ''));
  fd.append('description', formData.description || '');
  fd.append('share_facebook', formData.share_facebook ? 'true' : 'false');
  fd.append('share_twitter', formData.share_twitter ? 'true' : 'false');
  fd.append('share_linkedin', formData.share_linkedin ? 'true' : 'false');

  if (formData.thumbnail_image instanceof File) {
    fd.append('thumbnail_image', formData.thumbnail_image);
  } else if (
    isEdit &&
    typeof formData.thumbnail_image === 'string' &&
    formData.thumbnail_image
  ) {
    fd.append('thumbnail_image', formData.thumbnail_image);
  }

  (formData.sections || []).forEach((section, index) => {
    const { components, data, id } = section;
    const isLocalId = String(id || '').startsWith('new-');

    if (isEdit && id && !isLocalId) {
      fd.append(`sections[${index}][id]`, String(id));
    }

    fd.append(`sections[${index}][order]`, String(index));

    if (components.heading) {
      fd.append(`sections[${index}][heading]`, data.heading || '');
    }
    if (components.description) {
      fd.append(`sections[${index}][description]`, data.description || '');
    }
    if (components.button) {
      fd.append(`sections[${index}][button_name]`, data.buttonName || '');
      fd.append(`sections[${index}][button_url]`, data.buttonUrl || '');
    }
    if (components.image) {
      fd.append(`sections[${index}][position]`, data.imagePosition || 'left');
      if (data.image instanceof File) {
        fd.append(`sections[${index}][image]`, data.image);
      } else if (isEdit && typeof data.image === 'string' && data.image) {
        fd.append(`sections[${index}][image]`, data.image);
      }
    }
    if (components.quote) {
      fd.append(`sections[${index}][quote]`, data.quote || '');
    }
    // FAQs stay frontend-only for now (no backend field in FormData)
  });

  if (isEdit) {
    fd.append('_method', 'PUT');
  }

  return fd;
}

export async function getBlogs() {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
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

export async function getBlogById(id) {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  const blog = readLocal().find((b) => String(b.id) === String(id));
  if (!blog) {
    return {
      response: { ok: false },
      data: { success: false, message: 'Blog not found' },
    };
  }
  return { response: { ok: true }, data: { success: true, data: blog } };
}

export async function createBlog(formState) {
  const body = buildBlogFormData(formState, { isEdit: false });

  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    });
    const data = await parseJson(response);
    return { response, data };
  }

  // Local mock: hydrate from FormData-equivalent form state
  const blogs = readLocal();
  const thumbnail = await fileToDataUrl(formState.thumbnail_image);
  const sections = await Promise.all(
    (formState.sections || []).map(async (section, index) => ({
      id: Date.now() + index,
      heading: section.components.heading ? section.data.heading : '',
      description: section.components.description ? section.data.description : '',
      image: section.components.image
        ? await fileToDataUrl(section.data.image)
        : '',
      position: section.data.imagePosition || 'left',
      order: index,
      button_name: section.components.button ? section.data.buttonName : '',
      button_url: section.components.button ? section.data.buttonUrl : '',
      quote: section.components.quote ? section.data.quote || '' : '',
      faqs: section.components.faq ? section.data.faqs || [] : [],
    }))
  );

  const blog = {
    id: Date.now(),
    name: formState.name,
    blog_category_id: formState.blog_category_id,
    blog_category: { id: formState.blog_category_id, name: formState.categoryName || '' },
    description: formState.description,
    thumbnail_image: thumbnail,
    share_facebook: !!formState.share_facebook,
    share_twitter: !!formState.share_twitter,
    share_linkedin: !!formState.share_linkedin,
    sections,
    created_at: new Date().toISOString().slice(0, 10),
    status: 'Published',
  };

  blogs.unshift(blog);
  writeLocal(blogs);
  return { response: { ok: true }, data: { success: true, data: blog } };
}

export async function updateBlog(id, formState) {
  const body = buildBlogFormData(formState, { isEdit: true });

  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    });
    const data = await parseJson(response);
    return { response, data };
  }

  const blogs = readLocal();
  const index = blogs.findIndex((b) => String(b.id) === String(id));
  if (index === -1) {
    return {
      response: { ok: false },
      data: { success: false, message: 'Blog not found' },
    };
  }

  const thumbnail = await fileToDataUrl(formState.thumbnail_image);
  const sections = await Promise.all(
    (formState.sections || []).map(async (section, order) => {
      const isLocal = String(section.id || '').startsWith('new-');
      return {
        id: isLocal ? Date.now() + order : section.id,
        heading: section.components.heading ? section.data.heading : '',
        description: section.components.description
          ? section.data.description
          : '',
        image: section.components.image
          ? await fileToDataUrl(section.data.image)
          : '',
        position: section.data.imagePosition || 'left',
        order,
        button_name: section.components.button ? section.data.buttonName : '',
        button_url: section.components.button ? section.data.buttonUrl : '',
        quote: section.components.quote ? section.data.quote || '' : '',
        faqs: section.components.faq ? section.data.faqs || [] : [],
      };
    })
  );

  blogs[index] = {
    ...blogs[index],
    name: formState.name,
    blog_category_id: formState.blog_category_id,
    blog_category: {
      id: formState.blog_category_id,
      name: formState.categoryName || blogs[index].blog_category?.name || '',
    },
    description: formState.description,
    thumbnail_image: thumbnail || blogs[index].thumbnail_image,
    share_facebook: !!formState.share_facebook,
    share_twitter: !!formState.share_twitter,
    share_linkedin: !!formState.share_linkedin,
    sections,
  };

  writeLocal(blogs);
  return { response: { ok: true }, data: { success: true, data: blogs[index] } };
}

export async function deleteBlog(id) {
  if (useApi()) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await parseJson(response);
    return { response, data };
  }

  writeLocal(readLocal().filter((b) => String(b.id) !== String(id)));
  return { response: { ok: true }, data: { success: true } };
}

export { useApi };
