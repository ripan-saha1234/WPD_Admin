import { getAuthHeader } from '../utils/auth';
import {
  createEmptyHomeForm,
  createIndustryItem,
  createServiceItem,
  createTechnologyItem,
  createTestimonialItem,
  normalizeWhyChooseUsBlocks,
  nextHomeId,
} from '../pages/cms/pages/home/shared/homeFormUtils';
import { createEmptySeoSettings } from '../components/seo-settings/SeoSettingsDialog';

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

const appendValue = (formData, key, value) => {
  formData.append(key, value == null ? '' : String(value));
};

const appendImage = (formData, key, value, fallbackName = 'image.jpg') => {
  const { file, url } = getFileOrUrl(value);
  if (file) {
    formData.append(key, file, file.name || fallbackName);
    return;
  }
  formData.append(key, url || '');
};

const toApiId = (id) => (id != null && id !== '' ? String(id) : undefined);

export const extractHomePageDetail = (apiData) => {
  const payload = apiData?.data;

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.page && typeof payload.page === 'object') return payload.page;
    return payload;
  }

  if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
    return apiData;
  }

  return null;
};

export const mapHomeFormFromApi = (data = {}) => {
  const empty = createEmptyHomeForm();

  const mapServiceItem = (item = {}) => ({
    id: item.id != null ? String(item.id) : nextHomeId('service'),
    title: item.title || '',
    description: item.description || '',
    icon: item.icon || null,
    image: item.image || null,
  });

  const mapIndustryItem = (item = {}) => ({
    id: item.id != null ? String(item.id) : nextHomeId('industry'),
    title: item.title || '',
    image: item.image || null,
  });

  const mapTestimonialItem = (item = {}) => ({
    id: item.id != null ? String(item.id) : nextHomeId('testimonial'),
    rating: Number(item.rating) || 5,
    quote: item.quote || '',
    authorName: item.author_name || item.authorName || '',
    authorRole: item.author_role || item.authorRole || '',
  });

  const mapTechnologyItem = (item = {}) => ({
    id: item.id != null ? String(item.id) : nextHomeId('tech'),
    name: item.name || '',
    icon: item.icon || null,
  });

  const whySource = data.why_choose_us || data.whyChooseUs || {};
  const blocks = (whySource.blocks || []).map((block) => {
    if (block.type === 'intro') {
      return {
        id: block.id != null ? String(block.id) : nextHomeId('intro'),
        type: 'intro',
        html: block.html || '',
      };
    }

    return {
      id: block.id != null ? String(block.id) : nextHomeId('feature'),
      type: 'feature',
      icon: block.icon || null,
      title: block.title || '',
      description: block.description || '',
    };
  });

  const whyChooseUs = {
    sectionTitle:
      whySource.section_title || whySource.sectionTitle || empty.whyChooseUs.sectionTitle,
    image: whySource.image || null,
    buttonName: whySource.button_name || whySource.buttonName || '',
    buttonUrl: whySource.button_url || whySource.buttonUrl || '',
    blocks: normalizeWhyChooseUsBlocks({
      ...whySource,
      blocks: blocks.length ? blocks : undefined,
    }),
  };

  const seoSource = data.seo || {};
  const relatedKeyphrases = (seoSource.related_keyphrases ||
    seoSource.relatedKeyphrases ||
    [])
    .map((item, index) => ({
      id:
        item?.id != null
          ? String(item.id)
          : `keyphrase-${Date.now()}-${index}`,
      text: item?.text || item?.keyphrase || '',
    }))
    .filter((item) => item.text);

  return {
    status: data.status || 'draft',
    formData: {
      banner: {
        backgroundImage:
          data.banner?.background_image || data.banner?.backgroundImage || null,
        heading: data.banner?.heading || '',
        subheading: data.banner?.subheading || '',
        buttonName: data.banner?.button_name || data.banner?.buttonName || '',
        buttonUrl: data.banner?.button_url || data.banner?.buttonUrl || '',
      },
      services: {
        sectionTitle:
          data.services?.section_title ||
          data.services?.sectionTitle ||
          empty.services.sectionTitle,
        items: (data.services?.items || []).length
          ? data.services.items.map(mapServiceItem)
          : [createServiceItem()],
      },
      whyChooseUs,
      industries: {
        sectionTitle:
          data.industries?.section_title ||
          data.industries?.sectionTitle ||
          empty.industries.sectionTitle,
        items: (data.industries?.items || []).length
          ? data.industries.items.map(mapIndustryItem)
          : [createIndustryItem()],
      },
      testimonials: {
        sectionTitle:
          data.testimonials?.section_title ||
          data.testimonials?.sectionTitle ||
          empty.testimonials.sectionTitle,
        items: (data.testimonials?.items || []).length
          ? data.testimonials.items.map(mapTestimonialItem)
          : [createTestimonialItem()],
      },
      technologies: {
        sectionTitle:
          data.technologies?.section_title ||
          data.technologies?.sectionTitle ||
          empty.technologies.sectionTitle,
        items: (data.technologies?.items || []).length
          ? data.technologies.items.map(mapTechnologyItem)
          : [createTechnologyItem()],
      },
    },
    seo: {
      metaTitle: seoSource.meta_title || seoSource.metaTitle || '',
      metaDescription:
        seoSource.meta_description || seoSource.metaDescription || '',
      relatedKeyphrases: relatedKeyphrases.length
        ? relatedKeyphrases
        : createEmptySeoSettings().relatedKeyphrases,
    },
  };
};

const buildImageFieldForJson = (value) => {
  const { file, url } = getFileOrUrl(value);
  if (file) return '';
  return url || '';
};

export const buildHomePageFormData = ({
  formData,
  seo = createEmptySeoSettings(),
  status = 'draft',
}) => {
  const body = new FormData();

  appendValue(body, 'status', status || 'draft');

  // Banner
  appendValue(body, 'banner[heading]', formData.banner?.heading?.trim() || '');
  appendValue(body, 'banner[subheading]', formData.banner?.subheading || '');
  appendValue(body, 'banner[button_name]', formData.banner?.buttonName || '');
  appendValue(body, 'banner[button_url]', formData.banner?.buttonUrl || '');
  appendImage(
    body,
    'banner[background_image]',
    formData.banner?.backgroundImage,
    'banner-background.jpg'
  );

  // Services
  appendValue(body, 'services[section_title]', formData.services?.sectionTitle || '');
  (formData.services?.items || []).forEach((item, index) => {
    const id = toApiId(item.id);
    if (id) appendValue(body, `services[items][${index}][id]`, id);
    appendValue(body, `services[items][${index}][title]`, item.title || '');
    appendValue(
      body,
      `services[items][${index}][description]`,
      item.description || ''
    );
    appendValue(body, `services[items][${index}][sort_order]`, String(index));
    appendImage(
      body,
      `services[items][${index}][icon]`,
      item.icon,
      'service-icon.jpg'
    );
    appendImage(
      body,
      `services[items][${index}][image]`,
      item.image,
      'service-image.jpg'
    );
  });

  // Why Choose Us
  appendValue(
    body,
    'why_choose_us[section_title]',
    formData.whyChooseUs?.sectionTitle || ''
  );
  appendValue(
    body,
    'why_choose_us[button_name]',
    formData.whyChooseUs?.buttonName || ''
  );
  appendValue(
    body,
    'why_choose_us[button_url]',
    formData.whyChooseUs?.buttonUrl || ''
  );
  appendImage(
    body,
    'why_choose_us[image]',
    formData.whyChooseUs?.image,
    'why-choose-us.jpg'
  );

  (formData.whyChooseUs?.blocks || []).forEach((block, index) => {
    const id = toApiId(block.id);
    if (id) appendValue(body, `why_choose_us[blocks][${index}][id]`, id);
    appendValue(body, `why_choose_us[blocks][${index}][type]`, block.type || '');
    appendValue(
      body,
      `why_choose_us[blocks][${index}][sort_order]`,
      String(index)
    );

    if (block.type === 'intro') {
      appendValue(body, `why_choose_us[blocks][${index}][html]`, block.html || '');
      appendValue(body, `why_choose_us[blocks][${index}][title]`, '');
      appendValue(body, `why_choose_us[blocks][${index}][description]`, '');
      appendValue(body, `why_choose_us[blocks][${index}][icon]`, '');
    } else {
      appendValue(body, `why_choose_us[blocks][${index}][html]`, '');
      appendValue(
        body,
        `why_choose_us[blocks][${index}][title]`,
        block.title || ''
      );
      appendValue(
        body,
        `why_choose_us[blocks][${index}][description]`,
        block.description || ''
      );
      appendImage(
        body,
        `why_choose_us[blocks][${index}][icon]`,
        block.icon,
        'why-feature-icon.jpg'
      );
    }
  });

  // Industries
  appendValue(
    body,
    'industries[section_title]',
    formData.industries?.sectionTitle || ''
  );
  (formData.industries?.items || []).forEach((item, index) => {
    const id = toApiId(item.id);
    if (id) appendValue(body, `industries[items][${index}][id]`, id);
    appendValue(body, `industries[items][${index}][title]`, item.title || '');
    appendValue(body, `industries[items][${index}][sort_order]`, String(index));
    appendImage(
      body,
      `industries[items][${index}][image]`,
      item.image,
      'industry-image.jpg'
    );
  });

  // Testimonials
  appendValue(
    body,
    'testimonials[section_title]',
    formData.testimonials?.sectionTitle || ''
  );
  (formData.testimonials?.items || []).forEach((item, index) => {
    const id = toApiId(item.id);
    if (id) appendValue(body, `testimonials[items][${index}][id]`, id);
    appendValue(
      body,
      `testimonials[items][${index}][rating]`,
      String(Number(item.rating) || 5)
    );
    appendValue(body, `testimonials[items][${index}][quote]`, item.quote || '');
    appendValue(
      body,
      `testimonials[items][${index}][author_name]`,
      item.authorName || ''
    );
    appendValue(
      body,
      `testimonials[items][${index}][author_role]`,
      item.authorRole || ''
    );
    appendValue(
      body,
      `testimonials[items][${index}][sort_order]`,
      String(index)
    );
  });

  // Technologies
  appendValue(
    body,
    'technologies[section_title]',
    formData.technologies?.sectionTitle || ''
  );
  (formData.technologies?.items || []).forEach((item, index) => {
    const id = toApiId(item.id);
    if (id) appendValue(body, `technologies[items][${index}][id]`, id);
    appendValue(body, `technologies[items][${index}][name]`, item.name || '');
    appendValue(
      body,
      `technologies[items][${index}][sort_order]`,
      String(index)
    );
    appendImage(
      body,
      `technologies[items][${index}][icon]`,
      item.icon,
      'technology-icon.jpg'
    );
  });

  // SEO
  appendValue(body, 'seo[meta_title]', seo.metaTitle || '');
  appendValue(body, 'seo[meta_description]', seo.metaDescription || '');

  const relatedKeyphrases = (seo.relatedKeyphrases || [])
    .map((item) => {
      const text = (item?.text || item?.keyphrase || '').trim();
      if (!text) return null;
      return {
        id: toApiId(item.id),
        text,
        keyphrase: text,
      };
    })
    .filter(Boolean);

  relatedKeyphrases.forEach((item, index) => {
    if (item.id) {
      appendValue(body, `seo[related_keyphrases][${index}][id]`, item.id);
    }
    appendValue(body, `seo[related_keyphrases][${index}][text]`, item.text);
    appendValue(
      body,
      `seo[related_keyphrases][${index}][keyphrase]`,
      item.keyphrase
    );
  });

  // JSON fallback for non-file fields (same pattern as blogs sections_json)
  const payload = {
    status: status || 'draft',
    banner: {
      heading: formData.banner?.heading?.trim() || '',
      subheading: formData.banner?.subheading || '',
      button_name: formData.banner?.buttonName || '',
      button_url: formData.banner?.buttonUrl || '',
      background_image: buildImageFieldForJson(formData.banner?.backgroundImage),
    },
    services: {
      section_title: formData.services?.sectionTitle || '',
      items: (formData.services?.items || []).map((item, index) => ({
        id: toApiId(item.id),
        title: item.title || '',
        description: item.description || '',
        sort_order: index,
        icon: buildImageFieldForJson(item.icon),
        image: buildImageFieldForJson(item.image),
      })),
    },
    why_choose_us: {
      section_title: formData.whyChooseUs?.sectionTitle || '',
      button_name: formData.whyChooseUs?.buttonName || '',
      button_url: formData.whyChooseUs?.buttonUrl || '',
      image: buildImageFieldForJson(formData.whyChooseUs?.image),
      blocks: (formData.whyChooseUs?.blocks || []).map((block, index) => {
        if (block.type === 'intro') {
          return {
            id: toApiId(block.id),
            type: 'intro',
            html: block.html || '',
            icon: '',
            title: '',
            description: '',
            sort_order: index,
          };
        }
        return {
          id: toApiId(block.id),
          type: 'feature',
          html: '',
          icon: buildImageFieldForJson(block.icon),
          title: block.title || '',
          description: block.description || '',
          sort_order: index,
        };
      }),
    },
    industries: {
      section_title: formData.industries?.sectionTitle || '',
      items: (formData.industries?.items || []).map((item, index) => ({
        id: toApiId(item.id),
        title: item.title || '',
        sort_order: index,
        image: buildImageFieldForJson(item.image),
      })),
    },
    testimonials: {
      section_title: formData.testimonials?.sectionTitle || '',
      items: (formData.testimonials?.items || []).map((item, index) => ({
        id: toApiId(item.id),
        rating: Number(item.rating) || 5,
        quote: item.quote || '',
        author_name: item.authorName || '',
        author_role: item.authorRole || '',
        sort_order: index,
      })),
    },
    technologies: {
      section_title: formData.technologies?.sectionTitle || '',
      items: (formData.technologies?.items || []).map((item, index) => ({
        id: toApiId(item.id),
        name: item.name || '',
        sort_order: index,
        icon: buildImageFieldForJson(item.icon),
      })),
    },
    seo: {
      meta_title: seo.metaTitle || '',
      meta_description: seo.metaDescription || '',
      related_keyphrases: relatedKeyphrases,
    },
  };

  body.append('payload', JSON.stringify(payload));

  return body;
};

/** @deprecated Use buildHomePageFormData — kept as alias for callers */
export const buildHomePagePayload = buildHomePageFormData;

export const getHomePage = async () => {
  const response = await fetch(`${API_BASE_URL}pages/home`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await parseJson(response);
  return { response, data };
};

export const saveHomePage = async ({ formData, seo, status = 'draft' }) => {
  const body = buildHomePageFormData({ formData, seo, status });

  const response = await fetch(`${API_BASE_URL}pages/home`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
      // Do not set Content-Type — browser sets multipart boundary
    },
    body,
  });

  const data = await parseJson(response);
  return { response, data, body };
};
