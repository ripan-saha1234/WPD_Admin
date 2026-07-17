import ElementCard from './ElementCard';
import CommonFileUpload from '../../../../../components/common-file-upload';
import CommonInput from '../../../../../components/common-input';

function ImageElement({ element, onChange, onDelete, dragHandleProps }) {
  return (
    <ElementCard title="Image" onDelete={onDelete} dragHandleProps={dragHandleProps}>
      <CommonFileUpload
        acceptedTypes="image"
        placeholder="Drop your Image here"
        supportText="Drag and drop your PNG, JPG and WebP images here or browse"
        browseText="Browse File"
        value={element.data?.image || null}
        onFilesChange={(file) => onChange({ image: file })}
      />
      <CommonInput
        label="Caption"
        name={`image-caption-${element.id}`}
        placeholder="Write a caption for the image (optional)"
        value={element.data?.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
      />
    </ElementCard>
  );
}

export default ImageElement;
