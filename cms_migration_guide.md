# CMS Migration Guide — Files to Copy & Agent Prompt

---

## 📁 Files You Need to Copy (14 files total)

### 1. CMS View Pages (6 files)
These are the main CMS page and its sub-sections:

| # | File | Purpose |
|---|------|---------|
| 1 | `src/View/Cms/Cms.jsx` | Main CMS page with tab navigation (Favicon, Header, Footer, Social Media, Contact) |
| 2 | `src/View/Cms/Cms.css` | Styles for the CMS wrapper, tabs, layout |
| 3 | `src/View/Cms/SiteHeader/SiteHeader.jsx` | Header settings (logo + page header image uploads) |
| 4 | `src/View/Cms/SiteHeader/SiteHeader.css` | Header grid layout styles |
| 5 | `src/View/Cms/SiteFooter/SiteFooter.jsx` | Footer settings (logo, links, description, copyright) |
| 6 | `src/View/Cms/SiteFooter/SiteFooter.css` | Footer grid layout styles |

> [!NOTE]
> `src/View/Cms/News/CreateNews/` exists but is **empty/placeholder** — you can skip it or include it if you plan to build news later.

---

### 2. Shared Components Used by CMS (8 files)
These are the reusable components that CMS imports. **If the other admin already has similar components, you may not need these — just adjust imports.**

| # | File | Used By |
|---|------|---------|
| 7 | `src/Components/CommonFileUpload/CommonFileUpload.jsx` | Cms, SiteHeader, SiteFooter |
| 8 | `src/Components/CommonFileUpload/CommonFileUpload.css` | Styles for drag-drop file upload |
| 9 | `src/Components/CommonInput/CommonInput.jsx` | SiteFooter |
| 10 | `src/Components/CommonInput/CommonInput.css` | Input field styles |
| 11 | `src/Components/CustomTextEditor/CustomTextEditor.jsx` | SiteFooter |
| 12 | `src/Components/CustomTextEditor/CustomTextEditor.css` | Rich text editor styles |
| 13 | `src/Components/CommonTextarea/CommonTextarea.jsx` | SiteFooter |
| 14 | `src/Components/CommonTextarea/CommonTextarea.css` | Textarea styles |

---

### 3. NPM Dependency Required
The `CustomTextEditor` component uses **DOMPurify** for sanitizing HTML:
```bash
npm install dompurify
```

### 4. External Dependency (CDN)
The components use **Font Awesome** icons. Make sure this is in the target project's `index.html`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.x.x/css/all.min.css" />
```

---

## 🔗 Routing Setup Needed
In the target project's router, add these two routes inside the main layout:
```jsx
<Route path="cms" element={<Cms />} />
<Route path="cms/create-news" element={<CreateNews />} />
```

---

## 🤖 Prompt to Give the Other Agent

Copy everything below this line and paste it to the other AI agent:

---

````
I am pasting a complete CMS module from another React admin panel into this project. I need you to integrate it properly. Here's what I'm providing and what needs to happen:

## What I'm Pasting

I'm copying these folders/files into this project:

**CMS Pages** → place in `src/View/Cms/` (or wherever this project keeps its page views):
- `Cms.jsx` + `Cms.css` — Main CMS page with tabbed navigation (Favicon, Header, Footer, Social Media Links, Contact Info)
- `SiteHeader/SiteHeader.jsx` + `SiteHeader.css` — Header settings sub-tab
- `SiteFooter/SiteFooter.jsx` + `SiteFooter.css` — Footer settings sub-tab

**Shared Components** → place in `src/Components/` (or wherever this project keeps shared components):
- `CommonFileUpload/CommonFileUpload.jsx` + `CommonFileUpload.css` — Drag & drop file upload with preview, validation, multi-file support
- `CommonInput/CommonInput.jsx` + `CommonInput.css` — Reusable labeled input field
- `CustomTextEditor/CustomTextEditor.jsx` + `CustomTextEditor.css` — Rich text editor (bold, italic, underline, lists) with DOMPurify sanitization
- `CommonTextarea/CommonTextarea.jsx` + `CommonTextarea.css` — Reusable labeled textarea

## What You Need to Do

1. **Fix all import paths** — The pasted components use relative imports like `../../Components/CommonFileUpload/CommonFileUpload`. Update all import paths to match this project's folder structure.

2. **Check for duplicate components** — If this project already has similar components (file upload, input, textarea, text editor), either:
   - Reuse the existing ones and update the CMS imports to point to them, OR
   - Keep mine but rename them to avoid conflicts

3. **Add routing** — Add a route for the CMS page in this project's router:
   ```jsx
   <Route path="cms" element={<Cms />} />
   ```

4. **Add sidebar/nav link** — Add a "CMS" link in the admin sidebar/navigation that points to `/dashboard/cms` (or whatever the base path is in this project).

5. **Install DOMPurify** — The CustomTextEditor requires it:
   ```bash
   npm install dompurify
   ```

6. **Check Font Awesome** — The components use Font Awesome icons (`fa-solid fa-angle-down`, `fa-solid fa-list-ol`, `fa-solid fa-list`). Make sure Font Awesome is loaded in this project. If not, add it.

7. **CSS class conflicts** — Check if any of these CSS class names conflict with existing styles in this project:
   - `.cms_wrapper`, `.cms_header_wrapper`, `.inside_box_wrapper`, `._list_wrapper`, `.site_settings_content_wrapper`
   - `.site_header_wrapper`, `.site_header_form_wrapper`
   - `.footer_gird_wrapper`, `.footer_form_wrapper`
   - `.cfu-*` (all file upload classes)
   - `.account_input_form` (shared by CommonInput, CommonTextarea, and CustomTextEditor)
   - `.editor-container`, `.toolbar`, `.editor`
   
   If there are conflicts, namespace/prefix them.

8. **Match the project's design system** — If this project uses a different color scheme, font, or design language, adjust the CMS styles to blend in. The current CMS uses:
   - Primary blue: `rgba(0, 87, 255, 1)` for active tab highlights
   - Purple accent: `#6600CC` for file upload hover states  
   - Border color: `rgba(224, 229, 242, 1)`
   - Border radius: `15px` for cards, `10px` for inputs

## Component Architecture Summary

```
Cms.jsx (main page)
├── Tab: "Favicon" → renders <CommonFileUpload />
├── Tab: "Header" → renders <SiteHeader />
│   └── SiteHeader.jsx → uses <CommonFileUpload /> (×2)
├── Tab: "Footer" → renders <SiteFooter />
│   └── SiteFooter.jsx → uses <CommonFileUpload />, <CommonInput /> (×4), 
│       <CustomTextEditor /> (×2), <CommonTextarea />
├── Tab: "Social Media Links" → (not yet built, just the tab exists)
└── Tab: "Contact Info" → (not yet built, just the tab exists)
```

Please integrate all of this cleanly, fix paths, resolve conflicts, and make the CMS section accessible from the sidebar. Keep the same functionality and design but adapt it to fit this project's structure.
````

---

> [!TIP]
> Before pasting the prompt, first copy all 14 files into the other project's `src/` folder in the appropriate locations. Then give the agent the prompt above — it will handle all the wiring.

> [!IMPORTANT]
> If the other project uses **TypeScript**, tell the agent to also convert the `.jsx` files to `.tsx` and add proper type annotations.
