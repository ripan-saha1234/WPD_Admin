import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import { useSeoSettings } from '../../../../hooks/useSeoSettings';
import CommonLoader from '../../../../components/common-loader';
import SeoSettingsDialog from '../../../../components/seo-settings/SeoSettingsDialog';
import {
  extractHomePageDetail,
  getHomePage,
  mapHomeFormFromApi,
  saveHomePage,
} from '../../../../services/homePageService';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageStatus, setPageStatus] = useState('draft');
  const {
    seoSettings,
    setSeoSettings,
    seoSettingsOpen,
    setSeoSettingsOpen,
    seoSettingsButton,
  } = useSeoSettings();

  const loadHomePage = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await getHomePage();

      if (!response.ok || data.success === false) {
        if (response.status !== 404) {
          showToast(data.message || 'Failed to load home page', 'error');
        }
        return;
      }

      const detail = extractHomePageDetail(data);
      if (!detail) return;

      const mapped = mapHomeFormFromApi(detail);
      setFormData(mapped.formData);
      setSeoSettings(mapped.seo);
      setPageStatus(mapped.status || 'draft');
    } catch (error) {
      console.error('Load home page error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [setSeoSettings, showToast]);

  useEffect(() => {
    loadHomePage();
  }, [loadHomePage]);

  const updateSection = (sectionKey, sectionData) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: sectionData }));
  };

  const handleSave = async () => {
    if (saving) return;

    const nextErrors = validateHomeForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast('Please fill all the mandatory fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const { response, data } = await saveHomePage({
        formData,
        seo: seoSettings,
        status: pageStatus,
      });

      if (!response.ok || data.success === false) {
        showToast(data.message || 'Failed to save home page', 'error');
        return;
      }

      showToast(data.message || 'Home page saved', 'success');

      const detail = extractHomePageDetail(data);
      if (detail) {
        const mapped = mapHomeFormFromApi(detail);
        setFormData(mapped.formData);
        setSeoSettings(mapped.seo);
        setPageStatus(mapped.status || pageStatus);
      } else {
        await loadHomePage();
      }
    } catch (error) {
      console.error('Save home page error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
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
        ...seoSettingsButton,
        disabled: saving || loading,
      },
      {
        type: 'button',
        text: saving ? 'Saving...' : 'Save',
        onClick: () => saveRef.current(),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
        disabled: saving || loading,
      },
    ],
    [loading, saving, seoSettingsButton]
  );

  usePageHeader({
    title: 'Home',
    breadcrumbs,
    buttons: headerButtons,
  });

  if (loading) {
    return <CommonLoader text="Loading home page..." />;
  }

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

      <SeoSettingsDialog
        open={seoSettingsOpen}
        setOpen={setSeoSettingsOpen}
        value={seoSettings}
        onSave={setSeoSettings}
      />
    </div>
  );
}

export default HomePageCms;
