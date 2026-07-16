import '../css/common-button.css';
function CommonButton({ text = '', img = '', backgroundColor, color, borderColor, onClick = () => { }, className = '', disabled = false }) {
  return (
    <button
      type="button"
      className={`common-button ${className} ${disabled ? 'disabled' : ''}`}
      style={{
        backgroundColor: backgroundColor,
        color: color,
        borderColor: borderColor
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {img && <img src={img} alt="" />}
      {text && text}
    </button>
  );
}

export default CommonButton;