import CommonInput from '../../../../components/common-input';
import CommonSelect from '../../../../components/common-select';
import CommonTextEditorBox from '../../../../components/common-text-editor-box';
import CommonFileUpload from '../../../../components/common-file-upload';
import BlogSectionFaqs from '../../../../components/blog-section-faqs';
import { IMAGE_POSITION_OPTIONS } from './blogFormUtils';
import './BlogForm.css';

function BlogSectionCard({ section, onChange, onDelete }) {
  const updateData = (field, value) => {
    onChange({
      ...section,
      data: { ...section.data, [field]: value },
    });
  };

  return (
    <div className="blog-section-card">
      <div className="blog-section-card-header">
        <h4>Section</h4>
        <button
          type="button"
          className="blog-section-delete"
          onClick={onDelete}
          title="Delete section"
        >
          <img src="/delete-icon.svg" alt="Delete" />
        </button>
      </div>

      {section.components.heading && (
        <CommonInput
          label="Heading"
          name={`heading-${section.id}`}
          value={section.data.heading}
          onChange={(e) => updateData('heading', e.target.value)}
          placeholder="Enter heading"
        />
      )}

      {section.components.description && (
        <CommonTextEditorBox
          label="Description"
          value={section.data.description}
          onChange={(data) => updateData('description', data.html)}
          placeholder="Write section description..."
          minHeight="180px"
        />
      )}

      {section.components.image && (
        <div className="blog-section-image-block">
          <CommonFileUpload
            label="Image"
            acceptedTypes="image"
            supportText="Only support .png, .jpg and .jpeg files"
            value={section.data.image || null}
            onFilesChange={(file) => updateData('image', file || '')}
          />
          <CommonSelect
            label="Image position"
            name={`imagePosition-${section.id}`}
            value={section.data.imagePosition}
            onChange={(e) => updateData('imagePosition', e.target.value)}
            options={IMAGE_POSITION_OPTIONS}
            placeholder="Select position"
          />
        </div>
      )}

      {section.components.button && (
        <div className="blog-form-row">
          <CommonInput
            label="Button name"
            name={`buttonName-${section.id}`}
            value={section.data.buttonName}
            onChange={(e) => updateData('buttonName', e.target.value)}
            placeholder="Enter button name"
            half
          />
          <CommonInput
            label="Button URL"
            name={`buttonUrl-${section.id}`}
            value={section.data.buttonUrl}
            onChange={(e) => updateData('buttonUrl', e.target.value)}
            placeholder="https://"
            half
          />
        </div>
      )}

      {section.components.faq && (
        <BlogSectionFaqs
          faqs={section.data.faqs}
          onChange={(faqs) => updateData('faqs', faqs)}
        />
      )}

      {section.components.quote && (
        <CommonInput
          label="Quote"
          name={`quote-${section.id}`}
          value={section.data.quote || ''}
          onChange={(e) => updateData('quote', e.target.value)}
          placeholder="Enter quote"
        />
      )}
    </div>
  );
}

export default BlogSectionCard;
