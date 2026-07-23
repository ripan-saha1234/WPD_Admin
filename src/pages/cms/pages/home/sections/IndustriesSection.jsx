import CommonInput from '../../../../../components/common-input';
import CommonFileUpload from '../../../../../components/common-file-upload';
import HomeSectionCard from '../shared/HomeSectionCard';
import RepeatableItemCard from '../shared/RepeatableItemCard';
import { createIndustryItem, reorderList } from '../shared/homeFormUtils';
import '../shared/RepeatableItemCard.css';

function IndustriesSection({ data, onChange }) {
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
    onChange({ ...data, items: [...data.items, createIndustryItem()] });
  };

  const deleteItem = (itemId) => {
    const remaining = data.items.filter((item) => item.id !== itemId);
    onChange({
      ...data,
      items: remaining.length ? remaining : [createIndustryItem()],
    });
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange({ ...data, items: reorderList(data.items, fromIndex, toIndex) });
  };

  return (
    <HomeSectionCard
      title="Industries We Serve"
      subtitle={`${data.items.length} industr${data.items.length === 1 ? 'y' : 'ies'}`}
    >
      <CommonInput
        label="Section title"
        name="industriesSectionTitle"
        placeholder="Industries We Serve"
        value={data.sectionTitle}
        onChange={(e) => updateField('sectionTitle', e.target.value)}
      />

      <div className="home-items-list">
        {data.items.map((item, index) => (
          <RepeatableItemCard
            key={item.id}
            index={index}
            title={item.title.trim() || `Industry ${index + 1}`}
            onDelete={() => deleteItem(item.id)}
            onReorder={reorderItems}
          >
            <CommonInput
              label="Title"
              name={`industry-title-${item.id}`}
              placeholder="Logistics"
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
            />
            <div>
              <p className="home-field-label">Background image</p>
              <CommonFileUpload
                acceptedTypes="image"
                placeholder="Drop industry image or browse"
                browseText="Browse"
                supportText="Png, Jpg, Jpeg, WebP"
                value={item.image}
                onFilesChange={(file) => updateItem(item.id, { image: file })}
              />
            </div>
          </RepeatableItemCard>
        ))}
      </div>

      <button type="button" className="home-add-item-btn" onClick={addItem}>
        + Add Industry
      </button>
    </HomeSectionCard>
  );
}

export default IndustriesSection;
