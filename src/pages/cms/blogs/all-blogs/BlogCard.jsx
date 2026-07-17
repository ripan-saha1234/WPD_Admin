import './BlogCard.css';

function BlogCard({ blog, onLearnMore }) {
  return (
    <article className="blog-card">
      <div className="blog-card-media">
        {blog.thumbnail ? (
          <img src={blog.thumbnail} alt={blog.title} className="blog-card-image" />
        ) : (
          <div className="blog-card-image blog-card-image--placeholder" />
        )}
        {blog.category && (
          <span className="blog-card-category">{blog.category}</span>
        )}
      </div>

      <div className="blog-card-body">
        <div className="blog-card-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="#8a8a8a" strokeWidth="1.6" />
            <path d="M3 9H21" stroke="#8a8a8a" strokeWidth="1.6" />
            <path d="M8 3V7M16 3V7" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{blog.date}</span>
        </div>

        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-excerpt">{blog.excerpt}</p>

        <button
          type="button"
          className="blog-card-link"
          onClick={() => onLearnMore?.(blog)}
        >
          Learn More
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

export default BlogCard;
