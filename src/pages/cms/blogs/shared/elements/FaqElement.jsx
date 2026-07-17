import ElementCard from './ElementCard';

// Design pending — will be built when the FAQ element design is shared
function FaqElement({ element, onChange, onDelete }) {
  return (
    <ElementCard title="FAQ" onDelete={onDelete}>
      <div className="blog-element-pending">FAQ element — design coming soon</div>
    </ElementCard>
  );
}

export default FaqElement;
