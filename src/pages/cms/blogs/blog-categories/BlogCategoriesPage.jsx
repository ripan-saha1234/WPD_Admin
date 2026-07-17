import { useContext, useMemo, useState } from 'react';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import CommonTable from '../../../../components/common-table';
import CommonDialog from '../../../../components/common-dialog';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Technology', blogCount: 2 },
  { id: 2, name: 'Product Launches', blogCount: 5 },
  { id: 3, name: 'Business', blogCount: 3 },
  { id: 4, name: 'Workshops', blogCount: 4 },
  { id: 5, name: 'Conferences', blogCount: 6 },
  { id: 6, name: 'Team Building', blogCount: 2 },
  { id: 7, name: 'Cloud Computing', blogCount: 7 },
  { id: 8, name: 'AI & ML', blogCount: 2 },
  { id: 9, name: 'Trade Shows', blogCount: 1 },
];

const TABLE_HEADERS = [
  { title: 'Blog Name', value: 'name' },
  { title: 'Number of Blogs', value: 'blogCount' },
  { title: 'Actions', value: 'action' },
];

const ACTION_BUTTONS = [
  { label: 'Edit', action: 'edit' },
  { label: 'Delete', action: 'delete' },
];

const CATEGORY_FORM_SECTIONS = [
  {
    id: 'categoryInfo',
    type: 'fields',
    fields: [
      {
        type: 'text',
        name: 'name',
        label: 'Category Name',
        required: true,
        placeholder: 'Enter category name',
        width: 'full',
      },
    ],
  },
];

function BlogCategoriesPage() {
  const { showToast } = useContext(globalContext);

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  // Add / Edit dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  // CommonDialog requires function setters even when the form has no fields
  const [deleteFormData, setDeleteFormData] = useState({});
  const [deleteErrors, setDeleteErrors] = useState({});

  const isEditing = editingCategoryId !== null;

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms' },
      { title: 'Blog', link: '/cms/blogs' },
      { title: 'Blog Categories', link: '/cms/blogs/blog-categories' },
    ],
    []
  );

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Add a Blog Category',
        onClick: () => {
          setEditingCategoryId(null);
          setFormData({ name: '' });
          setErrors({});
          setFormDialogOpen(true);
        },
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    []
  );

  usePageHeader({
    title: 'Blog Categories',
    breadcrumbs,
    buttons: headerButtons,
  });

  const handleActionClick = (action, categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;

    if (action === 'edit') {
      setEditingCategoryId(categoryId);
      setFormData({ name: category.name });
      setErrors({});
      setFormDialogOpen(true);
    }

    if (action === 'delete') {
      setCategoryToDelete(category);
      setDeleteDialogOpen(true);
    }
  };

  const handleFormSubmit = (data) => {
    const name = data.name.trim();

    if (isEditing) {
      setCategories((current) =>
        current.map((item) =>
          item.id === editingCategoryId ? { ...item, name } : item
        )
      );
      showToast('Blog category updated', 'success');
    } else {
      setCategories((current) => [
        ...current,
        { id: Date.now(), name, blogCount: 0 },
      ]);
      showToast('Blog category added', 'success');
    }
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;

    setCategories((current) =>
      current.filter((item) => item.id !== categoryToDelete.id)
    );
    showToast('Blog category deleted', 'success');
    setCategoryToDelete(null);
  };

  const deleteDialogSections = useMemo(
    () => [
      {
        id: 'deleteConfirm',
        type: 'normal text',
        text: `Are you sure you want to delete "${categoryToDelete?.name ?? ''}"?`,
      },
    ],
    [categoryToDelete]
  );

  return (
    <>
      <CommonTable
        tableData={categories}
        headers={TABLE_HEADERS}
        handleActionClick={handleActionClick}
        specificReturn="id"
        actionButtons={ACTION_BUTTONS}
      />

      <CommonDialog
        open={formDialogOpen}
        setOpen={setFormDialogOpen}
        title={isEditing ? 'Edit Blog Category' : 'Add a Blog Category'}
        formData={formData}
        setFormData={setFormData}
        formSections={CATEGORY_FORM_SECTIONS}
        errors={errors}
        setErrors={setErrors}
        submitButtonText={isEditing ? 'Update' : 'Add'}
        onSubmit={handleFormSubmit}
        dialogsize="sm"
      />

      <CommonDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete Blog Category"
        formData={deleteFormData}
        setFormData={setDeleteFormData}
        formSections={deleteDialogSections}
        errors={deleteErrors}
        setErrors={setDeleteErrors}
        submitButtonText="Delete"
        onSubmit={handleDeleteConfirm}
        dialogsize="sm"
      />
    </>
  );
}

export default BlogCategoriesPage;
