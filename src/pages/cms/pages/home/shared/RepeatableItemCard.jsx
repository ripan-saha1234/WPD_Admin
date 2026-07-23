import { useState } from 'react';
import './RepeatableItemCard.css';

function RepeatableItemCard({
  title,
  index,
  onDelete,
  onReorder = () => {},
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);

  return (
    <div
      className={`home-item-card ${dragEnabled ? 'dragging' : ''}`}
      draggable={dragEnabled}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-home-item-index', String(index));
      }}
      onDragEnd={() => setDragEnabled(false)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-home-item-index')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(e) => {
        const raw = e.dataTransfer.getData('application/x-home-item-index');
        if (raw === '') return;
        e.preventDefault();
        onReorder(Number(raw), index);
        setDragEnabled(false);
      }}
    >
      <div className="home-item-card-header">
        <div className="home-item-card-header-left">
          <span
            className="home-item-drag"
            title="Drag to reorder"
            onMouseDown={() => setDragEnabled(true)}
            onMouseUp={() => setDragEnabled(false)}
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
          <span className="home-item-title">{title}</span>
        </div>

        <div className="home-item-card-header-right">
          <button
            type="button"
            className="home-item-icon-btn"
            aria-label={collapsed ? 'Expand item' : 'Collapse item'}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 12 8"
              fill="none"
              className={collapsed ? 'home-item-chevron collapsed' : 'home-item-chevron'}
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
          {onDelete ? (
            <button
              type="button"
              className="home-item-icon-btn"
              aria-label="Delete item"
              onClick={onDelete}
            >
              <img src="/delete-icon.svg" alt="" width="13" height="13" />
            </button>
          ) : null}
        </div>
      </div>

      {!collapsed && <div className="home-item-card-body">{children}</div>}
    </div>
  );
}

export default RepeatableItemCard;
