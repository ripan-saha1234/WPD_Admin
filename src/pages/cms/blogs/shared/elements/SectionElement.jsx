import { useState } from 'react';
import HeadingElement from './HeadingElement';
import DescriptionElement from './DescriptionElement';
import ImageElement from './ImageElement';
import TableElement from './TableElement';
import FaqElement from './FaqElement';
import ButtonElement from './ButtonElement';
import './SectionElement.css';

const ELEMENT_COMPONENTS = {
  heading: HeadingElement,
  description: DescriptionElement,
  image: ImageElement,
  table: TableElement,
  faq: FaqElement,
  button: ButtonElement,
};

/**
 * Renders one element inside a section by type.
 * onChange(elementId, dataPatch) merges a patch into element.data.
 * Dragging is enabled only while the element card's handle is pressed.
 */
function SectionElement({
  element,
  index,
  sectionId,
  onChange,
  onDelete,
  onReorder = () => {},
}) {
  const [dragEnabled, setDragEnabled] = useState(false);

  const ElementComponent = ELEMENT_COMPONENTS[element.type];
  if (!ElementComponent) return null;

  return (
    <div
      className={`blog-section-element ${dragEnabled ? 'dragging' : ''}`}
      draggable={dragEnabled}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-element-index', String(index));
        e.dataTransfer.setData('application/x-element-section', String(sectionId));
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        setDragEnabled(false);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-element-index')) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(e) => {
        const raw = e.dataTransfer.getData('application/x-element-index');
        const fromSection = e.dataTransfer.getData('application/x-element-section');
        if (raw === '' || fromSection !== String(sectionId)) return;
        e.preventDefault();
        e.stopPropagation();
        onReorder(Number(raw), index);
        setDragEnabled(false);
      }}
    >
      <ElementComponent
        element={element}
        onChange={(dataPatch) => onChange(element.id, dataPatch)}
        onDelete={() => onDelete(element.id)}
        dragHandleProps={{
          onMouseDown: () => setDragEnabled(true),
          onMouseUp: () => setDragEnabled(false),
        }}
      />
    </div>
  );
}

export default SectionElement;
