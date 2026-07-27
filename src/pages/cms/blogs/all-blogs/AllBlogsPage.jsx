import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../../context/context';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import CommonLoader from '../../../../components/common-loader';
import {
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

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoading(true);
      try {
        const { response, data } = await getBlogs();

        if (cancelled) return;

        if (!response.ok || data.success === false) {
          showToast(data.message || 'Failed to load blogs', 'error');
          setBlogs([]);
          return;
        }

        setBlogs(extractBlogsList(data).map(mapBlogCardFromApi));
      } catch (error) {
        if (cancelled) return;
        console.error('Fetch blogs error:', error);
        showToast('Network error. Please try again.', 'error');
        setBlogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

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

  if (loading) {
    return <CommonLoader text="Loading blogs..." />;
  }

  return (
    <div className="blog-cards-grid">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onLearnMore={(item) => navigate(`/cms/blogs/edit-blog/${item.id}`)}
        />
      ))}
    </div>
  );
}

export default AllBlogsPage;
