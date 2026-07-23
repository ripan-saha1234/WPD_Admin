import { useState } from 'react';
import './HomeSectionCard.css';

function HomeSectionCard({ title, subtitle = '', children, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="home-section-card">
      <header className="home-section-card-header">
        <div className="home-section-card-header-left">
          <span className="home-section-badge" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6H20M4 12H20M4 18H14"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="home-section-titles">
            <h3 className="home-section-title">{title}</h3>
            {subtitle ? <p className="home-section-subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <button
          type="button"
          className="home-section-icon-btn"
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <svg
            width="11"
            height="7"
            viewBox="0 0 12 8"
            fill="none"
            className={collapsed ? 'home-section-chevron collapsed' : 'home-section-chevron'}
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#464646"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {!collapsed && <div className="home-section-card-body">{children}</div>}
    </section>
  );
}

export default HomeSectionCard;
