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

const extractFile = (value) => {
  if (!value) return null;
  if (value instanceof File || value instanceof Blob) return value;
  if (value?.file instanceof File || value?.file instanceof Blob) return value.file;
  return null;
};

const getFileOrUrl = (value) => {
  const file = extractFile(value);
  if (file) return { file, url: '' };
  if (typeof value === 'string') return { file: null, url: value };
  if (value?.url) return { file: null, url: value.url };
  return { file: null, url: '' };
};

const formatBlogDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-US');
};

const buildElementDataForJson = (type, data = {}) => {
  switch (type) {
    case 'heading':
      return {
        level: data.level || 'h1',
        text: data.text || '',
      };
    case 'description':
      return {
        html: data.html || '',
      };
    case 'image':
      return {
        image: typeof data.image === 'string' ? data.image : data.image?.url || '',
        caption: data.caption || '',
      };
    case 'table':
      return {
        columns: data.columns || [],
        rows: data.rows || [],
      };
    case 'faq':
      return {
        items: data.items || [],
      };
    case 'button':
      return {
        name: data.name || '',
        url: data.url || '',
      };
    default:
      return data || {};
  }
};

const appendBoolean = (formData, key, value) => {
  formData.append(key, value ? 'true' : 'false');
};

const buildCreateBlogFormData = ({
  name,
  blog_category_id,
  featureImage = null,
  share = {},
  excerpt = '',
  status = 'draft',
  published_at = null,
  sections = [],
  seo = null,
}) => {
  const formData = new FormData();

  formData.append('name', name?.trim() || '');
  formData.append('blog_category_id', String(Number(blog_category_id) || 0));
  formData.append('excerpt', excerpt || '');
  formData.append('status', status || 'draft');

  if (published_at) {
    formData.append('published_at', published_at);
  }

  appendBoolean(formData, 'share_facebook', Boolean(share.facebook));
  appendBoolean(formData, 'share_twitter', Boolean(share.twitter));
  appendBoolean(formData, 'share_linkedin', Boolean(share.linkedin));

  if (seo) {
    formData.append('meta_title', seo.metaTitle || '');
    formData.append('meta_description', seo.metaDescription || '');
    const keyphrases = (seo.relatedKeyphrases || [])
      .map((item) => (typeof item === 'string' ? item : item?.text || ''))
      .map((text) => text.trim())
      .filter(Boolean);
    formData.append('related_keyphrases', JSON.stringify(keyphrases));
    keyphrases.forEach((text, index) => {
      formData.append(`related_keyphrases[${index}]`, text);
    });
  }

  const feature = getFileOrUrl(featureImage);
  if (feature.file) {
    formData.append('feature_image', feature.file, feature.file.name || 'feature-image.jpg');
  } else if (feature.url) {
    formData.append('feature_image', feature.url);
  }

  const sectionsPayload = (sections || []).map((section, sectionIndex) => ({
    id: String(section.id),
    order: sectionIndex,
    elements: (section.elements || []).map((element, elementIndex) => {
      const base = {
        id: String(element.id),
        type: element.type,
        order: elementIndex,
        data: buildElementDataForJson(element.type, element.data),
      };

      if (element.type === 'image') {
        const imageValue = getFileOrUrl(element.data?.image);
        if (imageValue.file) {
          formData.append(
            `sections[${sectionIndex}][elements][${elementIndex}][data][image]`,
            imageValue.file,
            imageValue.file.name || 'section-image.jpg'
          );
          base.data.image = '';
        }
      }

      return base;
    }),
  }));

  // Nested FormData fields (Laravel-friendly) + JSON fallback
  sectionsPayload.forEach((section, sectionIndex) => {
    formData.append(`sections[${sectionIndex}][order]`, String(section.order));
    formData.append(`sections[${sectionIndex}][id]`, section.id);

    section.elements.forEach((element, elementIndex) => {
      formData.append(
        `sections[${sectionIndex}][elements][${elementIndex}][id]`,
        element.id
      );
      formData.append(
        `sections[${sectionIndex}][elements][${elementIndex}][type]`,
        element.type
      );
      formData.append(
        `sections[${sectionIndex}][elements][${elementIndex}][order]`,
        String(element.order)
      );

      if (element.type === 'table' || element.type === 'faq') {
        formData.append(
          `sections[${sectionIndex}][elements][${elementIndex}][data]`,
          JSON.stringify(element.data)
        );
        return;
      }

      Object.entries(element.data || {}).forEach(([key, value]) => {
        if (key === 'image' && value === '') return;
        formData.append(
          `sections[${sectionIndex}][elements][${elementIndex}][data][${key}]`,
          value == null ? '' : String(value)
        );
      });
    });
  });

  formData.append('sections_json', JSON.stringify(sectionsPayload));

  return formData;
};

export const extractBlogsList = (apiData) => {
  const payload = apiData?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  if (Array.isArray(apiData?.blogs)) return apiData.blogs;
  if (Array.isArray(apiData)) return apiData;

  return [];
};

export const mapBlogCardFromApi = (blog = {}) => {
  const category =
    blog.category ||
    blog.blog_category?.name ||
    blog.blogCategory?.name ||
    blog.category_name ||
    '';

  const publishedAt = blog.published_at || blog.created_at || blog.date || null;

  return {
    id: blog.id ?? null,
    title: blog.name || blog.title || '',
    category,
    date: blog.date || formatBlogDate(publishedAt),
    excerpt: blog.excerpt || blog.short_description || '',
    thumbnail: blog.feature_image || blog.thumbnail || blog.image || '',
  };
};

export const getBlogs = async () => {
  const response = await fetch(`${API_BASE_URL}blogs`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await parseJson(response);
  return { response, data };
};

const parseElementData = (data) => {
  if (data == null) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return typeof data === 'object' ? data : {};
};

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));

export const mapBlogFormFromApi = (blog = {}) => {
  const categoryId =
    blog.blog_category_id ??
    blog.blogCategoryId ??
    blog.blog_category?.id ??
    blog.category_id ??
    '';

  const sections = sortByOrder(blog.sections || blog.blog_sections || []).map(
    (section) => ({
      id: section.id != null ? String(section.id) : `new-${Date.now()}`,
      collapsed: false,
      elements: sortByOrder(section.elements || section.blog_elements || []).map(
        (element) => ({
          id: element.id != null ? String(element.id) : `element-${Date.now()}`,
          type: element.type || 'heading',
          data: parseElementData(element.data),
        })
      ),
    })
  );

  return {
    id: blog.id ?? null,
    formData: {
      name: blog.name || blog.title || '',
      category: categoryId !== '' && categoryId != null ? String(categoryId) : '',
      featureImage: blog.feature_image || blog.thumbnail || blog.image || null,
      share: {
        facebook: Boolean(
          blog.share_facebook ?? blog.share?.facebook ?? true
        ),
        twitter: Boolean(blog.share_twitter ?? blog.share?.twitter ?? true),
        linkedin: Boolean(
          blog.share_linkedin ?? blog.share?.linkedin ?? false
        ),
      },
    },
    excerpt: blog.excerpt || '',
    status: blog.status || 'draft',
    published_at: blog.published_at || null,
    sections,
    seo: {
      metaTitle: blog.meta_title || blog.seo?.meta_title || blog.seo?.metaTitle || '',
      metaDescription:
        blog.meta_description ||
        blog.seo?.meta_description ||
        blog.seo?.metaDescription ||
        '',
      relatedKeyphrases: (
        blog.related_keyphrases ||
        blog.seo?.related_keyphrases ||
        blog.seo?.relatedKeyphrases ||
        []
      )
        .map((item, index) => ({
          id: item?.id != null ? String(item.id) : `keyphrase-${index}`,
          text: typeof item === 'string' ? item : item?.text || item?.keyphrase || '',
        }))
        .filter((item) => item.text),
    },
  };
};

export const extractBlogDetail = (apiData) => {
  const payload = apiData?.data;

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.blog && typeof payload.blog === 'object') return payload.blog;
    return payload;
  }

  if (apiData && typeof apiData === 'object' && apiData.id != null) {
    return apiData;
  }

  return null;
};

export const getBlogById = async (id) => {
  const response = await fetch(`${API_BASE_URL}blogs/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await parseJson(response);
  return { response, data };
};

export const createBlog = async (formPayload) => {
  const body = buildCreateBlogFormData(formPayload);

  const response = await fetch(`${API_BASE_URL}blogs`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
      // Do not set Content-Type — browser sets multipart boundary
    },
    body,
  });

  const data = await parseJson(response);
  return { response, data };
};

export const updateBlog = async (id, formPayload) => {
  const body = buildCreateBlogFormData(formPayload);

  // Backend only registers POST for /blogs/{id} (not PUT).
  // Do not send _method=PUT — Laravel spoofing would convert it to PUT and fail.
  const response = await fetch(`${API_BASE_URL}blogs/${id}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
      // Do not set Content-Type — browser sets multipart boundary
    },
    body,
  });

  const data = await parseJson(response);
  return { response, data };
};

export const deleteBlog = async (id) => {
  const response = await fetch(`${API_BASE_URL}blogs/${id}`, {
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
          ? 'Blog deleted successfully.'
          : 'Failed to delete blog',
      },
    };
  }

  const data = await parseJson(response);
  return { response, data };
};
