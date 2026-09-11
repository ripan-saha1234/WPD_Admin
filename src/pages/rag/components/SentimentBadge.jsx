function SentimentBadge({ sentiment, className = '' }) {
  if (!sentiment) return null;
  return (
    <span
      className={`rag-sentiment-badge rag-sentiment-badge--${sentiment} ${className}`}
    >
      {sentiment}
    </span>
  );
}

export default SentimentBadge;
