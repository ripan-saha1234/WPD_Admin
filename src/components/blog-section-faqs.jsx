import CommonInput from './common-input';
import CommonButton from './common-button';
import '../css/blog-section-faqs.css';

export const createEmptyBlogFaq = () => ({
  id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  heading: '',
  description: '',
  errors: {
    heading: false,
    description: false
  }
});

function BlogSectionFaqs({ faqs = [], onChange = () => { } }) {
  const faqList = faqs.length > 0 ? faqs : [createEmptyBlogFaq()];

  const handleFaqChange = (faqId, field, value) => {
    onChange(
      faqList.map((faq) =>
        faq.id === faqId
          ? {
            ...faq,
            [field]: value,
            errors: {
              ...faq.errors,
              [field]: false
            }
          }
          : faq
      )
    );
  };

  const handleAddFaq = () => {
    onChange([...faqList, createEmptyBlogFaq()]);
  };

  const handleDeleteFaq = (faqId) => {
    if (faqList.length <= 1) {
      onChange([createEmptyBlogFaq()]);
      return;
    }
    onChange(faqList.filter((faq) => faq.id !== faqId));
  };

  return (
    <div className="blog-section-faqs">
      {faqList.map((faq, index) => (
        <div key={faq.id} className="blog-section-faqs-container">
          <p className="blog-section-faqs-label">FAQ {index + 1}</p>
          <div className="blog-section-faqs-input-container">
            <CommonInput
              label="Heading"
              name={`faq-heading-${faq.id}`}
              type="text"
              value={faq.heading}
              onChange={(e) => handleFaqChange(faq.id, 'heading', e.target.value)}
              required
              error={faq.errors?.heading}
              errorMsg="Heading is required"
              placeholder="Enter Heading"
              className="blog-section-faqs-extra-input-css"
            />
            <CommonInput
              label="Description"
              name={`faq-description-${faq.id}`}
              type="text"
              value={faq.description}
              onChange={(e) => handleFaqChange(faq.id, 'description', e.target.value)}
              required
              error={faq.errors?.description}
              errorMsg="Description is required"
              placeholder="Enter Description"
              className="blog-section-faqs-extra-input-css"
              multiline={true}
              rows={4}
            />
          </div>
          <button
            type="button"
            className="blog-section-faqs-delete-icon-container"
            onClick={() => handleDeleteFaq(faq.id)}
            title="Delete FAQ"
          >
            <img src="/cross-icon.svg" alt="Delete FAQ" />
          </button>
        </div>
      ))}

      <CommonButton
        text="Add Another Option"
        onClick={handleAddFaq}
        backgroundColor="transparent"
        color="#0690fd"
        borderColor="#0690fd"
      />
    </div>
  );
}

export default BlogSectionFaqs;
