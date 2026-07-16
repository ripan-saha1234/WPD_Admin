import { useState, useRef, useEffect } from "react";
import '../css/common-select.css';

const CommonSelect = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error = false,
  errorMsg = 'This field is required',
  disabled = false,
  className = '',
  options = [],
  half = false,
  placeholder = 'Select an option',
  multiselect = false,
  classNameForDialog = '',
  classNameForDialogLabel = '',
  halfStyleDialog = {},
  halfStyleDialogLabel = {},
  searchPlaceholder = 'Search ....',
  ...rest
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(multiselect ? (Array.isArray(value) ? value : []) : value);
  const selectRef = useRef(null);
  const optionsContainerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    // Update internal state when value prop changes
    setSelectedValues(multiselect ? (Array.isArray(value) ? value : []) : value);
  }, [value, multiselect]);

  useEffect(() => {
    // Add click outside listener to close dropdown
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const toggleOptions = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setFilteredOptions(options);
      }
    }
  };

  const handleOptionClick = (optionValue) => {
    if (multiselect) {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(val => val !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newSelectedValues);

      // Create synthetic event object similar to what native select would provide
      const syntheticEvent = {
        target: {
          name,
          value: newSelectedValues
        }
      };

      onChange(syntheticEvent);
    } else {
      setSelectedValues(optionValue);
      setIsOpen(false);
      setSearchTerm('');

      // Create synthetic event object similar to what native select would provide
      const syntheticEvent = {
        target: {
          name,
          value: optionValue
        }
      };

      onChange(syntheticEvent);
    }
  };

  const isOptionSelected = (optionValue) => {
    return multiselect
      ? selectedValues.includes(optionValue)
      : selectedValues === optionValue;
  };

  // Sort options to bring selected ones to the top
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aSelected = isOptionSelected(a.value);
    const bSelected = isOptionSelected(b.value);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  // Get display text for the selected option(s)
  const getDisplayValue = () => {
    if (multiselect) {
      if (!selectedValues.length) return placeholder;

      const selectedOptions = options.filter(option =>
        selectedValues.includes(option.value)
      );

      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      else if (selectedOptions.length <= 7) {
        return selectedOptions.map(option => option.label).join(' | ');
      } else {
        const firstFiveLabels = selectedOptions.slice(0, 7).map(option => option.label).join(' | ');
        return `${firstFiveLabels} ...`;
      }

      // return `${selectedOptions[0].label} +${selectedOptions.length - 1}`;
    } else {
      if (!selectedValues) return placeholder;

      const selectedOption = options.find(option => option.value === selectedValues);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const showError = error && isTouched;

  const handleSearchChange = (e) => {
    // Stop event propagation to prevent dropdown from closing
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`common-select-wrapper`} ref={selectRef}>
      {label && (
        <label
          htmlFor={name}
          className={`common-select-label ${classNameForDialogLabel} ${half ? 'extra-css' : ''} ${required ? 'required' : ''}`}
          style={halfStyleDialogLabel}
        >
          {label}
        </label>
      )}

      <div
        className={`common-select custom-select ${showError ? 'error' : ''} ${disabled ? 'disabled' : ''} ${className} ${classNameForDialog}`}
        onClick={toggleOptions}
        style={halfStyleDialog}
      >
        <div className="selected-option">
          {getDisplayValue()}
        </div>
        <div className={`arrow-icon ${isOpen ? 'open' : ''}`}></div>
      </div>

      {isOpen && (
        <div
          className="custom-options-container"
          ref={optionsContainerRef}
        >
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="common-select-search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="custom-options-container-container">
            {sortedOptions.length > 0 ? (
              sortedOptions.map((option) => (
                <div
                  key={option.value}
                  className={`custom-option ${isOptionSelected(option.value) ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(option.value)}
                >
                  <span className="option-label">{option.label}</span>
                  {isOptionSelected(option.value) && (
                    <span className="option-tick"><img src="/tick-icon.svg" alt="" /></span>
                  )}
                </div>
              ))
            ) : (
              <div className="no-options-message">No matching options</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden native select for form submission if needed */}
      <select
        name={name}
        value={value}
        onChange={() => { }} // Handled by custom implementation
        required={required}
        className="hidden-select"
        disabled={disabled}
        multiple={multiselect}
        {...rest}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {showError && (
        <span className="error-message">{errorMsg}</span>
      )}
    </div>
  );
};

export default CommonSelect;