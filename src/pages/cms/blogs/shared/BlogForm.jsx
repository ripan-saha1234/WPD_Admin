import { useEffect, useMemo, useState } from 'react';
import CommonInput from '../../../../components/common-input';
import CommonSelect from '../../../../components/common-select';
import CommonTextEditorBox from '../../../../components/common-text-editor-box';
import CommonFileUpload from '../../../../components/common-file-upload';
import CommonButton from '../../../../components/common-button';
import CommonDialog from '../../../../components/common-dialog';
import CommonLoader from '../../../../components/common-loader';
import BlogSectionCard from './BlogSectionCard';
import {
  createEmptyBlogForm,
  createSectionFromComponents,
  EMPTY_SECTION_COMPONENTS,
  validateBlogForm,
} from './blogFormUtils';
import { getBlogCategories } from '../../../../services/blogCategoryService';
import './BlogForm.css';

function BlogForm({
  initialData = null,
  mode = 'add',
  saving = false,
  onSubmit,
  onCancel,
  showToast,
}) {
  const [formData, setFormData] = useState(initialData || createEmptyBlogForm());
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionPicker, setSectionPicker] = useState({
    components: { ...EMPTY_SECTION_COMPONENTS },
  });
  const [sectionPickerErrors, setSectionPickerErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingCategories(true);
      const { data } = await getBlogCategories();
      if (cancelled) return;

      if (data?.success) {
        const list = Array.isArray(data.data) ? data.data : data.data?.data || [];
        setCategories(list.filter((c) => c.status !== 'Inactive'));
      } else {
        showToast?.(data?.message || 'Failed to load categories', 'error');
      }
      setLoadingCategories(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // Avoid rewriting form state with an identical object reference on every parent render
  useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => {
      if (prev === initialData) return prev;
      return initialData;
    });
  }, [initialData]);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    [categories]
  );

  const sectionDialogSections = [
    {
      id: 'componentPicker',
      type: 'checkbox',
      title: 'Select components',
      dataKey: 'components',
      required: true,
      minRequired: 1,
      options: [
        { label: 'Heading', value: 'heading' },
        { label: 'Description', value: 'description' },
        { label: 'Image', value: 'image' },
        { label: 'Button', value: 'button' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Quote', value: 'quote' },
      ],
    },
  ];

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const openSectionDialog = () => {
    setSectionPicker({ components: { ...EMPTY_SECTION_COMPONENTS } });
    setSectionPickerErrors({});
    setSectionDialogOpen(true);
  };

  const handleAddSection = async (pickerData) => {
    const components = pickerData.components || {};
    const selected = Object.values(components).some(Boolean);
    if (!selected) {
      showToast?.('Select at least one component', 'error');
      return;
    }

    const section = createSectionFromComponents(components);
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
    setSectionDialogOpen(false);
  };

  const updateSection = (index, nextSection) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === index ? nextSection : s)),
    }));
  };

  const deleteSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    const nextErrors = validateBlogForm(formData, {
      requireThumbnail: true,
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast?.('Please fill all required fields', 'error');
      return;
    }

    const category = categories.find(
      (c) => String(c.id) === String(formData.blog_category_id)
    );

    onSubmit({
      ...formData,
      categoryName: category?.name || '',
    });
  };

  if (loadingCategories) {
    return (
      <div className="blog-form-loading">
        <CommonLoader />
      </div>
    );
  }

  return (
    <div className="blog-form">
      <section className="blog-form-section">
        <CommonInput
          label="Blog Name"
          name="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
          error={errors.name}
          errorMsg="Blog name is required"
          placeholder="Enter blog name"
        />

        <CommonSelect
          label="Blog Category"
          name="blog_category_id"
          value={String(formData.blog_category_id || '')}
          onChange={(e) => updateField('blog_category_id', e.target.value)}
          options={categoryOptions}
          required
          error={errors.blog_category_id}
          errorMsg="Category is required"
          placeholder="Select category"
        />

        <CommonFileUpload
          label="Thumbnail Image"
          acceptedTypes="image"
          supportText="Only support .png, .jpg and .jpeg files"
          value={formData.thumbnail_image}
          onFilesChange={(file) => updateField('thumbnail_image', file)}
          required
          error={errors.thumbnail_image}
          errorMessage="Thumbnail image is required"
        />

        <CommonTextEditorBox
          label="Description"
          value={formData.description}
          onChange={(data) => updateField('description', data.html)}
          required
          error={errors.description}
          errorMessage="Description is required"
          placeholder="Write the blog description..."
          minHeight="220px"
        />

        <div className="blog-share-options">
          <p className="blog-share-label">Share options</p>
          <div className="blog-share-checkboxes">
            {[
              { key: 'share_facebook', label: 'Facebook' },
              { key: 'share_twitter', label: 'Twitter' },
              { key: 'share_linkedin', label: 'LinkedIn' },
            ].map((option) => (
              <label key={option.key} className="blog-share-item">
                <input
                  type="checkbox"
                  checked={!!formData[option.key]}
                  onChange={(e) => updateField(option.key, e.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <hr className="blog-form-divider" />

      <section className="blog-form-section">
        <div className="blog-sections-header">
          <h3>Sections</h3>
          <CommonButton
            text="Add Sections"
            onClick={openSectionDialog}
            backgroundColor="#0690fd"
            color="#FFFFFF"
            borderColor="#0690fd"
          />
        </div>

        {formData.sections.length === 0 ? (
          <p className="blog-form-muted">No sections yet. Click Add Sections to start.</p>
        ) : (
          <div className="blog-sections-list">
            {formData.sections.map((section, index) => (
              <BlogSectionCard
                key={section.id}
                section={section}
                onChange={(next) => updateSection(index, next)}
                onDelete={() => deleteSection(index)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="blog-form-actions">
        <CommonButton
          text="Cancel"
          onClick={onCancel}
          backgroundColor="#FFFFFF"
          color="#0690fd"
          borderColor="#0690fd"
        />
        <CommonButton
          text={
            saving
              ? 'Saving...'
              : mode === 'edit'
                ? 'Update Blog'
                : 'Add Blog'
          }
          onClick={handleSubmit}
          disabled={saving}
          backgroundColor="#0690fd"
          color="#FFFFFF"
          borderColor="#0690fd"
        />
      </div>

      <CommonDialog
        open={sectionDialogOpen}
        setOpen={setSectionDialogOpen}
        title="Add Section"
        formData={sectionPicker}
        setFormData={setSectionPicker}
        formSections={sectionDialogSections}
        errors={sectionPickerErrors}
        setErrors={setSectionPickerErrors}
        submitButtonText="Add Section"
        onSubmit={handleAddSection}
        autoCloseOnSubmit={false}
      />
    </div>
  );
}

export default BlogForm;
