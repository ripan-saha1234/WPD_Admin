import CommonInput from '../../../../../components/common-input';
import CommonSelect from '../../../../../components/common-select';
import CommonFileUpload from '../../../../../components/common-file-upload';
import HomeSectionCard from '../shared/HomeSectionCard';
import '../shared/RepeatableItemCard.css';

const BACKGROUND_TYPE_OPTIONS = [
  { label: 'Background Image', value: 'image' },
  { label: 'Background Video', value: 'video' },
];

function BannerSection({ data, onChange, errors = {} }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const backgroundType = data.backgroundType === 'video' ? 'video' : 'image';

  const handleBackgroundTypeChange = (e) => {
    const nextType = e.target.value === 'video' ? 'video' : 'image';
    onChange({ ...data, backgroundType: nextType });
  };

  return (
    <HomeSectionCard
      title="Banner"
      subtitle="Hero heading, subtext, background media, and CTA"
    >
      <CommonSelect
        label="Background type"
        name="bannerBackgroundType"
        options={BACKGROUND_TYPE_OPTIONS}
        value={backgroundType}
        onChange={handleBackgroundTypeChange}
      />

      {backgroundType === 'image' ? (
        <div>
          <p className="home-field-label">Background Image</p>
          <CommonFileUpload
            acceptedTypes="image"
            placeholder="Drop banner background or browse"
            browseText="Browse"
            supportText="Png, Jpg, Jpeg, WebP supported"
            value={data.backgroundImage}
            onFilesChange={(file) => update('backgroundImage', file)}
          />
        </div>
      ) : (
        <div>
          <p className="home-field-label">Background Video</p>
          <CommonFileUpload
            acceptedTypes="video"
            placeholder="Drop banner video or browse"
            browseText="Browse"
            supportText="Mp4, Mov, WebM supported"
            value={data.backgroundVideo}
            onFilesChange={(file) => update('backgroundVideo', file)}
          />
        </div>
      )}

      <CommonInput
        label="Heading"
        name="bannerHeading"
        required
        placeholder="Empowering Your Business With Innovative IT Solutions"
        value={data.heading}
        error={errors.bannerHeading}
        errorMsg="Heading is required"
        onChange={(e) => update('heading', e.target.value)}
      />

      <CommonInput
        label="Subheading"
        name="bannerSubheading"
        multiline
        rows={3}
        placeholder="We specialize in delivering high-quality, scalable and comprehensive business solutions..."
        value={data.subheading}
        onChange={(e) => update('subheading', e.target.value)}
      />

      <div className="home-two-col">
        <CommonInput
          label="Button name"
          name="bannerButtonName"
          placeholder="Book A Call"
          value={data.buttonName}
          onChange={(e) => update('buttonName', e.target.value)}
        />
        <CommonInput
          label="Button URL"
          name="bannerButtonUrl"
          placeholder="https://..."
          value={data.buttonUrl}
          onChange={(e) => update('buttonUrl', e.target.value)}
        />
      </div>
    </HomeSectionCard>
  );
}

export default BannerSection;
