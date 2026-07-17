import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageHeader } from '../../../../hooks/usePageHeader';
import BlogCard from './BlogCard';
import './BlogCard.css';

const SAMPLE_BLOGS = [
  {
    id: '1',
    title: 'The Role of IT in Modern Businesses',
    category: 'Tech Blog',
    date: '12/6/2024',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    thumbnail:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'The Role of IT in Modern Businesses',
    category: 'Cloud Computing',
    date: '12/6/2024',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    thumbnail:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'The Role of IT in Modern Businesses',
    category: 'AI & ML',
    date: '12/6/2024',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    thumbnail:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'The Role of IT in Modern Businesses',
    category: 'Tech Blog',
    date: '12/6/2024',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...',
    thumbnail:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
  },
];

function AllBlogsPage() {
  const navigate = useNavigate();

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

  return (
    <div className="blog-cards-grid">
      {SAMPLE_BLOGS.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}

export default AllBlogsPage;
