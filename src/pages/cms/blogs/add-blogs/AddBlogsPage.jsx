import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import BlogForm from '../shared/BlogForm';
import { createBlog } from '../../../../services/blogService';
import { usePageHeader } from '../../../../hooks/usePageHeader';

function AddBlogsPage() {
  const { showToast } = useContext(globalContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms/blogs' },
      { title: 'Blogs', link: '/cms/blogs' },
      { title: 'Add Blog', link: '/cms/blogs/add-blogs' },
    ],
    []
  );

  usePageHeader({
    title: 'Add Blog',
    breadcrumbs,
  });

  const handleSubmit = async (formState) => {
    setSaving(true);
    const { data } = await createBlog(formState);
    setSaving(false);

    if (data?.success) {
      showToast('Blog added successfully', 'success');
      navigate('/cms/blogs');
      return;
    }

    showToast(data?.message || 'Failed to add blog', 'error');
  };

  return (
    <BlogForm
      mode="add"
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/cms/blogs')}
      showToast={showToast}
    />
  );
}

export default AddBlogsPage;
