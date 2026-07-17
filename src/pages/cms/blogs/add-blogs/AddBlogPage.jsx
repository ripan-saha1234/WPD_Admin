import { useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import CommonInput from '../../../../components/common-input';
import CommonSelect from '../../../../components/common-select';
import CommonFileUpload from '../../../../components/common-file-upload';
import BlogSectionCard from '../shared/BlogSectionCard';
import AddElementDialog from '../shared/AddElementDialog';
import './AddBlogPage.css';

// Placeholder list — swap with API data when available
const CATEGORY_OPTIONS = [
  { label: 'Technology', value: 'technology' },
  { label: 'Product Launches', value: 'product-launches' },
  { label: 'Business', value: 'business' },
  { label: 'Cloud Computing', value: 'cloud-computing' },
  { label: 'AI & ML', value: 'ai-ml' },
];

const SHARE_OPTIONS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
];

function AddBlogPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(globalContext);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    featureImage: null,
    share: { facebook: true, twitter: true, linkedin: false },
  });
  const [errors, setErrors] = useState({ name: false, category: false });
  const [sections, setSections] = useState([]);
  const [elementDialogOpen, setElementDialogOpen] = useState(false);
  const [elementTargetSectionId, setElementTargetSectionId] = useState(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors && value) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const toggleShare = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      share: { ...prev.share, [optionId]: !prev.share[optionId] },
    }));
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, collapsed: false, elements: [] },
    ]);
  };

  const deleteSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const toggleSectionCollapse = (sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, collapsed: !section.collapsed }
          : section
      )
    );
  };

  const addElement = (sectionId) => {
    setElementTargetSectionId(sectionId);
    setElementDialogOpen(true);
  };

  const handleElementSelect = (type) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === elementTargetSectionId
          ? {
              ...section,
              elements: [
                ...section.elements,
                { id: `element-${Date.now()}`, type, data: {} },
              ],
            }
          : section
      )
    );
  };

  const handleElementChange = (sectionId, elementId, dataPatch) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              elements: section.elements.map((element) =>
                element.id === elementId
                  ? { ...element, data: { ...element.data, ...dataPatch } }
                  : element
              ),
            }
          : section
      )
    );
  };

  const handleElementDelete = (sectionId, elementId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              elements: section.elements.filter(
                (element) => element.id !== elementId
              ),
            }
          : section
      )
    );
  };

  const handleSubmit = () => {
    const newErrors = {
      name: !formData.name.trim(),
      category: !formData.category,
    };
    setErrors(newErrors);

    if (newErrors.name || newErrors.category) {
      showToast('Please fill all the mandatory fields', 'error');
      return;
    }

    showToast('Blog added', 'success');
    navigate('/cms/blogs');
  };

  // Header button reads the latest submit through a ref, so the memoized
  // button list never goes stale as form state changes
  const submitRef = useRef(handleSubmit);
  submitRef.current = handleSubmit;

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms' },
      { title: 'Blog', link: '/cms/blogs' },
      { title: 'Create a Blog', link: '/cms/blogs/add-blogs' },
    ],
    []
  );

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Add',
        onClick: () => submitRef.current(),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    []
  );

  usePageHeader({
    title: 'Create a Blog',
    breadcrumbs,
    buttons: headerButtons,
  });

  return (
    <div className="add-blog-page">
      <div className="add-blog-top-row">
        <CommonInput
          label="Blog Name"
          name="blogName"
          required
          placeholder="AI & Machine Learning Trends 2024"
          value={formData.name}
          error={errors.name}
          errorMsg="Blog Name is required"
          onChange={(e) => updateField('name', e.target.value)}
        />
        <CommonSelect
          label="Select Category"
          name="blogCategory"
          required
          placeholder="Select Option"
          options={CATEGORY_OPTIONS}
          value={formData.category}
          error={errors.category}
          errorMsg="Category is required"
          onChange={(e) => updateField('category', e.target.value)}
        />
      </div>

      <div className="add-blog-feature-image">
        <p className="add-blog-field-label">Feature Image</p>
        <CommonFileUpload
          acceptedTypes="image"
          placeholder="Drop Feature Image Here"
          supportText="Drag and drop your PNG, JPG and WebP images here or browse"
          browseText="Browse File"
          value={formData.featureImage}
          onFilesChange={(file) => updateField('featureImage', file)}
        />
      </div>

      <div className="add-blog-share-row">
        <span className="add-blog-share-label">Share the post option</span>
        {SHARE_OPTIONS.map((option) => (
          <label key={option.id} className="add-blog-share-option">
            <input
              type="checkbox"
              checked={formData.share[option.id]}
              onChange={() => toggleShare(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {sections.map((section, index) => (
        <BlogSectionCard
          key={section.id}
          section={section}
          index={index}
          onDelete={deleteSection}
          onToggleCollapse={toggleSectionCollapse}
          onAddElement={addElement}
          onElementChange={handleElementChange}
          onElementDelete={handleElementDelete}
        />
      ))}

      <button type="button" className="add-blog-add-section" onClick={addSection}>
        <span className="add-blog-add-section-icon" aria-hidden="true">+</span>
        Add Section
      </button>

      <AddElementDialog
        open={elementDialogOpen}
        setOpen={setElementDialogOpen}
        onSelect={handleElementSelect}
      />
    </div>
  );
}

export default AddBlogPage;
