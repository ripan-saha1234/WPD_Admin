// import { useEffect, useState } from "react";
// import '../css/common-input.css';

// const CommonInput = ({
//   label,
//   name,
//   value = '',
//   onChange,
//   type = 'text',
//   required = false,
//   error = false,
//   errorMsg = 'This field is required',
//   placeholder = '',
//   disabled = false,
//   multiline = false,
//   rows = 1,
//   className = '',
//   half = false,
//   accept,
//   onUpload,
//   multiple = false,
//   imagePosition = 'below', // 'below' or 'beside'
//   imageSize = 'small', // 'small', 'medium', or 'large'
//   fileIconUrl = '',
//   msg = '',
//   viewImage = false, // New prop for file preview behavior
//   displayText = 'Click to view uploaded files', // New prop for display text
//   min, // New prop for minimum value of number input
//   max, // New prop for maximum value of number input
//   dialogStyleLabel = {},
//   ...rest
// }) => {
//   const [isTouched, setIsTouched] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [fileTypes, setFileTypes] = useState([]); // Track file types: 'image' or 'video'
//   const [countryCode, setCountryCode] = useState('+1'); // Default country code
//   const [showPreview, setShowPreview] = useState(false);
//   const [validationError, setValidationError] = useState('');

//   // Common country codes for phone numbers
//   const countryCodes = [
//     '+1', // USA & Canada
//     '+44', // UK
//     '+91', // India
//     '+61', // Australia
//     '+33', // France
//     '+49', // Germany
//     '+86', // China
//     '+81', // Japan
//     '+7', // Russia
//     '+55', // Brazil
//     '+52', // Mexico
//     '+34', // Spain
//     '+39', // Italy
//     '+82', // South Korea
//     '+65', // Singapore
//     '+971', // UAE
//   ];

//   // Handle initial value if it's a URL for file input
//   useEffect(() => {
//     if (type === 'file' && value) {
//       // Handle case where value is a string URL
//       if (typeof value === 'string') {
//         const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
//         const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(value);
//         const isCsv = /\.csv$/i.test(value);
//         // const fileType = isImage ? 'image' : isVideo ? 'video' : 'other';

//         let fileType = 'other';
//         if (isImage) fileType = 'image';
//         else if (isVideo) fileType = 'video';
//         else if (isCsv) fileType = 'csv';

//         if (fileType !== 'other') {
//           setPreviewUrls([value]);
//           setFileTypes([fileType]);
//           // Don't set selectedFiles since we don't have the actual File object
//         }
//       }
//       // Handle case where value is an array of URL strings
//       else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
//         const urls = [];
//         const types = [];

//         value.forEach(url => {
//           if (typeof url === 'string') {
//             const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
//             const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
//             const fileType = isImage ? 'image' : isVideo ? 'video' : 'other';

//             if (fileType !== 'other') {
//               urls.push(url);
//               types.push(fileType);
//             }
//           }
//         });

//         setPreviewUrls(urls);
//         setFileTypes(types);
//       }
//       // Handle case where value is already a File or array of Files
//       else if (value instanceof File || (Array.isArray(value) && value[0] instanceof File)) {
//         const files = Array.isArray(value) ? value : [value];
//         setSelectedFiles(files);

//         // Create preview URLs for the files
//         const newPreviewData = files.map(file => {
//           const url = URL.createObjectURL(file);
//           const type = file.type.startsWith('image/') ? 'image' :
//             file.type.startsWith('video/') ? 'video' : 'other';
//           return { url, type };
//         });

//         // Filter out non-media files from previews
//         const validPreviews = newPreviewData.filter(item => item.type === 'image' || item.type === 'video');

//         setPreviewUrls(validPreviews.map(item => item.url));
//         setFileTypes(validPreviews.map(item => item.type));
//       }
//     }
//   }, [type, value]);

//   // Cleanup object URLs when component unmounts
//   useEffect(() => {
//     return () => {
//       // Only revoke URLs that we created with createObjectURL (not external URLs)
//       previewUrls.forEach((url) => {
//         if (url.startsWith('blob:')) {
//           URL.revokeObjectURL(url);
//         }
//       });
//     };
//   }, []);

//   // Validate email format
//   const validateEmail = (email) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(email);
//   };

//   // Validate phone number (10 digits)
//   const validatePhone = (phone) => {
//     // Extract just the digits from the phone number
//     const digitsOnly = phone.replace(/\D/g, '');
//     return digitsOnly.length === 10;
//   };

//   // Validate number input against min and max constraints
//   const validateNumberInput = (value) => {
//     if (value === '' || value === null || value === undefined) return true;

//     const numValue = Number(value);

//     if (isNaN(numValue)) return false;

//     if (min !== undefined && numValue < min) {
//       return false;
//     }

//     if (max !== undefined && numValue > max) {
//       return false;
//     }

//     return true;
//   };

//   const handleBlur = () => {
//     setIsTouched(true);

//     // Validate on blur
//     if (type === 'email' && value) {
//       if (!validateEmail(value)) {
//         setValidationError('Please enter a valid email address (e.g., example@domain.com)');
//       } else {
//         setValidationError('');
//       }
//     } else if (type === 'phone' && value) {
//       // Extract the phone part without country code
//       const phoneNumberOnly = typeof value === 'string' ? value.replace(/^\+\d+\s*/, '') : '';

//       if (!validatePhone(phoneNumberOnly)) {
//         setValidationError('Phone number must be 10 digits');
//       } else {
//         setValidationError('');
//       }
//     } else if (type === 'number' && value !== '') {
//       if (!validateNumberInput(value)) {
//         let errorMsg = 'Please enter a valid number';

//         if (min !== undefined && max !== undefined) {
//           errorMsg = `Value must be between ${min} and ${max}`;
//         } else if (min !== undefined) {
//           errorMsg = `Value must be at least ${min}`;
//         } else if (max !== undefined) {
//           errorMsg = `Value must be at most ${max}`;
//         }

//         setValidationError(errorMsg);
//       } else {
//         setValidationError('');
//       }
//     }
//   };

//   // Handle input change with validation
//   const handleInputChange = (e) => {
//     const inputValue = e.target.value;

//     // Perform validation
//     if (type === 'email') {
//       if (inputValue && !validateEmail(inputValue)) {
//         setValidationError('Please enter a valid email address (e.g., example@domain.com)');
//       } else {
//         setValidationError('');
//       }
//     } else if (type === 'number') {
//       if (inputValue !== '' && !validateNumberInput(inputValue)) {
//         let errorMsg = 'Please enter a valid number';

//         if (min !== undefined && max !== undefined) {
//           errorMsg = `Value must be between ${min} and ${max}`;
//         } else if (min !== undefined) {
//           errorMsg = `Value must be at least ${min}`;
//         } else if (max !== undefined) {
//           errorMsg = `Value must be at most ${max}`;
//         }

//         setValidationError(errorMsg);
//       } else {
//         setValidationError('');
//       }
//     }

//     // Call the original onChange handler
//     if (onChange) {
//       onChange(e);
//     }
//   };

//   const showError = (error || validationError) && isTouched;
//   const displayErrorMsg = validationError || errorMsg;

//   const handleFileChange = (event) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const files = Array.from(event.target.files);

//       // If not multiple, only keep the first file
//       const newFiles = multiple ? files : [files[0]];

//       // Create preview URLs for images, videos, and identify CSV files
//       const newPreviewData = newFiles.map(file => {
//         const url = URL.createObjectURL(file);
//         let type = 'other';

//         if (file.type.startsWith('image/')) {
//           type = 'image';
//         } else if (file.type.startsWith('video/')) {
//           type = 'video';
//         } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
//           type = 'csv';
//         }

//         return {
//           url,
//           type,
//           name: file.name // Store the filename for display purposes
//         };
//       });

//       // Include CSV files in valid previews
//       const validPreviews = newPreviewData.filter(item =>
//         item.type === 'image' || item.type === 'video' || item.type === 'csv'
//       );

//       // Update state
//       setSelectedFiles(newFiles);
//       setPreviewUrls(validPreviews.map(item => item.url));
//       setFileTypes(validPreviews.map(item => item.type));

//       // Call the parent onChange handler if provided
//       if (onChange) {
//         onChange({
//           target: {
//             name,
//             value: multiple ? newFiles : newFiles[0],
//           },
//         });
//       }
//     }
//   };

//   const handleUpload = () => {
//     if (selectedFiles.length > 0 && onUpload) {
//       onUpload(multiple ? selectedFiles : selectedFiles[0]);
//     }
//   };

//   const removeFile = (index) => {
//     // Create new arrays without the file at the specified index
//     const newSelectedFiles = [...selectedFiles];
//     const newPreviewUrls = [...previewUrls];
//     const newFileTypes = [...fileTypes];

//     // Revoke object URL to avoid memory leaks
//     if (newPreviewUrls[index] && newPreviewUrls[index].startsWith('blob:')) {
//       URL.revokeObjectURL(newPreviewUrls[index]);
//     }

//     newSelectedFiles.splice(index, 1);
//     newPreviewUrls.splice(index, 1);
//     newFileTypes.splice(index, 1);

//     setSelectedFiles(newSelectedFiles);
//     setPreviewUrls(newPreviewUrls);
//     setFileTypes(newFileTypes);

//     // Call the parent onChange handler if provided
//     if (onChange) {
//       onChange({
//         target: {
//           name,
//           value: multiple ? newSelectedFiles : newSelectedFiles[0] || null,
//         },
//       });
//     }
//   };

//   // Handler for toggling preview visibility
//   const togglePreviewVisibility = () => {
//     if (viewImage && previewUrls.length > 0) {
//       setShowPreview(true);

//       // Auto-hide preview after 3 seconds
//       setTimeout(() => {
//         setShowPreview(false);
//       }, 3000);
//     }
//   };

//   // Handler for country code changes
//   const handleCountryCodeChange = (e) => {
//     setCountryCode(e.target.value);

//     // If there's a parent onChange, call it with the combined value
//     if (onChange && value) {
//       const phoneNumberOnly = typeof value === 'string' ?
//         value.replace(/^\+\d+\s*/, '') : '';

//       onChange({
//         target: {
//           name,
//           value: `${e.target.value} ${phoneNumberOnly}`,
//         },
//       });
//     }
//   };

//   // Handler for phone number input changes
//   const handlePhoneNumberChange = (e) => {
//     const phoneNumberOnly = e.target.value;

//     // Validate phone number (10 digits)
//     if (phoneNumberOnly) {
//       const digitsOnly = phoneNumberOnly.replace(/\D/g, '');
//       if (digitsOnly.length !== 10) {
//         setValidationError('Phone number must be 10 digits');
//       } else {
//         setValidationError('');
//       }
//     } else {
//       setValidationError('');
//     }

//     if (onChange) {
//       onChange({
//         target: {
//           name,
//           value: `${countryCode} ${phoneNumberOnly}`,
//         },
//       });
//     }
//   };

//   const inputProps = {
//     name,
//     value,
//     onChange: type === 'file'
//       ? handleFileChange
//       : (type === 'email' || type === 'number')
//         ? handleInputChange
//         : onChange,
//     placeholder,
//     disabled,
//     required: required || false,
//     multiple: type === 'file' ? multiple : undefined,
//     // Add min and max attributes for number inputs
//     ...(type === 'number' && min !== undefined ? { min } : {}),
//     ...(type === 'number' && max !== undefined ? { max } : {}),
//     ...rest
//   };

//   // Get the appropriate media preview class based on size
//   const getMediaPreviewSizeClass = () => {
//     switch (imageSize) {
//       case 'medium':
//         return 'common-input-image-preview-medium';
//       case 'large':
//         return 'common-input-image-preview-large';
//       case 'small':
//       default:
//         return '';
//     }
//   };

//   // Render file upload input
//   if (type === 'file') {
//     // Default accept to images and videos if not specified
//     const defaultAccept = accept || "image/*,video/*";

//     return (
//       <div className="common-input-wrapper">
//         {label && (
//           <label
//             htmlFor={name}
//             className={`${half ? 'common-input-extra-css-file' : ''} common-input-label ${required ? 'required' : ''}`}
//           >
//             {label}
//           </label>
//         )}

//         <div className={`common-input-file-container ${imagePosition === 'beside' ? 'common-input-beside-layout' : ''}`}>
//           <div className="common-input-custom-file-input">
//             {selectedFiles.length === 0 && previewUrls.length === 0 && (
//               <span className="common-input-file-placeholder">
//                 {placeholder || 'Select files (images & videos)'}
//               </span>
//             )}
//             {selectedFiles.length > 0 && (
//               <span className="common-input-file-name">
//                 {multiple
//                   ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
//                   : selectedFiles[0].name}
//               </span>
//             )}
//             {selectedFiles.length === 0 && previewUrls.length > 0 && (
//               <span className="common-input-file-name">
//                 {multiple
//                   ? `${previewUrls.length} file${previewUrls.length > 1 ? 's' : ''} from URL`
//                   : 'File from URL'}
//               </span>
//             )}

//             <input
//               type="file"
//               id={name}
//               name={name}
//               className="common-input-hidden-file-input"
//               onChange={handleFileChange}
//               accept={defaultAccept}
//               disabled={disabled}
//               required={required}
//               onBlur={handleBlur}
//               multiple={multiple}
//               {...rest}
//             />

//             <button
//               type="button"
//               className="common-input-upload-button"
//               onClick={handleUpload}
//               disabled={selectedFiles.length === 0 || disabled}
//             >
//               Upload
//             </button>
//           </div>

//           {/* Display clickable text if viewImage is true and there are preview URLs */}
//           {viewImage && previewUrls.length > 0 && !showPreview && (
//             <div
//               className="common-input-view-image-text"
//               onClick={togglePreviewVisibility}

//             >
//               {displayText}
//             </div>
//           )}

//           {/* Preview media files */}
//           {previewUrls.length > 0 && (!viewImage || (viewImage && showPreview)) && (
//             <div className={`common-input-image-previews ${getMediaPreviewSizeClass()}`}>
//               {previewUrls.map((url, index) => (
//                 <div
//                   key={index}
//                   className={`common-input-image-preview-container ${fileTypes[index] === 'csv' ? 'common-input-csv-display-container' : ''} ${getMediaPreviewSizeClass()}`}
//                 >
//                   {fileTypes[index] === 'image' ? (
//                     <img
//                       src={url}
//                       alt={`Preview ${index + 1}`}
//                       className="common-input-image-preview"
//                     />
//                   ) : fileTypes[index] === 'video' ? (
//                     <video
//                       src={url}
//                       className="common-input-image-preview"
//                       controls
//                       muted
//                       preload="metadata"
//                     />
//                   ) : fileTypes[index] === 'csv' ? (
//                     <div className="common-input-csv-preview">
//                       <img src={fileIconUrl} alt="" />
//                     </div>
//                   ) : null}

//                   <button
//                     type="button"
//                     className="common-input-image-remove-btn"
//                     onClick={() => removeFile(index)}
//                   >
//                     <img className="common-input-image-remove-icon" src="/cross-icon.svg" alt="Remove" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {showError && (
//           <span className="error-message">{displayErrorMsg}</span>
//         )}
//         {msg && (
//           <span className="common-input-message">{msg}</span>
//         )}
//       </div>
//     );
//   }

//   // Render phone input with country code dropdown
//   if (type === 'phone') {
//     // Extract phone number without country code for display
//     let phoneNumberOnly = '';
//     if (value && typeof value === 'string') {
//       // Remove country code prefix if present
//       phoneNumberOnly = value.replace(/^\+\d+\s*/, '');
//     }

//     return (
//       <div className={`common-input-wrapper`}>
//         {label && (
//           <label
//             htmlFor={name}
//             className={`common-input-label ${half ? 'common-input-extra-css' : ''} ${required ? 'required' : ''}`}
//             style={dialogStyleLabel}
//           >
//             {label}
//           </label>
//         )}

//         <div className="common-input-phone-container">
//           <div className="common-input-country-code-wrapper">
//             <select
//               value={countryCode}
//               onChange={handleCountryCodeChange}
//               className="common-input-country-code-select"
//               disabled={disabled}
//             >
//               {countryCodes.map((code) => (
//                 <option key={code} value={code}>
//                   {code}
//                 </option>
//               ))}
//             </select>
//             <div className="common-input-country-code-divider"></div>
//           </div>

//           <input
//             type="number"
//             name={name}
//             value={phoneNumberOnly}
//             onChange={handlePhoneNumberChange}
//             className={`common-input common-input-phone ${showError ? 'error' : ''} ${className}`}
//             placeholder={placeholder || "Phone number"}
//             disabled={disabled}
//             required={required}
//             onBlur={handleBlur}
//             {...rest}
//           />
//         </div>

//         {showError && (
//           <span className="error-message">{displayErrorMsg}</span>
//         )}
//         {msg && (
//           <span className="common-input-message">{msg}</span>
//         )}
//       </div>
//     );
//   }

//   // Render multiline textarea
//   if (multiline) {
//     return (
//       <div className={`common-input-wrapper`}>
//         {label && (
//           <label
//             htmlFor={name}
//             className={`common-input-label ${required ? 'required' : ''}`}
//           >
//             {label}
//           </label>
//         )}

//         <textarea
//           {...inputProps}
//           rows={rows}
//           className={`common-input common-input-textarea ${showError ? 'error' : ''} ${className}`}
//           onBlur={handleBlur}
//         />

//         {showError && (
//           <span className="error-message">{displayErrorMsg}</span>
//         )}
//         {msg && (
//           <span className="common-input-message">{msg}</span>
//         )}
//       </div>
//     );
//   }

//   // Render standard input
//   return (
//     <div className={`common-input-wrapper`}>
//       {label && (
//         <label
//           htmlFor={name}
//           className={`common-input-label ${half ? 'common-input-extra-css' : ''} ${required ? 'required' : ''} `}
//           style={dialogStyleLabel}
//         >
//           {label}
//         </label>
//       )}

//       <input
//         type={type}
//         {...inputProps}
//         className={`common-input ${showError ? 'error' : ''} ${className}`}
//         onBlur={handleBlur}
//       />

//       {showError && (
//         <span className="error-message">{displayErrorMsg}</span>
//       )}

//       {msg && (
//         <span className="common-input-message">{msg}</span>
//       )}
//     </div>
//   );
// };

// export default CommonInput;

import { useEffect, useState } from "react";
import "../css/common-input.css";

const CommonInput = ({
  label,
  name,
  value = "",
  onChange,
  type = "text",
  required = false,
  error = false,
  errorMsg = "This field is required",
  placeholder = "",
  disabled = false,
  multiline = false,
  rows = 1,
  className = "",
  half = false,
  accept,
  onUpload,
  multiple = false,
  imagePosition = "below",
  imageSize = "small",
  fileIconUrl = "",
  msg = "",
  viewImage = false,
  displayText = "Click to view uploaded files",
  min,
  max,
  dialogStyleLabel = {},
  style: inputStyle = {},
  ...rest
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState("");

  /* ================= API VALUE SAFE RESET ================= */
  useEffect(() => {
    if (value) {
      setValidationError("");
      setIsTouched(false);
    }
  }, [value]);

  /* ================= FILE PREVIEW FROM API ================= */
  useEffect(() => {
    if (type !== "file" || !value) return;

    const urls = Array.isArray(value) ? value : [value];
    const previews = [];
    const types = [];

    urls.forEach((url) => {
      if (typeof url !== "string") return;

      const lower = url.toLowerCase();
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)) {
        previews.push(url);
        types.push("image");
      } else if (/\.(mp4|webm|ogg|mov|avi)$/.test(lower)) {
        previews.push(url);
        types.push("video");
      } else if (/\.csv$/.test(lower)) {
        previews.push(url);
        types.push("csv");
      }
    });

    setPreviewUrls(previews);
    setFileTypes(types);
  }, [type, value]);

  /* ================= VALIDATION HELPERS ================= */
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateNumber = (val) => {
    if (val === "") return true;
    const num = Number(val);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  };

  /* ================= INPUT HANDLERS ================= */
  const handleBlur = () => {
    setIsTouched(true);

    if (!value) return;

    if (type === "email" && !validateEmail(value)) {
      setValidationError("Enter a valid email address");
    } else if (type === "number" && !validateNumber(value)) {
      if (min !== undefined && max !== undefined)
        setValidationError(`Value must be between ${min} and ${max}`);
      else if (min !== undefined)
        setValidationError(`Value must be at least ${min}`);
      else if (max !== undefined)
        setValidationError(`Value must be at most ${max}`);
    } else {
      setValidationError("");
    }
  };

  const handleInputChange = (e) => {
    if (isTouched) {
      if (type === "email" && !validateEmail(e.target.value)) {
        setValidationError("Enter a valid email address");
      } else {
        setValidationError("");
      }
    }
    onChange && onChange(e);
  };

  /* ================= FILE HANDLING ================= */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const finalFiles = multiple ? files : [files[0]];
    const previews = [];
    const types = [];

    finalFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith("image/")) types.push("image");
      else if (file.type.startsWith("video/")) types.push("video");
      else if (file.name.endsWith(".csv")) types.push("csv");
      previews.push(url);
    });

    setSelectedFiles(finalFiles);
    setPreviewUrls(previews);
    setFileTypes(types);

    onChange?.({
      target: {
        name,
        value: multiple ? finalFiles : finalFiles[0],
      },
    });
  };

  const removeFile = (i) => {
    const files = [...selectedFiles];
    const previews = [...previewUrls];
    const types = [...fileTypes];

    if (previews[i]?.startsWith("blob:")) {
      URL.revokeObjectURL(previews[i]);
    }

    files.splice(i, 1);
    previews.splice(i, 1);
    types.splice(i, 1);

    setSelectedFiles(files);
    setPreviewUrls(previews);
    setFileTypes(types);

    onChange?.({
      target: { name, value: multiple ? files : files[0] || null },
    });
  };

  /* ================= ERROR CONTROL ================= */
  const hasValue =
    value !== "" &&
    value !== null &&
    value !== undefined &&
    !(Array.isArray(value) && value.length === 0);

  const showError = (error || validationError) && isTouched && !hasValue;
  const displayErrorMsg = validationError || errorMsg;

  /* ================= FILE INPUT UI ================= */
  if (type === "file") {
    return (
      <div className="common-input-wrapper">
        {label && (
          <label className="common-input-label required">{label}</label>
        )}

        <input
          type="file"
          name={name}
          accept={accept || "image/*,video/*,.csv"}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          required={required && !previewUrls.length && !selectedFiles.length}
          style={inputStyle}
          {...rest}
        />

        {previewUrls.length > 0 && (
          <div className="common-input-image-previews">
            {previewUrls.map((url, i) => (
              <div key={i} className="common-input-image-preview-container">
                {fileTypes[i] === "image" && <img src={url} alt="" />}
                {fileTypes[i] === "video" && (
                  <video src={url} controls muted />
                )}
                {fileTypes[i] === "csv" && (
                  <img src={fileIconUrl} alt="csv" />
                )}
                <button onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {showError && <span className="error-message">{displayErrorMsg}</span>}
        {msg && <span className="common-input-message">{msg}</span>}
      </div>
    );
  }

  /* ================= TEXT / DEFAULT INPUT ================= */
  return (
    <div className="common-input-wrapper">
      {label && (
        <label
          className={`common-input-label ${half ? "common-input-extra-css" : ""} ${
            required ? "required" : ""
          }`}
          style={dialogStyleLabel}
        >
          {label}
        </label>
      )}

      {multiline ? (
        <textarea
          name={name}
          value={value}
          rows={rows}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={inputStyle}
          className={`common-input common-input-textarea ${showError ? "error" : ""} ${className}`}
          {...rest}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={inputStyle}
          className={`common-input ${showError ? "error" : ""} ${className}`}
          {...rest}
        />
      )}

      {showError && <span className="error-message">{displayErrorMsg}</span>}
      {msg && <span className="common-input-message">{msg}</span>}
    </div>
  );
};

export default CommonInput;
