import { Dialog } from '@mui/material';
import './AddElementDialog.css';

const ELEMENT_TYPES = [
  {
    type: 'heading',
    title: 'Heading',
    subtitle: 'H1, H2, or H3 title text',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 5H19" stroke="#464646" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 5V19" stroke="#464646" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 19H16" stroke="#464646" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'description',
    title: 'Description',
    subtitle: 'Paragraph or rich text block',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6H20M4 10H20M4 14H14"
          stroke="#464646"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: 'image',
    title: 'Image',
    subtitle: 'Photo with caption support',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#464646" strokeWidth="1.8" />
        <circle cx="9" cy="10" r="1.7" fill="#464646" />
        <path
          d="M4 18L10 13L14 16L17 14L20 16.5"
          stroke="#464646"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    type: 'table',
    title: 'Table',
    subtitle: 'Data table with inline editing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#464646" strokeWidth="1.8" />
        <path d="M3 10H21M9 10V20M15 10V20" stroke="#464646" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    type: 'faq',
    title: 'FAQ',
    subtitle: 'Expandable Q&A accordion',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#464646" strokeWidth="1.8" />
        <path
          d="M9.5 9.5C9.5 8.1 10.6 7 12 7C13.4 7 14.5 8.1 14.5 9.5C14.5 10.9 13.4 11.5 12 12.2V13.5"
          stroke="#464646"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.6" r="1.1" fill="#464646" />
      </svg>
    ),
  },
  {
    type: 'button',
    title: 'Button',
    subtitle: 'CTA with link and style options',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 3.5L10.5 7M4 9L7.5 10.5M5 5L7 7"
          stroke="#464646"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M11 11L20 14.5L16.2 16.2L14.5 20L11 11Z"
          stroke="#464646"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function AddElementDialog({ open, setOpen, onSelect }) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '1rem',
          padding: '1.25rem 1.5rem 1.5rem',
        },
      }}
    >
      <div className="add-element-dialog-header">
        <h2 className="add-element-dialog-title">Add Element</h2>
        <button
          type="button"
          className="add-element-dialog-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <img src="/cross-icon.svg" alt="" width="12" height="12" />
        </button>
      </div>

      <div className="add-element-grid">
        {ELEMENT_TYPES.map((element) => (
          <button
            key={element.type}
            type="button"
            className="add-element-card"
            onClick={() => {
              onSelect(element.type);
              setOpen(false);
            }}
          >
            <span className="add-element-card-icon" aria-hidden="true">
              {element.icon}
            </span>
            <span className="add-element-card-text">
              <span className="add-element-card-title">{element.title}</span>
              <span className="add-element-card-subtitle">{element.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

export default AddElementDialog;
