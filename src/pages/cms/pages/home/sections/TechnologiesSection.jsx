import CommonInput from '../../../../../components/common-input';
import CommonFileUpload from '../../../../../components/common-file-upload';
import HomeSectionCard from '../shared/HomeSectionCard';
import RepeatableItemCard from '../shared/RepeatableItemCard';
import { createTechnologyItem, reorderList } from '../shared/homeFormUtils';
import '../shared/RepeatableItemCard.css';

function TechnologiesSection({ data, onChange }) {
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
    onChange({ ...data, items: [...data.items, createTechnologyItem()] });
  };

  const deleteItem = (itemId) => {
    const remaining = data.items.filter((item) => item.id !== itemId);
    onChange({
      ...data,
      items: remaining.length ? remaining : [createTechnologyItem()],
    });
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange({ ...data, items: reorderList(data.items, fromIndex, toIndex) });
  };

  return (
    <HomeSectionCard
      title="Technologies We Use"
      subtitle={`${data.items.length} technolog${data.items.length === 1 ? 'y' : 'ies'}`}
    >
      <CommonInput
        label="Section title"
        name="technologiesSectionTitle"
        placeholder="Technologies We Use"
        value={data.sectionTitle}
        onChange={(e) => updateField('sectionTitle', e.target.value)}
      />

      <div className="home-items-list">
        {data.items.map((item, index) => (
          <RepeatableItemCard
            key={item.id}
            index={index}
            title={item.name.trim() || `Technology ${index + 1}`}
            onDelete={() => deleteItem(item.id)}
            onReorder={reorderItems}
          >
            <CommonInput
              label="Name"
              name={`tech-name-${item.id}`}
              placeholder="React"
              value={item.name}
              onChange={(e) => updateItem(item.id, { name: e.target.value })}
            />
            <div>
              <p className="home-field-label">Icon</p>
              <CommonFileUpload
                acceptedTypes="image"
                placeholder="Drop technology icon or browse"
                browseText="Browse"
                supportText="Png, Jpg, Jpeg, WebP, Svg"
                value={item.icon}
                onFilesChange={(file) => updateItem(item.id, { icon: file })}
              />
            </div>
          </RepeatableItemCard>
        ))}
      </div>

      <button type="button" className="home-add-item-btn" onClick={addItem}>
        + Add Technology
      </button>
    </HomeSectionCard>
  );
}

export default TechnologiesSection;
