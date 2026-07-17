import { useState } from 'react';
import './ElementCard.css';

/**
 * Common wrapper for every section element — header with drag handle,
 * element label, collapse chevron and delete, body below.
 */
function ElementCard({ title, onDelete, dragHandleProps = {}, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="element-card">
      <div className="element-card-header">
        <div className="element-card-header-left">
          <span
            className="element-card-drag"
            aria-hidden="true"
            title="Drag to reorder element"
            {...dragHandleProps}
          >
            <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 1H11M1 5H11M1 9H11"
                stroke="#8a94a6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="element-card-title">{title}</span>
        </div>

        <div className="element-card-header-right">
          <button
            type="button"
            className="element-card-icon-btn"
            aria-label={collapsed ? 'Expand element' : 'Collapse element'}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 12 8"
              fill="none"
              className={collapsed ? 'element-card-chevron collapsed' : 'element-card-chevron'}
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#0690fd"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="element-card-icon-btn"
            aria-label="Delete element"
            onClick={onDelete}
          >
            <img src="/delete-icon.svg" alt="" width="13" height="13" />
          </button>
        </div>
      </div>

      {!collapsed && <div className="element-card-body">{children}</div>}
    </div>
  );
}

export default ElementCard;
