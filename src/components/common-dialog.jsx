// const formSections = [
//   // Regular fields section
//   {
//     id: "basicInfo",
//     type: "fields",
//     title: "Basic Information",
//     fields: [
//       {
//         type: "text",
//         name: "fullName",
//         label: "Full Name",
//         required: true,
//         placeholder: "Enter your full name",
//         width: "half"
//       },
//       {
//         type: "email",
//         name: "email",
//         label: "Email Address",
//         required: true,
//         placeholder: "Enter your email",
//         width: "half"
//       },
//       {
//         type: "tel",
//         name: "phone",
//         label: "Phone Number",
//         placeholder: "Enter your phone number",
//         width: "half"
//       },
//       {
//         type: "date",
//         name: "birthDate",
//         label: "Date of Birth",
//         width: "half"
//       },
//       {
//         type: "text",
//         name: "description",
//         label: "Description",
//         placeholder: "Tell us about yourself",
//         width: "full",
//         multiline: true,
//         row: 3
//       }
//     ]
//   },

//   // Radio button section
//   {
//     id: "userType",
//     type: "radio",
//     title: "User Type",
//     dataKey: "userType",
//     options: [
//       {
//         label: "Admin",
//         value: "admin",
//         fields: [
//           {
//             type: "text",
//             name: "adminId",
//             label: "Admin ID",
//             required: true,
//             width: "half"
//           }
//         ]
//       },
//       {
//         label: "Regular User",
//         value: "user"
//       },
//       {
//         label: "Guest",
//         value: "guest"
//       }
//     ]
//   },

//   // Alternate radio button layout
//   {
//     id: "notificationPreference",
//     type: "radio 2",
//     title: "Notification Preferences",
//     dataKey: "notificationMethod",
//     options: [
//       { label: "Email", value: "email" },
//       { label: "SMS", value: "sms" },
//       { label: "Push Notification", value: "push" }
//     ]
//   },

//   // Checkbox section
//   {
//     id: "permissions",
//     type: "checkbox",
//     title: "User Permissions",
//     dataKey: "permissions",
//     options: [
//       { label: "View Reports", value: "viewReports" },
//       { label: "Edit Content", value: "editContent" },
//       { label: "Delete Records", value: "deleteRecords" },
//       { label: "Manage Users", value: "manageUsers" }
//     ]
//   },

//   // Checkbox2 section (single selection from multiple)
//   {
//     id: "accountType",
//     type: "checkbox2",
//     title: "Account Type",
//     dataKey: "accountType",
//     options: [
//       { label: "Free Tier", value: "free" },
//       { label: "Pro", value: "pro" },
//       { label: "Enterprise", value: "enterprise" }
//     ]
//   },

//   // Conditional fields section
//   {
//     id: "contactDetails",
//     type: "conditional",
//     primaryField: {
//       type: "select",
//       name: "preferredContact",
//       label: "Preferred Contact Method",
//       required: true,
//       options: [
//         { label: "Email", value: "email" },
//         { label: "Phone", value: "phone" },
//         { label: "Mail", value: "mail" }
//       ]
//     },
//     conditions: [
//       {
//         when: "email",
//         fields: [
//           {
//             type: "email",
//             name: "contactEmail",
//             label: "Contact Email",
//             required: true
//           }
//         ]
//       },
//       {
//         when: "phone",
//         fields: [
//           {
//             type: "tel",
//             name: "contactPhone",
//             label: "Contact Phone Number",
//             required: true
//           }
//         ]
//       },
//       {
//         when: "mail",
//         fields: [
//           {
//             type: "text",
//             name: "address",
//             label: "Mailing Address",
//             required: true,
//             multiline: true,
//             row: 2
//           }
//         ]
//       }
//     ]
//   },

//   // Plain text section
//   {
//     id: "instructions",
//     type: "plain text",
//     containerStyle: "plain-text-container",
//     itemStyle: "plain-text-item",
//     content: [
//       "Please review all information before submitting.",
//       "All fields marked with * are required.",
//       "You can change these settings later from your profile."
//     ]
//   },

//   // Color selector section
//   {
//     id: "colorSection",
//     type: "color selector",
//     title: "Select Team Color",
//     colors: ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"]
//   },

//   // Toggle switch section
//   {
//     id: "notificationToggle",
//     type: "toggle switch",
//     label: "Enable Notifications",
//     value: "notificationsEnabled",
//     activeText: "ON",
//     inactiveText: "OFF"
//   },

//   // Question section
//   {
//     id: "surveyQuestion",
//     type: "question",
//     name: "surveyQuestion",
//     dialogType: "multiple choice"
//   },

//   // Nested conditional section
//   {
//     id: "teamSetup",
//     type: "nested conditional",
//     primaryField: {
//       type: "select",
//       name: "teamType",
//       label: "Team Type",
//       required: true,
//       options: [
//         { label: "Sports Team", value: "sports" },
//         { label: "Project Team", value: "project" }
//       ]
//     },
//     conditions: [
//       {
//         when: "sports",
//         sections: [
//           {
//             id: "sportsDetails",
//             type: "fields",
//             fields: [
//               {
//                 type: "text",
//                 name: "sportName",
//                 label: "Sport Name",
//                 required: true
//               },
//               {
//                 type: "number",
//                 name: "totalPlayers",
//                 label: "Total Players",
//                 required: true,
//                 width: "half"
//               },
//               {
//                 type: "number",
//                 name: "totalTeams",
//                 label: "Total Teams",
//                 required: true,
//                 width: "half"
//               }
//             ]
//           },
//           {
//             id: "sportEquipment",
//             type: "checkbox",
//             title: "Required Equipment",
//             dataKey: "equipment",
//             options: [
//               { label: "Balls", value: "balls" },
//               { label: "Uniforms", value: "uniforms" },
//               { label: "Protective Gear", value: "protective" }
//             ]
//           }
//         ]
//       },
//       {
//         when: "project",
//         fields: [
//           {
//             type: "text",
//             name: "projectName",
//             label: "Project Name",
//             required: true
//           },
//           {
//             type: "date",
//             name: "deadline",
//             label: "Project Deadline",
//             required: true
//           }
//         ],
//         sections: [
//           {
//             id: "projectRoles",
//             type: "radio 2",
//             title: "Project Methodology",
//             dataKey: "methodology",
//             options: [
//               { label: "Agile", value: "agile" },
//               { label: "Waterfall", value: "waterfall" }
//             ]
//           }
//         ]
//       }
//     ]
//   },

//   // Text editor section
//   {
//     id: "richDescription",
//     type: "text editor",
//     name: "richDescription",
//     label: "Rich Text Description",
//     placeholder: "Enter a detailed description with formatting...",
//     required: true,
//     minHeight: "200px",
//     maxHeight: "none"
//   },

//   // Image upload section
//   {
//     id: "profileImageUpload",
//     type: "image upload",
//     name: "profileImage",
//     label: "Profile Image",
//     required: true,
//     placeholder: "Drag and drop your profile image here or click to browse",
//     browseText: "Browse Files",
//     acceptedTypes: "image",
//     supportText: "Only support .png, .jpg and .jpeg files | file size 250KB",
//     maxFileSize: 250 * 1024,
//     multiple: false
//   },

//   // File upload section
//   {
//     id: "documentUploads",
//     type: "file upload",
//     name: "documents",
//     label: "Supporting Documents",
//     required: false,
//     placeholder: "Drag and drop your documents here or click to browse",
//     browseText: "Browse Files",
//     acceptedTypes: "document",
//     supportText: "Only support .pdf, .doc, .docx files",
//     maxFileSize: 10 * 1024 * 1024, // 10MB
//     multiple: true,
//     maxFiles: 5
//   }
// ];

// // Initial form data structure to support all sections
// const initialFormData = {
//   // Basic fields
//   fullName: "",
//   email: "",
//   phone: "",
//   birthDate: "",
//   description: "",

//   // Radio selection
//   userType: "",
//   adminId: "",

//   // Radio 2 selection
//   notificationMethod: "",

//   // Checkbox group (multiple selection)
//   permissions: {
//     viewReports: false,
//     editContent: false,
//     deleteRecords: false,
//     manageUsers: false
//   },

//   // Checkbox2 (single selection)
//   accountType: "",

//   // Conditional fields
//   preferredContact: "",
//   contactEmail: "",
//   contactPhone: "",
//   address: "",

//   // Color selector
//   teamColor: "",

//   // Toggle switch
//   notificationsEnabled: false,

//   // Question section
//   surveyQuestion: null,

//   // Nested conditional
//   teamType: "",
//   sportName: "",
//   totalPlayers: "",
//   totalTeams: "",
//   playersPerTeam: "",
//   equipment: {
//     balls: false,
//     uniforms: false,
//     protective: false
//   },
//   projectName: "",
//   deadline: "",
//   methodology: "",

//   // Text editor
//   richDescription: "",

//   // File uploads
//   profileImage: null,
//   documents: null
// };

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CommonInput from './common-input';
import CommonSelect from './common-select';
import CommonButton from './common-button';
import '../css/common-dialog.css';
import { useContext } from 'react';
import { globalContext } from '../context/context';

import CommonToggleSwitch from './common-toggle-switch';
import CommonFileUpload from './common-file-upload';
import CommonTextEditorBox from './common-text-editor-box';

const CommonDialog = ({
  open,
  setOpen,
  title,
  formData = {},
  setFormData = {},
  formSections = [],
  errors = {},
  setErrors = {},
  submitButtonText = 'Submit',
  onSubmit = () => { },
  infoButton = false,
  infoFunction = () => { },
  showButton = true,
  dialogsize = 'md'
  ,
  submitButtonLoading = false,
  submitButtonLoadingText = 'Saving...',
  autoCloseOnSubmit = true
}) => {
  const { showToast } = useContext(globalContext);

  // Check if text editor content is empty
  const isContentEmpty = (htmlContent) => {
    if (!htmlContent) {
      return true;
    }

    // Remove HTML tags and get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Check if text content is empty after trimming whitespace
    const hasText = textContent.trim().length > 0;

    // Also check common empty HTML patterns
    const emptyPatterns = [
      '',
      '<br>',
      '<br/>',
      '<br />',
      '<div><br></div>',
      '<div></div>',
      '<p></p>',
      '<p><br></p>'
    ];

    const normalizedHtml = htmlContent.replace(/\s+/g, '').toLowerCase();
    const isEmptyPattern = emptyPatterns.some(pattern =>
      normalizedHtml === pattern.replace(/\s+/g, '').toLowerCase()
    );

    return !hasText || isEmptyPattern;
  };

  // normal field functions
  const handleChange = (name, value) => {
    // Special handling for file inputs
    if (value instanceof File || (Array.isArray(value) && value[0] instanceof File)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // For files, we consider it non-empty if there's at least one file
      const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
      setErrors(prev => ({
        ...prev,
        [name]: isEmpty && prev[name] // Only mark as error if it was previously an error and is still empty
      }));
      return;
    }

    // regular form input
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Special case handling for player/team calculation
    if (name === 'totalPlayers' || name === 'totalTeams') {
      const players = parseFloat(newFormData.totalPlayers) || 0;
      const teams = parseFloat(newFormData.totalTeams) || 0;

      newFormData.playersPerTeam = teams > 0
        ? Math.floor(players / teams)
        : 0;
    }

    setFormData(newFormData);

    // Avoid trim error on non-string values
    const isEmpty = value && value.trim ? value.trim() === '' : !value;
    setErrors(prev => ({
      ...prev,
      [name]: isEmpty
    }));
  };
  const handleFileUpload = (name, files) => {
    console.log('Uploading files:', files);
    // Implement file upload logic here if needed
    // This could involve sending files to a server via API
  };

  // Text editor change handler
  const handleTextEditorChange = (name, data) => {
    setFormData(prev => ({
      ...prev,
      [name]: data.html
    }));

    // Clear error if content is not empty
    if (!isContentEmpty(data.html)) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // File upload change handler
  const handleFileUploadChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));

    // Clear error when file is uploaded
    if (file) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // checkbox functions
  const handleCheckboxChange = (checkboxName, checkboxKey) => {
    setFormData(prev => ({
      ...prev,
      [checkboxName]: {
        ...prev[checkboxName],
        [checkboxKey]: !prev[checkboxName][checkboxKey]
      }
    }));
  };


  const renderFormField = (field) => {
    const {
      type,
      name,
      label,
      required = false,
      placeholder,
      options,
      width = 'full',
      prefix,
      accept,
      imageSize,
      imagePosition,
      multiple,
      multiline = false,
      row = 1,
      disabled = false,
      fileIconUrl = '',
      multiselect = false,
      viewImage = false,
      displayText = '',
      msg = ''
    } = field;

    const fieldStyle = {
      width: '100% ',
      boxSizing: 'border-box',
      padding: '12.5px 20px'
    };

    const gridProps = {
      item: true,
      xs: width === 'half' ? 6 : 12,
      key: name,
      sx: {
        width: width === 'half' ? 'calc(50% - 8px)' : '100%',
        maxWidth: width === 'half' ? 'calc(50% - 8px)' : '100%',
        flexBasis: width === 'half' ? 'calc(50% - 8px)' : '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    };
    switch (type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
      case 'password':
      case 'date':
      case 'time':
      case 'phone':
        return (
          <Grid {...gridProps}>
            <CommonInput
              label={label}
              name={name}
              type={type}
              value={formData[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              required={required}
              error={errors && errors[name]}
              errorMsg={`${label} is required`}
              placeholder={placeholder}
              prefix={prefix}
              className='extra-input-css'
              dialogStyleLabel={{ marginLeft: '22px' }}
              half={width === 'half' ? true : false}
              style={fieldStyle}
              multiline={multiline}
              disabled={disabled}
              rows={row}
              msg={msg}
            />
          </Grid >
        );

      case 'select':
        return (
          <Grid {...gridProps}>
            <CommonSelect
              label={label}
              name={name}
              value={formData[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              options={options || []}
              required={required}
              error={errors && errors[name]}
              errorMsg={`${label} is required`}
              placeholder={placeholder}
              className={width === 'half' ? 'extra-select-css' : ''}
              halfStyleDialog={width === 'half' ? { padding: '3.1% 5.25%' } : {}}
              halfStyleDialogLabel={width === 'half' ? { marginLeft: '22px' } : {}}
              half={width === 'half' ? true : false}
              style={fieldStyle}
              disabled={disabled}
              classNameForDialog='extra-input-css-for-dialog'
              classNameForDialogLabel='extra-input-css-for-dialog-label'
              multiselect={multiselect}
            />
          </Grid>
        );

      default:
        return null;
    }
  };

  // Render a single form section based on its type
  const renderSection = (section) => {
    const { id, type, title, fields = [] } = section;

    switch (type) {
      case 'fields':
        // Regular fields (inputs/selects)
        return (
          <Grid item xs={12} key={id} style={{ width: '100%' }}>
            <Grid container rowSpacing={0} columnSpacing={2} >
              {fields?.map(field => renderFormField(field))}
            </Grid>
          </Grid>
        );

      case 'checkbox':
        // Checkbox section
        return (
          <Grid item xs={12} className="special-grid2" key={id} style={{ marginLeft: '2%', marginBottom: '2%' }}>
            <Box >
              {section.title &&
                <div style={{ fontWeight: 'medium', marginBottom: '1%' }}>
                  {section.title || 'Assign Permissions'}
                </div>
              }
              <Grid container spacing={1}>
                {section.options?.map((option, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!formData[section.dataKey]?.[option.value]}
                          onChange={() => handleCheckboxChange(section.dataKey, option.value)}
                          sx={{
                            color: '#0690fd',
                            '&.Mui-checked': {
                              color: '#0690fd',
                            },
                            padding: '4px',
                            transform: 'scale(1.2)'
                          }}
                        />
                      }
                      label={option.label}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontFamily: 'League Spartan',
                          color: '#0D0D0D',
                          fontSize: '14px',
                          fontWeight: '400',
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        );

      case 'conditional':
        // Conditional fields section (shows different fields based on selection)
        return (
          <Grid item xs={12} key={id} style={{ width: '100%' }}>
            <Grid container rowSpacing={0} columnSpacing={2} sx={{ width: '100%' }}>
              {/* Primary field that controls visibility */}
              {renderFormField(section.primaryField)}

              {/* Render conditional fields based on the primary field's value */}
              {section.conditions && section.conditions.map((condition, idx) => {
                // Check if current value matches condition's trigger value
                if (formData[section.primaryField.name] === condition.when) {
                  return (
                    // Directly map the fields without an additional container
                    condition.fields?.map(field => renderFormField(field))
                  );
                }
                return null;
              })}
            </Grid>
          </Grid>
        );

      case 'toggle switch':
        return (
          <div className='common-dialog-toggle-switch-container'>
            <p>{formData[section?.value] ? `${section?.activeText}` : `${section?.inactiveText}`}</p>
            {/* <ToggleSwitch
              key={section?.id}
              active={formData[section?.value]}
              onToggle={(isActive) => (isActive) ? setFormData({ ...formData, [section?.value]: true }) : setFormData({ ...formData, [section?.value]: false })}
              activeText={section?.activeText}
              inactiveText={section?.inactiveText}
            /> */}
            <CommonToggleSwitch
              checked={formData[section?.value]}
              onChange={(value) => setFormData({ ...formData, [section?.value]: value })}
              disabled={section?.disabled}
              size='large'
            />
          </div>
        )

      case 'nested conditional':
        return (
          <Grid item xs={12} key={id}>
            <Grid container rowSpacing={0} columnSpacing={2}>
              {/* Primary field that controls top-level visibility */}
              {renderFormField(section.primaryField)}

              {/* Render nested sections based on the primary field's value */}
              {section.conditions && section.conditions.map((condition, idx) => {
                // Check if current value matches condition's trigger value
                if (formData[section.primaryField.name] === condition.when) {
                  return (
                    <Grid item xs={12} key={`nested-${idx}`}>
                      {/* If sections are defined, render each section */}
                      {condition.sections && condition.sections.map(nestedSection => renderSection(nestedSection))}

                      {/* If fields are defined, render each field directly */}
                      {condition.fields && condition.fields.map(field => renderFormField(field))}
                    </Grid>
                  );
                }
                return null;
              })}
            </Grid>
          </Grid>
        );

      case 'image upload':
        return (
          <Grid item xs={12} key={id} style={{ width: '100%' }}>
            <Grid container rowSpacing={0} columnSpacing={2}>
              <CommonFileUpload
                label={section.label}
                placeholder={section.placeholder}
                multiple={section.multiple}
                acceptedTypes={section.acceptedTypes}
                browseText={section.browseText}
                supportText={section.supportText}
                maxFileSize={section.maxFileSize}
                onFilesChange={(file) => handleFileUploadChange(section.name, file)}
                value={formData[section.name]}
                required={section.required}
                error={errors && errors[section.name]}
                errorMessage={`${section.label || section.name} is required`}
                disabled={section.disabled}
              />
            </Grid>
          </Grid>
        );

      case 'file upload':
        return (
          <Grid item xs={12} key={id} style={{ width: '100%' }}>
            <Grid container rowSpacing={0} columnSpacing={2}>
              <CommonFileUpload
                label={section.label}
                placeholder={section.placeholder || 'Drag your files to start uploading'}
                multiple={section.multiple || false}
                acceptedTypes={section.acceptedTypes || 'all'}
                browseText={section.browseText || 'Browse Files'}
                supportText={section.supportText}
                maxFileSize={section.maxFileSize}
                maxFiles={section.maxFiles}
                onFilesChange={(file) => handleFileUploadChange(section.name, file)}
                value={formData[section.name]}
                required={section.required}
                error={errors && errors[section.name]}
                errorMessage={`${section.label || section.name} is required`}
                disabled={section.disabled}
              />
            </Grid>
          </Grid>
        );

      case 'text editor':
        return (
          <Grid item xs={12} key={id} style={{ width: '100%' }}>
            <CommonTextEditorBox
              label={section.label}
              placeholder={section.placeholder || 'Start typing...'}
              value={formData[section.name]}
              onChange={(data) => handleTextEditorChange(section.name, data)}
              required={section.required}
              error={errors && errors[section.name]}
              errorMessage={`${section.label || section.name} is required`}
              disabled={section.disabled}
              minHeight={section.minHeight || '200px'}
              maxHeight={section.maxHeight || 'none'}
              className={section.className || ''}
            />
          </Grid>
        );

        c

      case 'normal text':
        return (
          <Grid item xs={12} key={id} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#0D0D0D' , textAlign: 'center'}}>{section?.text}</p>
          </Grid>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    let allRequiredFieldsFilled = true;
    const newErrors = { ...errors };
    const errorMsgs = [];

    // Check all required fields in all sections
    formSections.forEach(section => {
      // Regular fields (inputs/selects)
      if (section.type === 'fields' && section.fields) {
        section.fields.forEach(field => {
          if (field.required) {
            const isEmpty = !formData[field.name] ||
              (typeof formData[field.name] === 'string' && formData[field.name].trim() === '');

            if (isEmpty) {
              newErrors[field.name] = true;
              allRequiredFieldsFilled = false;
              errorMsgs.push(`${field.label || field.name} is required`);
            } else if (field.type === 'email' && formData[field.name]) {
              // Validate email format if not empty
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(formData[field.name])) {
                newErrors[field.name] = true;
                allRequiredFieldsFilled = false;
                errorMsgs.push(`${field.label || field.name} must be a valid email`);
              }
            } else if (field.type === 'phone' && formData[field.name]) {
              // Validate phone format if not empty
              const phoneRegex = /^\d{10,15}$/;
              if (!phoneRegex.test(formData[field.name].replace(/\D/g, ''))) {
                newErrors[field.name] = true;
                allRequiredFieldsFilled = false;
                errorMsgs.push(`${field.label || field.name} must be a valid phone number`);
              }
            }
          }
        });
      }

      // Checkbox section validation (if a minimum number are required)
      if (section.type === 'checkbox' && section.required) {
        const checkboxData = formData[section.dataKey] || {};
        const checkedItems = Object.keys(checkboxData).filter(key => checkboxData[key]);

        if (section.minRequired && checkedItems.length < section.minRequired) {
          newErrors[section.dataKey] = true;
          allRequiredFieldsFilled = false;
          errorMsgs.push(`Please select at least ${section.minRequired} ${section.title || 'options'}`);
        }
      }

      // Conditional fields validation
      if (section.type === 'conditional') {
        // Check primary field
        if (section.primaryField?.required) {
          const isEmpty = !formData[section.primaryField.name] ||
            (typeof formData[section.primaryField.name] === 'string' && formData[section.primaryField.name].trim() === '');

          if (isEmpty) {
            newErrors[section.primaryField.name] = true;
            allRequiredFieldsFilled = false;
            errorMsgs.push(`${section.primaryField.label || section.primaryField.name} is required`);
          }
        }

        // Check visible conditional fields based on primary field value
        if (section.conditions) {
          const activeCondition = section.conditions.find(
            condition => formData[section.primaryField.name] === condition.when
          );

          if (activeCondition && activeCondition.fields) {
            activeCondition.fields.forEach(field => {
              if (field.required) {
                const isEmpty = !formData[field.name] ||
                  (typeof formData[field.name] === 'string' && formData[field.name].trim() === '');

                if (isEmpty) {
                  newErrors[field.name] = true;
                  allRequiredFieldsFilled = false;
                  errorMsgs.push(`${field.label || field.name} is required`);
                }
              }
            });
          }
        }
      }

      // Nested conditional fields validation
      if (section.type === 'nested conditional') {
        // Check primary field
        if (section.primaryField?.required) {
          const isEmpty = !formData[section.primaryField.name] ||
            (typeof formData[section.primaryField.name] === 'string' && formData[section.primaryField.name].trim() === '');

          if (isEmpty) {
            newErrors[section.primaryField.name] = true;
            allRequiredFieldsFilled = false;
            errorMsgs.push(`${section.primaryField.label || section.primaryField.name} is required`);
          }
        }

        // Check visible nested sections based on primary field value
        if (section.conditions) {
          const activeCondition = section.conditions.find(
            condition => formData[section.primaryField.name] === condition.when
          );

          if (activeCondition) {
            // Check fields in the active condition
            if (activeCondition.fields) {
              activeCondition.fields.forEach(field => {
                if (field.required) {
                  const isEmpty = !formData[field.name] ||
                    (typeof formData[field.name] === 'string' && formData[field.name].trim() === '');

                  if (isEmpty) {
                    newErrors[field.name] = true;
                    allRequiredFieldsFilled = false;
                    errorMsgs.push(`${field.label || field.name} is required`);
                  }
                }
              });
            }

            // Check each nested section
            if (activeCondition.sections) {
              activeCondition.sections.forEach(nestedSection => {
                // Recursively check each nested section type
                if (nestedSection.type === 'fields' && nestedSection.fields) {
                  nestedSection.fields.forEach(field => {
                    if (field.required) {
                      const isEmpty = !formData[field.name] ||
                        (typeof formData[field.name] === 'string' && formData[field.name].trim() === '');

                      if (isEmpty) {
                        newErrors[field.name] = true;
                        allRequiredFieldsFilled = false;
                        errorMsgs.push(`${field.label || field.name} is required`);
                      }
                    }
                  });
                }
              });
            }
          }
        }
      }


      // Toggle switch validation (if required)
      if (section.type === 'toggle switch' && section.required) {
        if (section.requiredValue !== undefined && formData[section.value] !== section.requiredValue) {
          newErrors[section.value] = true;
          allRequiredFieldsFilled = false;
          errorMsgs.push(`${section.label || 'Toggle'} must be ${section.requiredValue ? 'enabled' : 'disabled'}`);
        }
      }

      // Image upload validation (if required)
      if (section.type === 'image upload' && section.required) {
        const fileData = formData[section.name];
        const isEmpty = !fileData ||
          (Array.isArray(fileData) && fileData.length === 0) ||
          (typeof fileData === 'string' && (fileData === '' || fileData === '/avatar.svg'));

        if (isEmpty) {
          newErrors[section.name] = true;
          allRequiredFieldsFilled = false;
          errorMsgs.push(`${section.label || section.name} is required`);
        }
      }

      // File upload validation (if required)
      if (section.type === 'file upload' && section.required) {
        const fileData = formData[section.name];
        const isEmpty = !fileData ||
          (Array.isArray(fileData) && fileData.length === 0) ||
          (typeof fileData === 'string' && (fileData === '' || fileData === '/avatar.svg'));

        if (isEmpty) {
          newErrors[section.name] = true;
          allRequiredFieldsFilled = false;
          errorMsgs.push(`${section.label || section.name} is required`);
        }
      }

      // Text editor validation (if required)
      if (section.type === 'text editor' && section.required) {
        const content = formData[section.name];
        const isEmpty = isContentEmpty(content);

        if (isEmpty) {
          newErrors[section.name] = true;
          allRequiredFieldsFilled = false;
          errorMsgs.push(`${section.label || section.name} is required`);
        }
      }
    });

    setErrors(newErrors);

    if (!allRequiredFieldsFilled) {
      // Use first error message or default
      const validationMsg = errorMsgs.length > 0 ? errorMsgs[0] : "Please fill all the mandatory fields";
      showToast(validationMsg, 'error');
      return;
    }

    // Call onSubmit function
    await onSubmit(formData);
    if (autoCloseOnSubmit) {
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false)
        // handleCloseForQuestion();
      }}
      maxWidth={dialogsize}
      fullWidth={true}
      className="dialog-container"
      PaperProps={{
        style: {
          borderRadius: '1rem',
          padding: '1%',
        }
      }}
    >
      <DialogTitle>
        <span className='dialog-title'>{title}</span>
        {infoButton &&
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpen(false)
              // handleCloseForQuestion();
            }}
            sx={{
              position: 'absolute',
              right: 40,
              top: 8,
            }}
          >
            <img src="/info-icon.svg" alt="" onClick={infoFunction} />
          </IconButton>
        }
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false)
            // handleCloseForQuestion();
          }}
          sx={{
            position: 'absolute',
            right: 15,
            top: 15,
          }}
        >
          <img src="/cross-icon.svg" alt="" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 2 }} style={{
        overflowX: 'hidden',
      }}>
        <Grid
          container
          // spacing={2}
          sx={{
            width: '100%',
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            '& .MuiGrid-item': {
              paddingLeft: '8px',
              // paddingTop: '8px'
            }
          }}>
          {formSections?.map(section => renderSection(section))}
        </Grid>
        {
          showButton &&
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            columnGap: "2%",
            marginTop: '4%',
            justifyContent: 'flex-end'
          }}>
            <CommonButton
              text={submitButtonLoading ? submitButtonLoadingText : submitButtonText}
              backgroundColor={"#0690fd"}
              color={"#FFFFFF"}
              borderColor={"#0690fd"}
              onClick={handleSubmit}
              disabled={submitButtonLoading}
            />
            <CommonButton
              backgroundColor="#D9D9D9"
              color="#404040"
              onClick={() => {
                setOpen(false)
                // handleCloseForQuestion();
              }}
              text="Cancel"
              borderColor={"#D9D9D9"}
            />
          </Box>
        }
      </DialogContent>
    </Dialog>
  );
};

export default CommonDialog;