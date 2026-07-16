import React, { useState, useRef, useEffect } from 'react';

const CommonFileUpload = ({
  onFilesChange,
  label = "",
  multiple = false,
  maxFiles = 10, // Maximum number of files when multiple is true
  acceptedTypes = 'all', // 'all', 'image', 'video', 'document', or custom mime types
  // maxFileSize = 10 * 1024 * 1024, // 10MB default — disabled for now
  maxFileSize,
  placeholder = 'Drag your files to start uploading',
  browseText = 'Browse Files',
  supportText = 'Only support .doc, .pdf, .png and .jpg files',
  className = '',
  returnType = "file", // ✅ NEW
  disabled = false,
  required = false, // New prop: whether the field is required
  error = false, // New prop: external validation error state
  errorMessage = '', // New prop: custom error message
  value = null // New prop: can be a single File/URL or array of Files/URLs
}) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState('');
  const fileInputRef = useRef(null);

  // Initialize files from value prop
  useEffect(() => {
    if (value !== null && value !== undefined) {
      const processedFiles = processValueProp(value);
      setFiles(processedFiles);
    } else {
      setFiles([]);
    }
  }, [value, multiple]);
  const emitChange = (filesList) => {
    if (!onFilesChange) return;
  
    if (returnType === "url") {
      // Send URL string ONLY
      const value = multiple
        ? filesList.map(f => f.url || "")
        : filesList[0]?.url || null;
  
      onFilesChange(value);
    } else {
      // Default behavior (File)
      // Handle empty array case: pass empty array for multiple, null for single
      if (filesList.length === 0) {
        onFilesChange(multiple ? [] : null);
      } else {
        onFilesChange(multiple ? filesList : filesList[0]);
      }
    }
  };
  
  // Process the value property to create consistent file objects
  const processValueProp = (valueData) => {
    if (!valueData) return [];

    const processedFiles = [];
    const dataArray = Array.isArray(valueData) ? valueData : [valueData];

    dataArray.forEach((item, index) => {
      let processedFile = null;

      if (typeof item === 'string') {
        // It's a URL
        const fileName = extractFileNameFromUrl(item);
        const fileExtension = getFileExtension(fileName);
        const estimatedSize = 'Unknown size';

        processedFile = {
          name: fileName,
          size: estimatedSize,
          type: getMimeTypeFromExtension(fileExtension),
          url: item,
          isPreloaded: true,
          id: `preloaded-${index}`
        };
      } else if (item instanceof File) {
        // It's a File object - preserve all File properties
        processedFile = Object.assign(item, {
          isPreloaded: true,
          id: `preloaded-file-${index}`
        });
      } else if (typeof item === 'object' && item.name) {
        // It's a file-like object with at least a name
        processedFile = {
          name: item.name,
          size: item.size || 'Unknown size',
          type: item.type || getMimeTypeFromExtension(getFileExtension(item.name)),
          url: item.url,
          isPreloaded: true,
          id: item.id || `preloaded-obj-${index}`
        };
      }

      if (processedFile) {
        processedFiles.push(processedFile);
      }
    });

    // For single file mode, only return the first file to maintain consistency
    return multiple ? processedFiles : processedFiles.slice(0, 1);
  };

  // Helper function to extract filename from URL
  const extractFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName && fileName.includes('.') ? fileName : 'Unknown file';
    } catch {
      // If URL parsing fails, try to extract from the string
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart && lastPart.includes('.') ? lastPart : 'Unknown file';
    }
  };

  // Helper function to get file extension
  const getFileExtension = (fileName) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // Helper function to get MIME type from extension
  const getMimeTypeFromExtension = (extension) => {
    const mimeTypes = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      // Videos
      mp4: 'video/mp4',
      avi: 'video/avi',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      // Others
      zip: 'application/zip',
      rar: 'application/x-rar-compressed'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Define accepted file types based on props
  const getAcceptedTypes = () => {
    switch (acceptedTypes) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      case 'all':
        return '*/*';
      default:
        return acceptedTypes; // Custom mime types
    }
  };

  // Get support text based on accepted types
  const getSupportText = () => {
    if (supportText !== 'Only support .doc, .pdf, .png and .jpg files') {
      return supportText;
    }

    let baseText;
    switch (acceptedTypes) {
      case 'image':
        baseText = 'Only support image files (.png, .jpg, .jpeg, .gif, .webp)';
        break;
      case 'video':
        baseText = 'Only support video files (.mp4, .avi, .mov, .wmv)';
        break;
      case 'document':
        baseText = 'Only support document files (.pdf, .doc, .docx, .txt)';
        break;
      case 'all':
        baseText = 'Support all file types';
        break;
      default:
        baseText = supportText;
    }

    // Add max files info if multiple is enabled
    if (multiple && maxFiles > 1) {
      baseText += ` (Max ${maxFiles} files - upload one by one or all together)`;
    }

    return baseText;
  };

  // Validate file type
  const isValidFileType = (file) => {
    if (acceptedTypes === 'all') return true;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    switch (acceptedTypes) {
      case 'image':
        return fileType.startsWith('image/');
      case 'video':
        return fileType.startsWith('video/');
      case 'document':
        return fileType === 'application/pdf' ||
          fileType.includes('document') ||
          fileName.endsWith('.pdf') ||
          fileName.endsWith('.doc') ||
          fileName.endsWith('.docx') ||
          fileName.endsWith('.txt');
      default:
        // Custom mime types
        const acceptedArray = acceptedTypes.split(',').map(type => type.trim());
        return acceptedArray.some(type => {
          if (type.includes('*')) {
            return fileType.startsWith(type.replace('*', ''));
          }
          return fileType === type || fileName.endsWith(type.replace('.', ''));
        });
    }
  };

  // Validate file size (skip validation for preloaded files) — disabled for now
  const isValidFileSize = (file) => {
    if (file.isPreloaded) return true;
    // if (!maxFileSize) return true;
    // return file.size <= maxFileSize;
    return true;
  };

  // Process selected files
  const processFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];
    const skippedFiles = [];

    // Calculate how many files we can actually add
    const remainingSlots = multiple ? maxFiles - files.length : 1;

    if (multiple && remainingSlots <= 0) {
      setInternalError(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
      setTimeout(() => setInternalError(''), 5000);
      return;
    }

    // Process files up to the available slots
    const filesToProcess = multiple ? fileArray.slice(0, remainingSlots) : fileArray;

    filesToProcess.forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      // if (!isValidFileSize(file)) {
      //   errors.push(`${file.name}: File size too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
      //   return;
      // }

      // Add the file directly with isPreloaded property
      const fileWithMeta = Object.assign(file, { isPreloaded: false });
      validFiles.push(fileWithMeta);
    });

    // Handle files that couldn't be processed due to limit
    if (multiple && fileArray.length > remainingSlots) {
      const excessFiles = fileArray.length - remainingSlots;
      skippedFiles.push(`${excessFiles} file${excessFiles === 1 ? '' : 's'} skipped (max ${maxFiles} files allowed)`);
    }

    // Combine all messages
    const allMessages = [...errors, ...skippedFiles];

    if (allMessages.length > 0) {
      setInternalError(allMessages.join(', '));
      setTimeout(() => setInternalError(''), 5000);
    } else {
      setInternalError('');
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      // For single file mode, pass just the file object, not an array
      // onFilesChange && onFilesChange(multiple ? newFiles : newFiles[0]);
      emitChange(newFiles);

    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove file from list
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    emitChange(newFiles);
  };

  // Reset component
  const handleReupload = () => {
    setFiles([]);
    setInternalError('');
    emitChange([]);
  };

  // Format file size
  const formatFileSize = (size) => {
    if (typeof size === 'string') return size; // For preloaded files with unknown size
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    const fileType = file.type || '';

    if (fileType.startsWith('image/')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
        </svg>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0690fd">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
  };

  const styles = {
    container: {
      width: '100%',
      margin: '2% auto',
    },
    uploadArea: {
      border: `2px dashed ${error ? '#EF4444' : isDragOver ? '#0690fd' : files.length > 0 ? '#10B981' : '#D1D5DB'}`,
      borderRadius: '12px',
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: isDragOver ? '#F0F9FF' : files.length > 0 ? 'transparent' : 'transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.6 : 1
    },
    fileIcon: {
      width: '48px',
      height: '48px',
      margin: '0 auto 16px',
      backgroundColor: 'transparent',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    },
    placeholder: {
      fontSize: '16px',
      color: '#374151',
      marginBottom: '8px',
      fontWeight: '500'
    },
    orTextContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '200px',
      height: '40px',
      margin: '8px auto',
    },
    orLine: {
      borderBottom: '1px solid #D1D5DB',
      width: '100%',
      position: 'absolute',
      top: '50%',
      left: 0,
      transform: 'translateY(-50%)',
    },
    orText: {
      fontSize: '14px',
      color: '#6B7280',
      position: 'relative',
      zIndex: 1,
      backgroundColor: 'white',
      padding: '0 8px',
      margin: 0,
      lineHeight: 1,
    },
    browseButton: {
      backgroundColor: 'transparent',
      color: '#0690fd',
      border: '1px solid #0690fd',
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s ease',
      opacity: disabled ? 0.6 : 1
    },
    supportText: {
      fontSize: '12px',
      color: '#6B7280',
      marginTop: '12px'
    },
    fileList: {
      marginTop: '20px'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    preloadedFileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#F0F9FF',
      border: '1px solid #BFDBFE',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      flex: 1
    },
    fileName: {
      fontSize: '14px',
      color: '#374151',
      fontWeight: '500',
      marginLeft: '12px'
    },
    fileSize: {
      fontSize: '12px',
      color: '#6B7280',
      marginLeft: '8px'
    },
    preloadedBadge: {
      fontSize: '10px',
      color: '#2563EB',
      backgroundColor: '#DBEAFE',
      padding: '2px 6px',
      borderRadius: '12px',
      marginLeft: '8px'
    },
    removeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#EF4444',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px'
    },
    reuploadButton: {
      backgroundColor: 'transparent',
      color: '#0690fd',
      border: '1px solid #0690fd',
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '16px'
    },
    error: {
      color: '#EF4444',
      fontSize: '14px',
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: '6px'
    },
    validationError: {
      color: '#EF4444',
      fontSize: '12px',
      marginTop: '8px',
      marginLeft: '4px'
    },
    hiddenInput: {
      display: 'none'
    },
    title: {
      color: '#172B4D',
      fontSize: '18px',
      fontWeight: '600',
      margin: 0,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    starMark: {
      color: '#EF4444',
      fontSize: '18px',
      fontWeight: '600'
    },
    fileIconImage: {
      width: '40px',
      height: '40px',
    }
  };

  return (
    <div className={`file-upload-container ${className}`} style={styles.container}>
      {/* Title with optional star mark for required fields */}
      {label && (
        <div style={styles.title}>
          {label}
          {required && <span style={styles.starMark}>*</span>}
        </div>
      )}
      
      {/* Show upload area if no files OR if multiple mode and haven't reached max files */}
      {(files.length === 0 || (multiple && files.length < maxFiles)) ? (
        <div
          style={styles.uploadArea}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div style={styles.fileIcon}>
            {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg> */}
            <img src="/upload-icon.svg" alt="" style={styles.fileIconImage}/>
          </div>
          <div style={styles.placeholder}>
            {files.length > 0 && multiple
              ? `Add more files (${files.length}/${maxFiles})`
              : placeholder
            }
          </div>
          <div style={styles.orTextContainer}>
            <div style={styles.orLine}> </div>
            <p style={styles.orText}>OR</p>
          </div>
          <button
            style={styles.browseButton}
            onMouseOver={(e) => !disabled && (e.target.style.backgroundColor = 'transparent')}
            onMouseOut={(e) => !disabled && (e.target.style.backgroundColor = 'transparent')}
            disabled={disabled}
          >
            {browseText}
          </button>
          <div style={styles.supportText}>{getSupportText()}</div>
        </div>
      ) : null}

      {/* Always show file list if there are files */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((file, index) => {
            const fileName = file.name || 'Unknown file';
            const fileSize = file.size !== undefined ? file.size : 'Unknown size';
            const isPreloaded = file.isPreloaded;
            return (
              <div
                key={file.id || `file-${index}`}
                style={isPreloaded ? styles.preloadedFileItem : styles.fileItem}
              >
                <div style={styles.fileInfo}>
                  {getFileIcon(file)}
                  <span style={styles.fileName}>{fileName}</span>
                  <span style={styles.fileSize}>({formatFileSize(fileSize)})</span>
                </div>
                <button
                  style={styles.removeButton}
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Show re-upload button only when max files reached in multiple mode */}
      {multiple && files.length >= maxFiles && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            style={styles.reuploadButton}
            onClick={handleReupload}
            onMouseOver={(e) => (e.target.style.backgroundColor = 'transparent')}
            onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
          >
            Re-upload Files
          </button>
        </div>
      )}

      {internalError && <div style={styles.error}>{internalError}</div>}

      {/* Show validation error when required field is empty */}
      {required && error && errorMessage && (
        <div style={styles.validationError}>{errorMessage}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        style={styles.hiddenInput}
        onChange={handleFileInputChange}
        multiple={multiple}
        accept={getAcceptedTypes()}
        disabled={disabled}
      />
    </div>
  );
};

export default CommonFileUpload;