function ViewSwitcher({ options, value, onChange }) {
  return (
    <div className="rag-view-switcher" role="tablist" aria-label="View mode">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          className={`rag-view-switcher-btn ${value === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.icon && <span className="rag-view-switcher-icon">{option.icon}</span>}
          <span>{option.label}</span>
          {option.hint && <span className="rag-view-switcher-hint">{option.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export default ViewSwitcher;
