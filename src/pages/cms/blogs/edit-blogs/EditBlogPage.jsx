import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import BlogForm from '../shared/BlogForm';
import CommonLoader from '../../../../components/common-loader';
import { getBlogById, updateBlog } from '../../../../services/blogService';
import { mapApiBlogToForm } from '../shared/blogFormUtils';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import '../shared/BlogForm.css';

function EditBlogPage() {
  const { showToast } = useContext(globalContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms/blogs' },
      { title: 'Blogs', link: '/cms/blogs' },
      { title: 'Edit Blog', link: `/cms/blogs/edit-blog/${id}` },
    ],
    [id]
  );

  usePageHeader({
    title: 'Edit Blog',
    breadcrumbs,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await getBlogById(id);
      if (cancelled) return;

      if (data?.success && data.data) {
        setInitialData(mapApiBlogToForm(data.data));
      } else {
        showToast(data?.message || 'Blog not found', 'error');
        navigate('/cms/blogs');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, showToast]);

  const handleSubmit = async (formState) => {
    setSaving(true);
    const { data } = await updateBlog(id, formState);
    setSaving(false);

    if (data?.success) {
      showToast('Blog updated successfully', 'success');
      navigate('/cms/blogs');
      return;
    }

    showToast(data?.message || 'Failed to update blog', 'error');
  };

  if (loading || !initialData) {
    return (
      <div className="blog-form-loading">
        <CommonLoader />
      </div>
    );
  }

  return (
    <BlogForm
      mode="edit"
      initialData={initialData}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/cms/blogs')}
      showToast={showToast}
    />
  );
}

export default EditBlogPage;
