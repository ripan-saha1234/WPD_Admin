import { useState } from 'react';
import CommonFileUpload from '../../../components/common-file-upload';
import CommonInput from '../../../components/common-input';
import CommonSelect from '../../../components/common-select';
import CommonTextEditorBox from '../../../components/common-text-editor-box';
import './SiteSettings.css';

const TABS = [
  { id: 'favicon', label: 'Favicon' },
  { id: 'header', label: 'Header' },
  { id: 'footer', label: 'Footer' },
  { id: 'social', label: 'Social Media Links' },
  { id: 'contact', label: 'Contact Info' },
];

const IMAGE_SUPPORT_TEXT = 'Png, Jpg, Jpeg supported | file size: 250 KB';

// Placeholder list — swap with API data when available
const STATE_OPTIONS = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Florida', value: 'florida' },
  { label: 'Georgia', value: 'georgia' },
  { label: 'Illinois', value: 'illinois' },
  { label: 'New York', value: 'new-york' },
  { label: 'Texas', value: 'texas' },
  { label: 'Washington', value: 'washington' },
];

function SiteSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('favicon');
  const [favicon, setFavicon] = useState(null);
  const [headerLogo, setHeaderLogo] = useState(null);
  const [pageHeaderImage, setPageHeaderImage] = useState(null);
  const [footer, setFooter] = useState({
    logo: null,
    appStoreLink: '',
    googlePlayLink: '',
    description: '',
    copyright: '',
    title: '',
    buttonName: '',
    buttonUrl: '',
    buttonDescription: '',
  });

  const updateFooter = (field, value) => {
    setFooter((prev) => ({ ...prev, [field]: value }));
  };

  const [contact, setContact] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    zipcode: '',
    email: '',
    phone: '',
  });

  const updateContact = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  });

  const updateSocialLinks = (field, value) => {
    setSocialLinks((prev) => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'favicon':
        return (
          <div className="site-settings-uploads">
            <div className="site-settings-upload-block">
              <p className="site-settings-upload-label">
                Upload Favicon<span>*</span>
              </p>
              <CommonFileUpload
                acceptedTypes="image"
                placeholder="Drag your Favicon or browse"
                browseText="Browse"
                supportText={IMAGE_SUPPORT_TEXT}
                value={favicon}
                onFilesChange={(file) => setFavicon(file)}
              />
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="site-settings-uploads site-settings-uploads--two">
            <div className="site-settings-upload-block">
              <p className="site-settings-upload-label">
                Header Logo<span>*</span>
              </p>
              <CommonFileUpload
                acceptedTypes="image"
                placeholder="Drag your Logo or browse"
                browseText="Browse"
                supportText={IMAGE_SUPPORT_TEXT}
                value={headerLogo}
                onFilesChange={(file) => setHeaderLogo(file)}
              />
            </div>
            <div className="site-settings-upload-block">
              <p className="site-settings-upload-label">
                Page Header Image<span>*</span>
              </p>
              <CommonFileUpload
                acceptedTypes="image"
                placeholder="Drag your Image or browse"
                browseText="Browse"
                supportText={IMAGE_SUPPORT_TEXT}
                value={pageHeaderImage}
                onFilesChange={(file) => setPageHeaderImage(file)}
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="site-settings-footer-grid">
            <div className="site-settings-footer-col">
              <div className="site-settings-upload-block">
                <p className="site-settings-upload-label">
                  Footer Logo<span>*</span>
                </p>
                <CommonFileUpload
                  acceptedTypes="image"
                  placeholder="Drag your Logo or browse"
                  browseText="Browse"
                  supportText={IMAGE_SUPPORT_TEXT}
                  value={footer.logo}
                  onFilesChange={(file) => updateFooter('logo', file)}
                />
              </div>
              <CommonInput
                label="App Store link"
                name="appStoreLink"
                placeholder="www.appstore.com"
                value={footer.appStoreLink}
                onChange={(e) => updateFooter('appStoreLink', e.target.value)}
              />
              <CommonInput
                label="Google Play link"
                name="googlePlayLink"
                placeholder="www.googleplay.com"
                value={footer.googlePlayLink}
                onChange={(e) => updateFooter('googlePlayLink', e.target.value)}
              />
            </div>

            <div className="site-settings-footer-col">
              <CommonTextEditorBox
                label="Description"
                required
                placeholder="Enter footer description..."
                minHeight="140px"
                value={footer.description}
                onChange={(data) => updateFooter('description', data.html)}
              />
              <CommonInput
                label="Copyright"
                name="copyright"
                required
                multiline
                rows={4}
                placeholder="© 2026 GateLink Event. All rights reserved."
                value={footer.copyright}
                onChange={(e) => updateFooter('copyright', e.target.value)}
              />
            </div>

            <div className="site-settings-footer-col">
              <CommonInput
                label="Title"
                name="footerTitle"
                required
                placeholder="Join as Promorter"
                value={footer.title}
                onChange={(e) => updateFooter('title', e.target.value)}
              />
              <CommonInput
                label="Button name"
                name="footerButtonName"
                required
                placeholder="Join Us"
                value={footer.buttonName}
                onChange={(e) => updateFooter('buttonName', e.target.value)}
              />
              <CommonInput
                label="Button url"
                name="footerButtonUrl"
                required
                placeholder="www.joinus.com"
                value={footer.buttonUrl}
                onChange={(e) => updateFooter('buttonUrl', e.target.value)}
              />
              <CommonTextEditorBox
                label="Description"
                required
                placeholder="Enter description..."
                minHeight="140px"
                value={footer.buttonDescription}
                onChange={(data) => updateFooter('buttonDescription', data.html)}
              />
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="site-settings-contact-grid">
            <CommonInput
              label="Facebook URL"
              name="facebookUrl"
              placeholder="www.facebook.com"
              value={socialLinks.facebook}
              onChange={(e) => updateSocialLinks('facebook', e.target.value)}
            />
            <CommonInput
              label="Instagram URL"
              name="instagramUrl"
              placeholder="www.instagram.com"
              value={socialLinks.instagram}
              onChange={(e) => updateSocialLinks('instagram', e.target.value)}
            />
            <CommonInput
              label="LinkedIn URL"
              name="linkedinUrl"
              placeholder="www.linkedin.com"
              value={socialLinks.linkedin}
              onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
            />
            <CommonInput
              label="Tweeter URL"
              name="twitterUrl"
              placeholder="www.tweeter.com"
              value={socialLinks.twitter}
              onChange={(e) => updateSocialLinks('twitter', e.target.value)}
            />
          </div>
        );

      case 'contact':
        return (
          <div className="site-settings-contact-grid">
            <CommonInput
              label="Address Line 1"
              name="addressLine1"
              required
              placeholder="20 Cooper Square"
              value={contact.addressLine1}
              onChange={(e) => updateContact('addressLine1', e.target.value)}
            />
            <CommonInput
              label="Address Line 2"
              name="addressLine2"
              placeholder="Marquardt Route"
              value={contact.addressLine2}
              onChange={(e) => updateContact('addressLine2', e.target.value)}
            />
            <CommonInput
              label="Landmark"
              name="landmark"
              placeholder="Lake Oscar"
              value={contact.landmark}
              onChange={(e) => updateContact('landmark', e.target.value)}
            />
            <CommonInput
              label="City"
              name="city"
              required
              placeholder="Lake Oscar"
              value={contact.city}
              onChange={(e) => updateContact('city', e.target.value)}
            />
            <CommonSelect
              label="State"
              name="state"
              required
              placeholder="Select state"
              options={STATE_OPTIONS}
              value={contact.state}
              onChange={(e) => updateContact('state', e.target.value)}
            />
            <CommonInput
              label="Zipcode"
              name="zipcode"
              required
              placeholder="62704"
              value={contact.zipcode}
              onChange={(e) => updateContact('zipcode', e.target.value)}
            />
            <CommonInput
              label="Email"
              name="contactEmail"
              type="email"
              required
              placeholder="hello@eventvibe.com"
              value={contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
            />
            <CommonInput
              label="Phn no"
              name="contactPhone"
              required
              placeholder="+1 8973487340"
              value={contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="site-settings-card">
      <button
        type="button"
        className="site-settings-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="site-settings-title">Site Settings</span>
        <span
          className={`site-settings-chevron ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#0690fd"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="site-settings-body">
          <nav className="site-settings-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`site-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="site-settings-content">{renderTabContent()}</div>
        </div>
      )}
    </section>
  );
}

export default SiteSettings;
