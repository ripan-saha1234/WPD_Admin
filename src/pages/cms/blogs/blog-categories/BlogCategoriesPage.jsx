import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import CommonTable from '../../../../components/common-table';
import CommonDialog from '../../../../components/common-dialog';
import CommonLoader from '../../../../components/common-loader';
import {
  createBlogCategory,
  deleteBlogCategory,
  extractBlogCategoriesList,
  getBlogCategories,
  mapBlogCategoryFromApi,
  updateBlogCategory,
} from '../../../../services/blogCategoryService';

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

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteFormData, setDeleteFormData] = useState({});
  const [deleteErrors, setDeleteErrors] = useState({});

  const isEditing = editingCategoryId !== null;

  const fetchCategories = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { response, data } = await getBlogCategories();

      if (!response.ok || data.success === false) {
        showToast(data.message || 'Failed to load blog categories', 'error');
        setCategories([]);
        return;
      }

      const list = extractBlogCategoriesList(data).map(mapBlogCategoryFromApi);
      setCategories(list);
    } catch (error) {
      console.error('Fetch blog categories error:', error);
      showToast('Network error. Please try again.', 'error');
      setCategories([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleFormSubmit = async (data) => {
    const name = data.name.trim();
    const existing = isEditing
      ? categories.find((item) => item.id === editingCategoryId)
      : null;

    setSubmitting(true);
    try {
      if (isEditing) {
        const { response, data: apiData } = await updateBlogCategory(
          editingCategoryId,
          {
            name,
            parent_id: existing?.parent_id ?? '',
            status: existing?.status || 'active',
          }
        );

        if (!response.ok || apiData.success !== true) {
          showToast(apiData.message || 'Failed to update blog category', 'error');
          throw new Error(apiData.message || 'Update failed');
        }

        showToast(apiData.message || 'Blog category updated successfully.', 'success');
        await fetchCategories({ silent: true });
        return;
      }

      const { response, data: apiData } = await createBlogCategory({
        name,
        parent_id: '',
        status: 'active',
      });

      if (!response.ok || apiData.success !== true) {
        showToast(apiData.message || 'Failed to create blog category', 'error');
        throw new Error(apiData.message || 'Create failed');
      }

      showToast(apiData.message || 'Blog category created successfully.', 'success');
      await fetchCategories({ silent: true });
    } catch (error) {
      if (error?.message !== 'Create failed' && error?.message !== 'Update failed') {
        console.error('Save blog category error:', error);
        showToast('Network error. Please try again.', 'error');
      }
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      const { response, data: apiData } = await deleteBlogCategory(
        categoryToDelete.id
      );

      if (!response.ok || apiData.success === false) {
        showToast(apiData.message || 'Failed to delete blog category', 'error');
        throw new Error(apiData.message || 'Delete failed');
      }

      showToast(apiData.message || 'Blog category deleted successfully.', 'success');
      setCategoryToDelete(null);
      await fetchCategories({ silent: true });
    } catch (error) {
      if (error?.message !== 'Delete failed') {
        console.error('Delete blog category error:', error);
        showToast('Network error. Please try again.', 'error');
      }
      throw error;
    } finally {
      setDeleting(false);
    }
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

  if (loading) {
    return <CommonLoader text="Loading blog categories..." />;
  }

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
        submitButtonLoading={submitting}
        submitButtonLoadingText="Saving..."
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
        submitButtonLoading={deleting}
        submitButtonLoadingText="Deleting..."
      />
    </>
  );
}

export default BlogCategoriesPage;
