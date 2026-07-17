import SectionElement from './elements/SectionElement';
import './BlogSectionCard.css';

function BlogSectionCard({
  section,
  index,
  onDelete,
  onToggleCollapse,
  onAddElement,
  onElementChange = () => {},
  onElementDelete = () => {},
}) {
  const elementCount = section.elements.length;

  return (
    <section className="blog-section-card">
      <header className="blog-section-card-header">
        <div className="blog-section-card-header-left">
          <span className="blog-section-drag" aria-hidden="true">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 1H11M1 5H11M1 9H11"
                stroke="#8a94a6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="blog-section-badge" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke="#ffffff"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <h3 className="blog-section-title">Section {index + 1}</h3>
        </div>

        <div className="blog-section-card-header-right">
          <span className="blog-section-count">
            {elementCount} element{elementCount === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            className="blog-section-add-element"
            onClick={() => onAddElement(section.id)}
          >
            + Add Element
          </button>
          <button
            type="button"
            className="blog-section-icon-btn"
            aria-label={section.collapsed ? 'Expand section' : 'Collapse section'}
            onClick={() => onToggleCollapse(section.id)}
          >
            <svg
              width="11"
              height="7"
              viewBox="0 0 12 8"
              fill="none"
              className={section.collapsed ? 'blog-section-chevron collapsed' : 'blog-section-chevron'}
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
          <button
            type="button"
            className="blog-section-icon-btn"
            aria-label="Delete section"
            onClick={() => onDelete(section.id)}
          >
            <img src="/delete-icon.svg" alt="" width="14" height="14" />
          </button>
        </div>
      </header>

      {!section.collapsed && (
        <div className="blog-section-card-body">
          {elementCount === 0 ? (
            <button
              type="button"
              className="blog-section-empty"
              onClick={() => onAddElement(section.id)}
            >
              <span className="blog-section-empty-icon" aria-hidden="true">+</span>
              <span>Add your first element</span>
            </button>
          ) : (
            <div className="blog-section-elements">
              {section.elements.map((element) => (
                <SectionElement
                  key={element.id}
                  element={element}
                  onChange={(elementId, dataPatch) =>
                    onElementChange(section.id, elementId, dataPatch)
                  }
                  onDelete={(elementId) => onElementDelete(section.id, elementId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default BlogSectionCard;
