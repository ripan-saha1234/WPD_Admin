import { useNavigate } from 'react-router-dom';
import './PagesSection.css';

const CMS_PAGES = [
  { id: 'home', label: 'Home', path: '/cms/pages/home' },
  { id: 'about', label: 'About' },
  { id: 'join-as-promoter', label: 'Join as promoter' },
  { id: 'contact', label: 'Contact' },
  { id: 'blog', label: 'Blog', path: '/cms/blogs' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'refund-policy', label: 'Refund Policy' },
  { id: 'terms-conditions', label: 'Terms & Conditions' },
];

function PagesSection({ onEditPage = () => {} }) {
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    if (page.path) {
      navigate(page.path);
      return;
    }
    onEditPage(page);
  };

  return (
    <div className="cms-pages-grid">
      {CMS_PAGES.map((page) => (
        <button
          key={page.id}
          type="button"
          className="cms-page-card"
          onClick={() => handlePageClick(page)}
        >
          <span className="cms-page-card-label">{page.label}</span>
        </button>
      ))}
    </div>
  );
}

export default PagesSection;
