import ElementCard from './ElementCard';
import CommonInput from '../../../../../components/common-input';
import './ButtonElement.css';

function ButtonElement({ element, onChange, onDelete, dragHandleProps }) {
  return (
    <ElementCard title="Button" onDelete={onDelete} dragHandleProps={dragHandleProps}>
      <div className="button-element-row">
        <CommonInput
          label="Button name"
          name={`button-name-${element.id}`}
          placeholder="Join Us"
          value={element.data?.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <CommonInput
          label="Button url"
          name={`button-url-${element.id}`}
          placeholder="www.joinus.com"
          value={element.data?.url || ''}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </div>
    </ElementCard>
  );
}

export default ButtonElement;
