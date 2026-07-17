import ElementCard from './ElementCard';
import './HeadingElement.css';

const HEADING_LEVELS = ['h1', 'h2', 'h3'];

function HeadingElement({ element, onChange, onDelete, dragHandleProps }) {
  const level = element.data?.level || 'h1';
  const text = element.data?.text || '';

  return (
    <ElementCard title="Heading" onDelete={onDelete} dragHandleProps={dragHandleProps}>
      <div className="heading-element-levels">
        {HEADING_LEVELS.map((headingLevel) => (
          <button
            key={headingLevel}
            type="button"
            className={`heading-element-level ${level === headingLevel ? 'active' : ''}`}
            onClick={() => onChange({ level: headingLevel })}
          >
            {headingLevel.toUpperCase()}
          </button>
        ))}
      </div>

      <input
        type="text"
        className={`heading-element-input heading-element-input--${level}`}
        placeholder="Write your heading here..."
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    </ElementCard>
  );
}

export default HeadingElement;
