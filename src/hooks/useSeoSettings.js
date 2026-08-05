import { useMemo, useState } from 'react';
import { createEmptySeoSettings } from '../components/seo-settings/SeoSettingsDialog';

/**
 * Shared SEO settings state + header icon button for CMS edit pages.
 */
export function useSeoSettings(initialValue) {
  const [seoSettingsOpen, setSeoSettingsOpen] = useState(false);
  const [seoSettings, setSeoSettings] = useState(
    () => initialValue || createEmptySeoSettings()
  );

  const seoSettingsButton = useMemo(
    () => ({
      type: 'icon',
      img: '/settings-icon.svg',
      onClick: () => setSeoSettingsOpen(true),
    }),
    []
  );

  return {
    seoSettings,
    setSeoSettings,
    seoSettingsOpen,
    setSeoSettingsOpen,
    seoSettingsButton,
  };
}

export default useSeoSettings;
