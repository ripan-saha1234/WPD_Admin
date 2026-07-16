import './BlogCard.css';

function BlogCard({ blog, onLearnMore, onEdit, onDelete }) {
  const imageSrc = blog.thumbnail_image || '/login-image.svg';
  const category = blog.categoryName || blog.blog_category?.name || 'Blog';

  return (
    <article className="blog-card">
      <div className="blog-card-media">
        <img
          className="blog-card-image"
          src={imageSrc}
          alt={blog.name || 'Blog thumbnail'}
          onError={(e) => {
            e.currentTarget.src = '/login-image.svg';
          }}
        />
        <span className="blog-card-badge">{category}</span>
        <div className="blog-card-actions">
          <button
            type="button"
            className="blog-card-icon-btn"
            title="Edit"
            onClick={() => onEdit?.(blog)}
          >
            <img src="/edit-icon.svg" alt="" />
          </button>
          <button
            type="button"
            className="blog-card-icon-btn"
            title="Delete"
            onClick={() => onDelete?.(blog)}
          >
            <img src="/delete-icon.svg" alt="" />
          </button>
        </div>
      </div>

      <div className="blog-card-body">
        <h3 className="blog-card-title" title={blog.name}>
          {blog.name}
        </h3>
      </div>

      <div className="blog-card-footer">
        <button
          type="button"
          className="blog-card-learn-more"
          onClick={() => onLearnMore?.(blog)}
        >
          Learn More
        </button>
      </div>
    </article>
  );
}

export default BlogCard;
