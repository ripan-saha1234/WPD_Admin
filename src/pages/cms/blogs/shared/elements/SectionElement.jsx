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
 */
function SectionElement({ element, onChange, onDelete }) {
  const ElementComponent = ELEMENT_COMPONENTS[element.type];
  if (!ElementComponent) return null;

  return (
    <div className="blog-section-element">
      <ElementComponent
        element={element}
        onChange={(dataPatch) => onChange(element.id, dataPatch)}
        onDelete={() => onDelete(element.id)}
      />
    </div>
  );
}

export default SectionElement;
