import { useRef, useState } from 'react';
import CommonButton from '../../components/common-button';
import { useClickOutside } from './hooks/useClickOutside';

function HeaderSearch({ item, index }) {
  return (
    <div key={`search-${index}`} className="common-layout-header-icon-search-container">
      <img src="/search-icon.svg" alt="" />
      <input
        type={item.inputType}
        name={item.name}
        value={item.value}
        placeholder="Search..."
        className="common-layout-header-icon-search-input"
        onChange={item.onChange}
      />
    </div>
  );
}

function HeaderDropdown({ item, index, dropdownOpen, setDropdownOpen, dropdownRef }) {
  return (
    <div
      key={index}
      ref={dropdownRef}
      className="common-layout-header-icon-dropdown-container"
      onClick={() => setDropdownOpen((open) => !open)}
    >
      <img src="/triple-dot-icon.svg" alt="" />
      {dropdownOpen && (
        <div className="common-layout-header-icon-dropdown-items-container">
          {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
            <button
              key={dropdownIndex}
              type="button"
              onClick={() => {
                dropdownItem.onClick();
                setDropdownOpen(false);
              }}
            >
              {dropdownItem.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeaderAction({ item, index, dropdownState }) {
  switch (item.type) {
    case 'button':
      return (
        <CommonButton
          key={index}
          text={item.text}
          img={item.img || ''}
          onClick={item.onClick}
          backgroundColor={item.backgroundColor}
          color={item.textColor}
          borderColor={item.borderColor}
          disabled={item.disabled}
        />
      );
    case 'search':
      return <HeaderSearch item={item} index={index} />;
    case 'dropdown':
      return (
        <HeaderDropdown
          item={item}
          index={index}
          {...dropdownState}
        />
      );
    case 'select':
      return (
        <div key={index} className="common-layout-header-select-container">
          <select
            name={item.name}
            value={item.value}
            onChange={item.onChange}
            className="common-layout-header-select"
          >
            {item.options?.map((option, optIndex) => (
              <option key={optIndex} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'icon':
      return (
        <div key={index} className="common-layout-header-icon-button">
          <img src={item.img} alt="" onClick={item.onClick} />
        </div>
      );
    default:
      return null;
  }
}

function HeaderActions({ items }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false), dropdownOpen);

  if (!items?.length) return null;

  const dropdownState = { dropdownOpen, setDropdownOpen, dropdownRef };

  return (
    <div className="common-layout-header-icon-container">
      {items.map((item, index) => (
        <HeaderAction
          key={index}
          item={item}
          index={index}
          dropdownState={dropdownState}
        />
      ))}
    </div>
  );
}

export default HeaderActions;
