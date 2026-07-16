export const IMAGE_POSITION_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Center', value: 'center' },
];

export const EMPTY_SECTION_COMPONENTS = {
  heading: false,
  description: false,
  image: false,
  button: false,
  faq: false,
  quote: false,
};

export const createEmptyBlogFaq = () => ({
  id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  heading: '',
  description: '',
  errors: {
    heading: false,
    description: false,
  },
});

export const createEmptyBlogForm = () => ({
  name: '',
  blog_category_id: '',
  thumbnail_image: null,
  description: '',
  share_facebook: false,
  share_twitter: false,
  share_linkedin: false,
  sections: [],
});

export const createSectionFromComponents = (components) => ({
  id: `new-${Date.now()}`,
  components: { ...EMPTY_SECTION_COMPONENTS, ...components },
  data: {
    heading: '',
    description: '',
    image: '',
    buttonName: '',
    buttonUrl: '',
    imagePosition: 'left',
    quote: '',
    faqs: components.faq ? [createEmptyBlogFaq()] : [],
  },
});

export function isEditorEmpty(html) {
  if (!html) return true;
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = (temp.textContent || temp.innerText || '')
    .replace(/\u00a0/g, ' ')
    .trim();
  if (text.length > 0) return false;

  const normalized = String(html)
    .replace(/&nbsp;/gi, '')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    .trim();

  return normalized.length === 0;
}

/** Map API blog → form state (Add/Edit shared shape) */
export function mapApiBlogToForm(blog) {
  const sections = (blog.sections || []).map((sec) => {
    const faqs = Array.isArray(sec.faqs) ? sec.faqs : [];
    return {
      id: sec.id,
      components: {
        heading: !!sec.heading,
        description: !!sec.description,
        image: !!sec.image,
        button: !!(sec.button_name || sec.button_url),
        faq: faqs.length > 0,
        quote: !!sec.quote,
      },
      data: {
        heading: sec.heading || '',
        description: sec.description || '',
        image: sec.image || '',
        buttonName: sec.button_name || '',
        buttonUrl: sec.button_url || '',
        imagePosition: sec.position || 'left',
        quote: sec.quote || '',
        faqs:
          faqs.length > 0
            ? faqs.map((faq, i) => ({
                id: faq.id || `faq-${sec.id}-${i}`,
                heading: faq.heading || '',
                description: faq.description || '',
                errors: { heading: false, description: false },
              }))
            : [],
      },
    };
  });

  return {
    name: blog.name || '',
    blog_category_id: blog.blog_category_id || blog.blog_category?.id || '',
    thumbnail_image: blog.thumbnail_image || null,
    description: blog.description || '',
    share_facebook: !!blog.share_facebook,
    share_twitter: !!blog.share_twitter,
    share_linkedin: !!blog.share_linkedin,
    sections,
  };
}

export function validateBlogForm(formData, { requireThumbnail = true } = {}) {
  const errors = {};

  if (!formData.name?.trim()) errors.name = true;
  if (!formData.blog_category_id) errors.blog_category_id = true;
  if (requireThumbnail && !formData.thumbnail_image) {
    errors.thumbnail_image = true;
  }
  if (isEditorEmpty(formData.description)) errors.description = true;

  return errors;
}
