import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { globalContext } from '../../../../context/context';
import CommonTable from '../../../../components/common-table';
import CommonDialog from '../../../../components/common-dialog';
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from '../../../../services/blogCategoryService';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import '../shared/BlogForm.css';

const HEADERS = [
  { title: 'Name', value: 'name' },
  { title: 'Slug', value: 'slug' },
  { title: 'Description', value: 'description' },
  { title: 'Status', value: 'status' },
  { title: 'Created', value: 'created_at' },
  { title: 'Action', value: 'action' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  isActive: true,
};

function BlogCategoriesPage() {
  const { showToast } = useContext(globalContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const formSections = useMemo(
    () => [
      {
        id: 'categoryFields',
        type: 'fields',
        fields: [
          {
            type: 'text',
            name: 'name',
            label: 'Category name',
            required: true,
            placeholder: 'Enter category name',
            width: 'full',
          },
          {
            type: 'text',
            name: 'description',
            label: 'Description',
            required: true,
            placeholder: 'Enter description',
            width: 'full',
            multiline: true,
            row: 3,
          },
        ],
      },
      {
        id: 'status',
        type: 'toggle switch',
        value: 'isActive',
        activeText: 'Active',
        inactiveText: 'Inactive',
      },
    ],
    []
  );

  const openAddDialog = useCallback(() => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  }, []);

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Add Category',
        onClick: openAddDialog,
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    [openAddDialog]
  );

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms/blogs' },
      { title: 'Blog Categories', link: '/cms/blogs/blog-categories' },
    ],
    []
  );

  usePageHeader({
    title: 'Blog Categories',
    breadcrumbs,
    buttons: headerButtons,
  });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await getBlogCategories();
    if (data?.success) {
      const list = Array.isArray(data.data) ? data.data : data.data?.data || [];
      setCategories(
        list.map((c) => ({
          ...c,
          created_at: c.created_at || c.createdAt || '—',
        }))
      );
    } else {
      showToast(data?.message || 'Failed to load categories', 'error');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleActionClick = async (action, id) => {
    const category = categories.find((c) => String(c.id) === String(id));
    if (!category) return;

    if (action === 'edit') {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        description: category.description,
        isActive: category.status === 'Active',
      });
      setErrors({});
      setDialogOpen(true);
      return;
    }

    if (action === 'view') {
      showToast(`Category: ${category.name}`, 'info');
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(`Delete category "${category.name}"?`);
      if (!confirmed) return;
      const { data } = await deleteBlogCategory(category.id);
      if (data?.success) {
        showToast('Category deleted', 'success');
        loadCategories();
      } else {
        showToast(data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    const payload = {
      name: data.name,
      description: data.description,
      status: data.isActive ? 'Active' : 'Inactive',
    };

    const result = editingId
      ? await updateBlogCategory(editingId, payload)
      : await createBlogCategory(payload);

    setSaving(false);

    if (!result.data?.success) {
      showToast(result.data?.message || 'Failed to save category', 'error');
      return;
    }

    showToast(
      editingId ? 'Category updated' : 'Category added successfully',
      'success'
    );
    setDialogOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    loadCategories();
  };

  return (
    <div className="cms-blogs-page">
      {loading ? (
        <p className="cms-blogs-muted">Loading categories...</p>
      ) : (
        <CommonTable
          tableData={categories}
          headers={HEADERS}
          specificReturn="id"
          handleActionClick={handleActionClick}
        />
      )}

      <CommonDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        title={editingId ? 'Edit Blog Category' : 'Add Blog Category'}
        formData={formData}
        setFormData={setFormData}
        formSections={formSections}
        errors={errors}
        setErrors={setErrors}
        submitButtonText={editingId ? 'Update' : 'Add Category'}
        onSubmit={handleSubmit}
        submitButtonLoading={saving}
        autoCloseOnSubmit={false}
      />
    </div>
  );
}

export default BlogCategoriesPage;
