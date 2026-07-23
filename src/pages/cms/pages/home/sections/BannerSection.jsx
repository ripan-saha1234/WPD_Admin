import CommonInput from '../../../../../components/common-input';
import CommonFileUpload from '../../../../../components/common-file-upload';
import HomeSectionCard from '../shared/HomeSectionCard';
import '../shared/RepeatableItemCard.css';

function BannerSection({ data, onChange, errors = {} }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <HomeSectionCard
      title="Banner"
      subtitle="Hero heading, subtext, background image, and CTA"
    >
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
