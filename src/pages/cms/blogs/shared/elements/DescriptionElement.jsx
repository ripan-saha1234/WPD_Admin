import ElementCard from './ElementCard';
import CommonTextEditorBox from '../../../../../components/common-text-editor-box';

function DescriptionElement({ element, onChange, onDelete }) {
  return (
    <ElementCard title="Description" onDelete={onDelete}>
      <CommonTextEditorBox
        placeholder="Write your description here.... Start typing to add content to this section."
        minHeight="120px"
        value={element.data?.html || ''}
        onChange={(data) => onChange({ html: data.html })}
      />
    </ElementCard>
  );
}

export default DescriptionElement;
