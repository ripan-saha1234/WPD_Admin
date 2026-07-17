import { useEffect, useRef, useState } from 'react';
import ElementCard from './ElementCard';
import CommonInput from '../../../../../components/common-input';
import './FaqElement.css';

let faqIdCounter = 0;
const nextFaqId = () => `faq-${Date.now()}-${faqIdCounter++}`;

const createFaqItem = () => ({ id: nextFaqId(), question: '', answer: '' });

function FaqElement({ element, onChange, onDelete }) {
  const items = element.data?.items?.length ? element.data.items : null;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const menuRef = useRef(null);

  // Start with one empty FAQ item
  useEffect(() => {
    if (!items) {
      onChange({ items: [createFaqItem()] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const faqItems = items || [];

  const addFaq = () => {
    onChange({ items: [...faqItems, createFaqItem()] });
  };

  const updateFaq = (faqId, patch) => {
    onChange({
      items: faqItems.map((item) =>
        item.id === faqId ? { ...item, ...patch } : item
      ),
    });
  };

  const deleteFaq = (faqId) => {
    const remaining = faqItems.filter((item) => item.id !== faqId);
    // Never leave an empty list — reset to one blank FAQ
    onChange({ items: remaining.length ? remaining : [createFaqItem()] });
    if (expandedId === faqId) setExpandedId(null);
    setOpenMenuId(null);
  };

  return (
    <ElementCard title="FAQ" onDelete={onDelete}>
      <div className="faq-element-list">
        {faqItems.map((item, index) => (
          <div key={item.id} className="faq-element-item">
            <div
              className="faq-element-item-header"
              onClick={() =>
                setExpandedId((current) => (current === item.id ? null : item.id))
              }
            >
              <div className="faq-element-item-left">
                <span className="faq-element-drag" aria-hidden="true">
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <circle cx="2" cy="2" r="1" fill="#8a94a6" />
                    <circle cx="6" cy="2" r="1" fill="#8a94a6" />
                    <circle cx="2" cy="6" r="1" fill="#8a94a6" />
                    <circle cx="6" cy="6" r="1" fill="#8a94a6" />
                    <circle cx="2" cy="10" r="1" fill="#8a94a6" />
                    <circle cx="6" cy="10" r="1" fill="#8a94a6" />
                  </svg>
                </span>
                <span className="faq-element-item-title">
                  {item.question.trim() || `FAQ item ${index + 1}`}
                </span>
              </div>

              <div
                className="faq-element-menu-wrap"
                ref={openMenuId === item.id ? menuRef : null}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="faq-element-dots"
                  aria-label={`Options for FAQ item ${index + 1}`}
                  onClick={() =>
                    setOpenMenuId((current) =>
                      current === item.id ? null : item.id
                    )
                  }
                >
                  <svg width="14" height="4" viewBox="0 0 16 4" fill="none">
                    <circle cx="2" cy="2" r="1.6" fill="#0690fd" />
                    <circle cx="8" cy="2" r="1.6" fill="#0690fd" />
                    <circle cx="14" cy="2" r="1.6" fill="#0690fd" />
                  </svg>
                </button>

                {openMenuId === item.id && (
                  <div className="faq-element-menu">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(item.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteFaq(item.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {expandedId === item.id && (
              <div className="faq-element-item-body">
                <CommonInput
                  label="Question"
                  name={`faq-question-${item.id}`}
                  placeholder="Write the question here"
                  value={item.question}
                  onChange={(e) => updateFaq(item.id, { question: e.target.value })}
                />
                <CommonInput
                  label="Answer"
                  name={`faq-answer-${item.id}`}
                  placeholder="Write the answer here"
                  multiline
                  rows={3}
                  value={item.answer}
                  onChange={(e) => updateFaq(item.id, { answer: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="faq-element-add" onClick={addFaq}>
        Add Faq
      </button>
    </ElementCard>
  );
}

export default FaqElement;
