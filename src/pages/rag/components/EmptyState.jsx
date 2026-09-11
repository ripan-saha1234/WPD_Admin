function EmptyState({ icon = '📭', message = 'No data found.', className = '' }) {
  return (
    <div className={`rag-empty-state ${className}`}>
      {icon && <div className="rag-empty-icon">{icon}</div>}
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
