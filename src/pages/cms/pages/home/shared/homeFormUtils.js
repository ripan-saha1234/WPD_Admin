let idCounter = 0;

export const nextHomeId = (prefix = 'item') =>
  `${prefix}-${Date.now()}-${idCounter++}`;

export const createServiceItem = () => ({
  id: nextHomeId('service'),
  title: '',
  description: '',
  icon: null,
  image: null,
});

export const createWhyIntro = () => ({
  id: nextHomeId('intro'),
  type: 'intro',
  html: '',
});

export const createWhyFeature = () => ({
  id: nextHomeId('feature'),
  type: 'feature',
  icon: null,
  title: '',
  description: '',
});

export const createIndustryItem = () => ({
  id: nextHomeId('industry'),
  title: '',
  image: null,
});

export const createTestimonialItem = () => ({
  id: nextHomeId('testimonial'),
  rating: 5,
  quote: '',
  authorName: '',
  authorRole: '',
});

export const createTechnologyItem = () => ({
  id: nextHomeId('tech'),
  name: '',
  icon: null,
});

export function createEmptyHomeForm() {
  return {
    banner: {
      backgroundImage: null,
      heading: '',
      subheading: '',
      buttonName: '',
      buttonUrl: '',
    },
    services: {
      sectionTitle: 'Our Services',
      items: [createServiceItem()],
    },
    whyChooseUs: {
      sectionTitle: 'Why Choose Us',
      image: null,
      // Intro is a draggable block in the same list as features
      blocks: [createWhyIntro(), createWhyFeature()],
      buttonName: '',
      buttonUrl: '',
    },
    industries: {
      sectionTitle: 'Industries We Serve',
      items: [createIndustryItem()],
    },
    testimonials: {
      sectionTitle: 'Our Testimonials',
      items: [createTestimonialItem()],
    },
    technologies: {
      sectionTitle: 'Technologies We Use',
      items: [createTechnologyItem()],
    },
  };
}

export function reorderList(list, fromIndex, toIndex) {
  if (fromIndex === toIndex) return list;
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Ensures Why Choose Us always has a draggable intro block in `blocks`.
 * Also migrates older { intro, features } shape after HMR / refresh.
 */
export function normalizeWhyChooseUsBlocks(whyChooseUs = {}) {
  const existingBlocks = Array.isArray(whyChooseUs.blocks)
    ? whyChooseUs.blocks
    : null;

  if (existingBlocks?.length) {
    const hasIntro = existingBlocks.some((block) => block.type === 'intro');
    if (hasIntro) return existingBlocks;
    return [createWhyIntro(), ...existingBlocks];
  }

  const legacyFeatures = Array.isArray(whyChooseUs.features)
    ? whyChooseUs.features.map((feature) => ({
        ...createWhyFeature(),
        ...feature,
        type: 'feature',
        id: feature.id || nextHomeId('feature'),
      }))
    : [createWhyFeature()];

  return [
    {
      ...createWhyIntro(),
      html: whyChooseUs.intro || '',
    },
    ...legacyFeatures,
  ];
}

export function validateHomeForm(formData) {
  const errors = {};

  if (!formData.banner.heading?.trim()) {
    errors.bannerHeading = true;
  }

  if (!formData.services.sectionTitle?.trim()) {
    errors.servicesTitle = true;
  }

  return errors;
}
