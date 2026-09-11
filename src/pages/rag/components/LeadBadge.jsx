function LeadBadge({ type, className = '' }) {
  if (!type) return null;
  return (
    <span className={`rag-lead-badge rag-lead-badge--${type} ${className}`}>
      {type}
    </span>
  );
}

export default LeadBadge;
