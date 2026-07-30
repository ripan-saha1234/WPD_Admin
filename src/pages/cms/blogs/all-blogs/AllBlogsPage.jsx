import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import CommonLoader from '../../../../components/common-loader';
import CommonDialog from '../../../../components/common-dialog';
import {
  deleteBlog,
  extractBlogsList,
  getBlogs,
  mapBlogCardFromApi,
} from '../../../../services/blogService';
import BlogCard from './BlogCard';
import './BlogCard.css';

function AllBlogsPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(globalContext);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleteFormData, setDeleteFormData] = useState({});
  const [deleteErrors, setDeleteErrors] = useState({});
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { response, data } = await getBlogs();

      if (!response.ok || data.success === false) {
        showToast(data.message || 'Failed to load blogs', 'error');
        setBlogs([]);
        return;
      }

      setBlogs(extractBlogsList(data).map(mapBlogCardFromApi));
    } catch (error) {
      console.error('Fetch blogs error:', error);
      showToast('Network error. Please try again.', 'error');
      setBlogs([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms' },
      { title: 'Blog', link: '/cms/blogs' },
    ],
    []
  );

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Blog Categories',
        onClick: () => navigate('/cms/blogs/blog-categories'),
        backgroundColor: '#FFFFFF',
        textColor: '#0690fd',
        borderColor: '#0690fd',
      },
      {
        type: 'button',
        text: 'Create a Blog',
        onClick: () => navigate('/cms/blogs/add-blogs'),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    [navigate]
  );

  usePageHeader({
    title: 'Blog',
    breadcrumbs,
    buttons: headerButtons,
  });

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete?.id) return;

    setDeleting(true);
    try {
      const { response, data } = await deleteBlog(blogToDelete.id);

      if (!response.ok || data.success === false) {
        showToast(data.message || 'Failed to delete blog', 'error');
        throw new Error(data.message || 'Delete failed');
      }

      showToast(data.message || 'Blog deleted successfully.', 'success');
      setBlogToDelete(null);
      setDeleteDialogOpen(false);
      await fetchBlogs({ silent: true });
    } catch (error) {
      if (error?.message !== 'Delete failed') {
        console.error('Delete blog error:', error);
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
        text: `Are you sure you want to delete "${blogToDelete?.title ?? ''}"?`,
      },
    ],
    [blogToDelete]
  );

  if (loading) {
    return <CommonLoader text="Loading blogs..." />;
  }

  return (
    <>
      <div className="blog-cards-grid">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onLearnMore={(item) => navigate(`/cms/blogs/edit-blog/${item.id}`)}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <CommonDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete Blog"
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

export default AllBlogsPage;
