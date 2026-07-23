import { useContext, useMemo, useRef, useState } from 'react';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import {
  createEmptyHomeForm,
  validateHomeForm,
} from './shared/homeFormUtils';
import BannerSection from './sections/BannerSection';
import ServicesSection from './sections/ServicesSection';
import WhyChooseUsSection from './sections/WhyChooseUsSection';
import IndustriesSection from './sections/IndustriesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import TechnologiesSection from './sections/TechnologiesSection';
import './HomePageCms.css';

function HomePageCms() {
  const { showToast } = useContext(globalContext);
  const [formData, setFormData] = useState(createEmptyHomeForm);
  const [errors, setErrors] = useState({});

  const updateSection = (sectionKey, sectionData) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: sectionData }));
  };

  const handleSave = () => {
    const nextErrors = validateHomeForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast('Please fill all the mandatory fields', 'error');
      return;
    }

    // API integration later — payload shape matches formData
    showToast('Home page saved', 'success');
  };

  const saveRef = useRef(handleSave);
  saveRef.current = handleSave;

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms' },
      { title: 'Home', link: '/cms/pages/home' },
    ],
    []
  );

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Save',
        onClick: () => saveRef.current(),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    []
  );

  usePageHeader({
    title: 'Home',
    breadcrumbs,
    buttons: headerButtons,
  });

  return (
    <div className="home-page-cms">
      <BannerSection
        data={formData.banner}
        errors={errors}
        onChange={(data) => updateSection('banner', data)}
      />
      <ServicesSection
        data={formData.services}
        onChange={(data) => updateSection('services', data)}
      />
      <WhyChooseUsSection
        data={formData.whyChooseUs}
        onChange={(data) => updateSection('whyChooseUs', data)}
      />
      <IndustriesSection
        data={formData.industries}
        onChange={(data) => updateSection('industries', data)}
      />
      <TestimonialsSection
        data={formData.testimonials}
        onChange={(data) => updateSection('testimonials', data)}
      />
      <TechnologiesSection
        data={formData.technologies}
        onChange={(data) => updateSection('technologies', data)}
      />
    </div>
  );
}

export default HomePageCms;
