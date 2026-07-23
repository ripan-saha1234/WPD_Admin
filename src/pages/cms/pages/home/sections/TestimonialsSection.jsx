import CommonInput from '../../../../../components/common-input';
import CommonSelect from '../../../../../components/common-select';
import HomeSectionCard from '../shared/HomeSectionCard';
import RepeatableItemCard from '../shared/RepeatableItemCard';
import { createTestimonialItem, reorderList } from '../shared/homeFormUtils';
import '../shared/RepeatableItemCard.css';

const RATING_OPTIONS = [
  { label: '5 Stars', value: 5 },
  { label: '4 Stars', value: 4 },
  { label: '3 Stars', value: 3 },
  { label: '2 Stars', value: 2 },
  { label: '1 Star', value: 1 },
];

function TestimonialsSection({ data, onChange }) {
  const updateField = (field, value) => onChange({ ...data, [field]: value });

  const updateItem = (itemId, patch) => {
    onChange({
      ...data,
      items: data.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      ),
    });
  };

  const addItem = () => {
    onChange({ ...data, items: [...data.items, createTestimonialItem()] });
  };

  const deleteItem = (itemId) => {
    const remaining = data.items.filter((item) => item.id !== itemId);
    onChange({
      ...data,
      items: remaining.length ? remaining : [createTestimonialItem()],
    });
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange({ ...data, items: reorderList(data.items, fromIndex, toIndex) });
  };

  return (
    <HomeSectionCard
      title="Our Testimonials"
      subtitle={`${data.items.length} testimonial${data.items.length === 1 ? '' : 's'}`}
    >
      <CommonInput
        label="Section title"
        name="testimonialsSectionTitle"
        placeholder="Our Testimonials"
        value={data.sectionTitle}
        onChange={(e) => updateField('sectionTitle', e.target.value)}
      />

      <div className="home-items-list">
        {data.items.map((item, index) => (
          <RepeatableItemCard
            key={item.id}
            index={index}
            title={item.authorName.trim() || `Testimonial ${index + 1}`}
            onDelete={() => deleteItem(item.id)}
            onReorder={reorderItems}
          >
            <CommonSelect
              label="Rating"
              name={`testimonial-rating-${item.id}`}
              options={RATING_OPTIONS}
              value={item.rating}
              onChange={(e) =>
                updateItem(item.id, { rating: Number(e.target.value) })
              }
            />
            <CommonInput
              label="Quote"
              name={`testimonial-quote-${item.id}`}
              multiline
              rows={3}
              placeholder="Customer feedback..."
              value={item.quote}
              onChange={(e) => updateItem(item.id, { quote: e.target.value })}
            />
            <div className="home-two-col">
              <CommonInput
                label="Author name"
                name={`testimonial-author-${item.id}`}
                placeholder="Dhiraj Poudel"
                value={item.authorName}
                onChange={(e) =>
                  updateItem(item.id, { authorName: e.target.value })
                }
              />
              <CommonInput
                label="Author role"
                name={`testimonial-role-${item.id}`}
                placeholder="CEO at BSNL"
                value={item.authorRole}
                onChange={(e) =>
                  updateItem(item.id, { authorRole: e.target.value })
                }
              />
            </div>
          </RepeatableItemCard>
        ))}
      </div>

      <button type="button" className="home-add-item-btn" onClick={addItem}>
        + Add Testimonial
      </button>
    </HomeSectionCard>
  );
}

export default TestimonialsSection;
