import { useEffect, useRef, useState } from 'react';
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (pageId) => {
    setOpenMenuId((prev) => (prev === pageId ? null : pageId));
  };

  return (
    <div className="cms-pages-grid">
      {CMS_PAGES.map((page) => (
        <div key={page.id} className="cms-page-card">
          <span className="cms-page-card-label">{page.label}</span>
          <div
            className="cms-page-card-menu"
            ref={openMenuId === page.id ? menuRef : null}
          >
            <button
              type="button"
              className="cms-page-card-dots"
              onClick={() => toggleMenu(page.id)}
              title={`${page.label} options`}
            >
              <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                <circle cx="2" cy="2" r="1.6" fill="#0690fd" />
                <circle cx="8" cy="2" r="1.6" fill="#0690fd" />
                <circle cx="14" cy="2" r="1.6" fill="#0690fd" />
              </svg>
            </button>

            {openMenuId === page.id && (
              <div className="cms-page-card-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    if (page.path) {
                      navigate(page.path);
                      return;
                    }
                    onEditPage(page);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PagesSection;
