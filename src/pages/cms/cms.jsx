import { useMemo } from 'react';
import { usePageHeader } from '../../hooks/usePageHeader';
import SiteSettings from './site-settings/SiteSettings';
import PagesSection from './pages-section/PagesSection';
import './cms.css';

function Cms() {
  const breadcrumbs = useMemo(() => [{ title: 'CMS', link: '/cms' }], []);

  usePageHeader({
    title: 'CMS',
    breadcrumbs,
  });

  return (
    <div className="cms-page">
      <SiteSettings />

      <h2 className="cms-section-title">Pages</h2>
      <PagesSection />
    </div>
  );
}

export default Cms;
