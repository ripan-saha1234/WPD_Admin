function StatCard({ icon, label, value }) {
  return (
    <div className="rag-stat-card">
      <div className="rag-stat-icon">{icon}</div>
      <div className="rag-stat-info">
        <h3>{label}</h3>
        <div className="rag-stat-value">{value ?? '-'}</div>
      </div>
    </div>
  );
}

export default StatCard;
