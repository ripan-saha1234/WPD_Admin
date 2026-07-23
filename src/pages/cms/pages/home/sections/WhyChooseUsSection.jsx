import { useEffect, useMemo } from 'react';
import CommonInput from '../../../../../components/common-input';
import CommonFileUpload from '../../../../../components/common-file-upload';
import CommonTextEditorBox from '../../../../../components/common-text-editor-box';
import HomeSectionCard from '../shared/HomeSectionCard';
import RepeatableItemCard from '../shared/RepeatableItemCard';
import {
  createWhyFeature,
  normalizeWhyChooseUsBlocks,
  reorderList,
} from '../shared/homeFormUtils';
import '../shared/RepeatableItemCard.css';

function WhyChooseUsSection({ data, onChange }) {
  const blocks = useMemo(
    () => normalizeWhyChooseUsBlocks(data),
    [data]
  );
  const featureCount = blocks.filter((block) => block.type === 'feature').length;

  // Persist migrated blocks if parent still has old intro/features shape
  useEffect(() => {
    const needsSync =
      !Array.isArray(data.blocks) ||
      !data.blocks.some((block) => block.type === 'intro');

    if (needsSync) {
      onChange({ ...data, blocks, intro: undefined, features: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (field, value) => onChange({ ...data, [field]: value });

  const updateBlock = (blockId, patch) => {
    onChange({
      ...data,
      blocks: blocks.map((block) =>
        block.id === blockId ? { ...block, ...patch } : block
      ),
    });
  };

  const addFeature = () => {
    onChange({ ...data, blocks: [...blocks, createWhyFeature()] });
  };

  const deleteBlock = (blockId) => {
    const target = blocks.find((block) => block.id === blockId);
    if (!target || target.type === 'intro') return;

    const remaining = blocks.filter((block) => block.id !== blockId);
    const hasFeature = remaining.some((block) => block.type === 'feature');
    onChange({
      ...data,
      blocks: hasFeature ? remaining : [...remaining, createWhyFeature()],
    });
  };

  const reorderBlocks = (fromIndex, toIndex) => {
    onChange({
      ...data,
      blocks: reorderList(blocks, fromIndex, toIndex),
    });
  };

  return (
    <HomeSectionCard
      title="Why Choose Us"
      subtitle={`${featureCount} feature${featureCount === 1 ? '' : 's'} · intro is draggable`}
    >
      <CommonInput
        label="Section title"
        name="whySectionTitle"
        placeholder="Why Choose Us"
        value={data.sectionTitle}
        onChange={(e) => updateField('sectionTitle', e.target.value)}
      />

      <div>
        <p className="home-field-label">Section image</p>
        <CommonFileUpload
          acceptedTypes="image"
          placeholder="Drop section image or browse"
          browseText="Browse"
          supportText="Png, Jpg, Jpeg, WebP"
          value={data.image}
          onFilesChange={(file) => updateField('image', file)}
        />
      </div>

      <div className="home-items-list">
        {blocks.map((block, index) => {
          if (block.type === 'intro') {
            return (
              <RepeatableItemCard
                key={block.id}
                index={index}
                title="Intro"
                onReorder={reorderBlocks}
              >
                <CommonTextEditorBox
                  label="Intro"
                  placeholder="Write intro text for Why Choose Us..."
                  minHeight="120px"
                  value={block.html || ''}
                  onChange={(editor) =>
                    updateBlock(block.id, { html: editor.html })
                  }
                />
              </RepeatableItemCard>
            );
          }

          const featureNumber = blocks
            .slice(0, index + 1)
            .filter((item) => item.type === 'feature').length;

          return (
            <RepeatableItemCard
              key={block.id}
              index={index}
              title={block.title?.trim() || `Feature ${featureNumber}`}
              onDelete={() => deleteBlock(block.id)}
              onReorder={reorderBlocks}
            >
              <div>
                <p className="home-field-label">Icon</p>
                <CommonFileUpload
                  acceptedTypes="image"
                  placeholder="Drop icon or browse"
                  browseText="Browse"
                  supportText="Png, Jpg, Jpeg, WebP"
                  value={block.icon}
                  onFilesChange={(file) =>
                    updateBlock(block.id, { icon: file })
                  }
                />
              </div>
              <CommonInput
                label="Title"
                name={`why-title-${block.id}`}
                placeholder="Networking Expansion"
                value={block.title || ''}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value })
                }
              />
              <CommonInput
                label="Description"
                name={`why-desc-${block.id}`}
                multiline
                rows={2}
                placeholder="Short feature description"
                value={block.description || ''}
                onChange={(e) =>
                  updateBlock(block.id, { description: e.target.value })
                }
              />
            </RepeatableItemCard>
          );
        })}
      </div>

      <button type="button" className="home-add-item-btn" onClick={addFeature}>
        + Add Feature
      </button>

      <div className="home-two-col">
        <CommonInput
          label="Button name"
          name="whyButtonName"
          placeholder="Learn More"
          value={data.buttonName}
          onChange={(e) => updateField('buttonName', e.target.value)}
        />
        <CommonInput
          label="Button URL"
          name="whyButtonUrl"
          placeholder="https://..."
          value={data.buttonUrl}
          onChange={(e) => updateField('buttonUrl', e.target.value)}
        />
      </div>
    </HomeSectionCard>
  );
}

export default WhyChooseUsSection;
