import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import { getBlogs, deleteBlog } from '../../../../services/blogService';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import BlogCard from './BlogCard';
import './BlogCard.css';
import '../shared/BlogForm.css';

function normalizeBlogs(list) {
  return (list || []).map((blog) => ({
    ...blog,
    categoryName: blog.blog_category?.name || blog.categoryName || 'Blog',
    created_at: blog.created_at || blog.createdAt || '—',
  }));
}

function AllBlogsPage() {
  const { showToast } = useContext(globalContext);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerButtons = useMemo(
    () => [
      {
        type: 'button',
        text: 'Add Blog',
        onClick: () => navigate('/cms/blogs/add-blogs'),
        backgroundColor: '#0690fd',
        textColor: '#FFFFFF',
        borderColor: '#0690fd',
      },
    ],
    [navigate]
  );

  const breadcrumbs = useMemo(
    () => [
      { title: 'CMS', link: '/cms/blogs' },
      { title: 'Blogs', link: '/cms/blogs' },
    ],
    []
  );

  usePageHeader({
    title: 'All Blogs',
    breadcrumbs,
    buttons: headerButtons,
  });

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    const { data } = await getBlogs();
    if (data?.success) {
      const list = Array.isArray(data.data) ? data.data : data.data?.data || [];
      setBlogs(normalizeBlogs(list));
    } else {
      showToast(data?.message || 'Failed to load blogs', 'error');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const openBlog = (blog) => {
    navigate(`/cms/blogs/edit-blog/${blog.id}`);
  };

  const handleDelete = async (blog) => {
    const confirmed = window.confirm(`Delete blog "${blog.name}"?`);
    if (!confirmed) return;

    const { data } = await deleteBlog(blog.id);
    if (data?.success) {
      showToast('Blog deleted', 'success');
      loadBlogs();
    } else {
      showToast(data?.message || 'Failed to delete blog', 'error');
    }
  };

  return (
    <div className="cms-blogs-page">
      {loading ? (
        <p className="cms-blogs-muted">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="blog-cards-empty">No blogs yet. Click Add Blog to create one.</p>
      ) : (
        <div className="blog-cards-grid">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onLearnMore={openBlog}
              onEdit={openBlog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllBlogsPage;
