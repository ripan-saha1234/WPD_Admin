import CommonInput from '../../../../../components/common-input';
import CommonFileUpload from '../../../../../components/common-file-upload';
import HomeSectionCard from '../shared/HomeSectionCard';
import RepeatableItemCard from '../shared/RepeatableItemCard';
import {
  createServiceItem,
  reorderList,
} from '../shared/homeFormUtils';
import '../shared/RepeatableItemCard.css';

function ServicesSection({ data, onChange }) {
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
    onChange({ ...data, items: [...data.items, createServiceItem()] });
  };

  const deleteItem = (itemId) => {
    const remaining = data.items.filter((item) => item.id !== itemId);
    onChange({
      ...data,
      items: remaining.length ? remaining : [createServiceItem()],
    });
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange({ ...data, items: reorderList(data.items, fromIndex, toIndex) });
  };

  return (
    <HomeSectionCard
      title="Our Services"
      subtitle={`${data.items.length} service card${data.items.length === 1 ? '' : 's'}`}
    >
      <CommonInput
        label="Section title"
        name="servicesSectionTitle"
        placeholder="Our Services"
        value={data.sectionTitle}
        onChange={(e) => updateField('sectionTitle', e.target.value)}
      />

      <div className="home-items-list">
        {data.items.map((item, index) => (
          <RepeatableItemCard
            key={item.id}
            index={index}
            title={item.title.trim() || `Service ${index + 1}`}
            onDelete={() => deleteItem(item.id)}
            onReorder={reorderItems}
          >
            <CommonInput
              label="Title"
              name={`service-title-${item.id}`}
              placeholder="QA & Testing"
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
            />
            <CommonInput
              label="Description"
              name={`service-desc-${item.id}`}
              multiline
              rows={3}
              placeholder="Short service description"
              value={item.description}
              onChange={(e) =>
                updateItem(item.id, { description: e.target.value })
              }
            />
            <div className="home-two-col">
              <div>
                <p className="home-field-label">Icon</p>
                <CommonFileUpload
                  acceptedTypes="image"
                  placeholder="Drop icon or browse"
                  browseText="Browse"
                  supportText="Png, Jpg, Jpeg, WebP"
                  value={item.icon}
                  onFilesChange={(file) => updateItem(item.id, { icon: file })}
                />
              </div>
              <div>
                <p className="home-field-label">Featured image</p>
                <CommonFileUpload
                  acceptedTypes="image"
                  placeholder="Drop image or browse"
                  browseText="Browse"
                  supportText="Png, Jpg, Jpeg, WebP"
                  value={item.image}
                  onFilesChange={(file) => updateItem(item.id, { image: file })}
                />
              </div>
            </div>
          </RepeatableItemCard>
        ))}
      </div>

      <button type="button" className="home-add-item-btn" onClick={addItem}>
        + Add Service
      </button>
    </HomeSectionCard>
  );
}

export default ServicesSection;
