# WPD Admin — CMS API Specification

API contract for the WPD Admin CMS frontend. Use this to implement backend endpoints that match the current UI field structures so frontend integration stays straightforward.

---

## 1. Conventions

| Item | Rule |
|------|------|
| Base path | `/admin` (or project equivalent, e.g. `/api/admin`) |
| Auth | Bearer token / session cookie (same as other admin routes) |
| Content type (JSON) | `application/json` |
| Content type (files) | `multipart/form-data` — **do not** set `Content-Type` manually on the client |
| Dates | ISO 8601 preferred in API (`2024-12-06T00:00:00.000Z`); frontend may format for display |
| IDs | Integer or UUID; frontend currently uses numeric/string IDs |
| Local-only IDs | Frontend may send temporary IDs like `new-1700000000` or `element-1700000000` for **new** sections/elements. **Do not persist these.** Omit them on create, or ignore and return real IDs. On update, only treat numeric/UUID IDs as existing rows. |
| Empty rich text | Treat `<p></p>`, `<br>`, whitespace-only HTML as empty |
| Image types | `png`, `jpg`, `jpeg`, `webp` (blog feature image also allows webp) |
| Image size (site settings UI) | Max **250 KB** (favicon / logos / header / footer logo) |
| Standard success envelope | See below |
| Standard error envelope | See below |

### 1.1 Success response

```json
{
  "success": true,
  "message": "Optional human message",
  "data": {}
}
```

### 1.2 Error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 1.3 Image / file edit rule (important)

| Case | What frontend sends | What backend should do |
|------|---------------------|------------------------|
| New upload | Binary `File` in multipart | Store file, save URL/path |
| Keep existing | Existing URL string (or omit field) | Keep previous file |
| Clear / remove | `null` or empty (if product requires clear) | Optional; confirm with product if needed |

---

## 2. Frontend routes (for context)

| UI page | Frontend route |
|---------|----------------|
| CMS (Site Settings + Pages) | `/cms` |
| All Blogs | `/cms/blogs` |
| Create Blog | `/cms/blogs/add-blogs` |
| Blog Categories | `/cms/blogs/blog-categories` |
| Edit Blog (planned) | `/cms/blogs/edit-blog/:id` |

---

## 3. Blog Categories

### 3.1 Schema — `blog_categories`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer / uuid | auto | Primary key |
| `name` | string | yes | Unique category name |
| `slug` | string | optional | Auto-generate from name if useful |
| `blog_count` | integer | computed | Count of blogs in this category (not stored, or cached) |
| `status` | enum | optional | `active` / `inactive` (default `active`) |
| `created_at` | datetime | auto | |
| `updated_at` | datetime | auto | |

### 3.2 List categories

`GET /admin/blog-categories`

**Query (optional):**

| Param | Type | Notes |
|-------|------|-------|
| `search` | string | Filter by name |
| `page` | number | Pagination |
| `per_page` | number | Default 10–50 |

**Response `data`:**

```json
[
  {
    "id": 1,
    "name": "Technology",
    "blog_count": 2,
    "created_at": "2026-01-10T10:00:00.000Z",
    "updated_at": "2026-01-10T10:00:00.000Z"
  }
]
```

**Frontend mapping:**

| API field | UI column |
|-----------|-----------|
| `name` | Blog Name |
| `blog_count` | Number of Blogs |
| `id` | Actions (edit/delete) |

### 3.3 Create category

`POST /admin/blog-categories`

**Content-Type:** `application/json`

**Payload:**

```json
{
  "name": "Technology"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |

**Response `data`:** created category object (include `id`, `name`, `blog_count: 0`).

### 3.4 Update category

`PUT /admin/blog-categories/:id`  
(or `POST /admin/blog-categories/:id` with `_method=PUT` if following Laravel-style)

**Payload:**

```json
{
  "name": "Cloud Computing"
}
```

### 3.5 Delete category

`DELETE /admin/blog-categories/:id`

**Rules (recommended):**

- If category has blogs (`blog_count > 0`), either:
  - **Block delete** with `409` / validation error, or
  - Require reassignment / cascade policy (confirm with product)
- Frontend currently confirms delete with a modal before calling API

---

## 4. Blogs (Blog Management)

### 4.1 Schema — `blogs`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer / uuid | auto | |
| `name` | string | yes | Blog title (`Blog Name*` in UI) |
| `blog_category_id` | integer / uuid | yes | FK → `blog_categories.id` |
| `feature_image` | string (URL/path) | recommended | Feature / thumbnail image |
| `share_facebook` | boolean | no | Default `true` in UI |
| `share_twitter` | boolean | no | Default `true` in UI |
| `share_linkedin` | boolean | no | Default `false` in UI |
| `excerpt` | string / text | optional | Auto from first description element, or separate field later |
| `status` | enum | optional | `draft` / `published` |
| `published_at` | datetime | optional | Used on card date |
| `created_at` | datetime | auto | |
| `updated_at` | datetime | auto | |

### 4.2 Schema — `blog_sections`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer / uuid | auto | |
| `blog_id` | integer / uuid | yes | FK → `blogs.id` |
| `order` | integer | yes | 0-based position (drag reorder) |
| `created_at` | datetime | auto | |
| `updated_at` | datetime | auto | |

### 4.3 Schema — `blog_section_elements`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer / uuid | auto | |
| `section_id` | integer / uuid | yes | FK → `blog_sections.id` |
| `type` | enum | yes | `heading` \| `description` \| `image` \| `table` \| `faq` \| `button` |
| `order` | integer | yes | 0-based within section |
| `data` | json | yes | Type-specific payload (see §4.4) |
| `created_at` | datetime | auto | |
| `updated_at` | datetime | auto | |

> Alternative: store each type in typed columns / child tables. JSON `data` matches the frontend structure 1:1 and is the easiest integration path.

### 4.4 Element `data` schemas (exact frontend shapes)

#### `heading`

```json
{
  "level": "h1",
  "text": "Build Better Content, Faster"
}
```

| Field | Type | Values / notes |
|-------|------|----------------|
| `level` | string | `h1` \| `h2` \| `h3` (default `h1`) |
| `text` | string | Heading text |

#### `description`

```json
{
  "html": "<p>Write your description here...</p>"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `html` | string (HTML) | From rich text editor |

#### `image`

```json
{
  "image": "https://cdn.example.com/blogs/feature.png",
  "caption": "Optional caption"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `image` | file on write / URL string on read | Required for a useful image block |
| `caption` | string | Optional |

On **multipart create/update**, section image files are better sent as separate files (see FormData mapping below). Persist the stored URL into `data.image`.

#### `table`

```json
{
  "columns": [
    { "id": "col-1", "name": "Column 1" },
    { "id": "col-2", "name": "Column 2" },
    { "id": "col-3", "name": "Column 3" }
  ],
  "rows": [
    {
      "id": "row-1",
      "cells": {
        "col-1": "A",
        "col-2": "B",
        "col-3": "C"
      }
    }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `columns[].id` | string | Stable key for cells |
| `columns[].name` | string | Header label |
| `rows[].id` | string | Row key |
| `rows[].cells` | object | Map `columnId → cell text` |

Default UI starts at **3 columns × 3 rows**.

#### `faq`

```json
{
  "items": [
    {
      "id": "faq-1",
      "question": "What is WPD?",
      "answer": "..."
    }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `items[].id` | string | Local/stable FAQ item id |
| `items[].question` | string | |
| `items[].answer` | string | |

UI always keeps at least one FAQ item.

#### `button`

```json
{
  "name": "Join Us",
  "url": "www.joinus.com"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Button label |
| `url` | string | Button link |

### 4.5 List blogs

`GET /admin/blogs`

**Query (optional):** `search`, `blog_category_id`, `page`, `per_page`

**Response `data` item (card UI):**

```json
{
  "id": 1,
  "name": "The Role of IT in Modern Businesses",
  "title": "The Role of IT in Modern Businesses",
  "category": "Tech Blog",
  "blog_category_id": 1,
  "feature_image": "https://cdn.example.com/blogs/1.jpg",
  "thumbnail": "https://cdn.example.com/blogs/1.jpg",
  "excerpt": "Lorem ipsum dolor sit amet...",
  "published_at": "2024-12-06T00:00:00.000Z",
  "date": "12/6/2024",
  "share_facebook": true,
  "share_twitter": true,
  "share_linkedin": false
}
```

**Frontend card fields today:**

| UI | Preferred API field |
|----|---------------------|
| Title | `name` (or `title` alias) |
| Category badge | `category` (name) or nested `blog_category.name` |
| Thumbnail | `feature_image` / `thumbnail` |
| Date | `published_at` or formatted `date` |
| Excerpt | `excerpt` |

### 4.6 Get blog by ID (edit form)

`GET /admin/blogs/:id`

**Response `data`:**

```json
{
  "id": 1,
  "name": "AI & Machine Learning Trends 2024",
  "blog_category_id": 8,
  "feature_image": "https://cdn.example.com/blogs/ai.png",
  "share_facebook": true,
  "share_twitter": true,
  "share_linkedin": false,
  "sections": [
    {
      "id": 10,
      "order": 0,
      "elements": [
        {
          "id": 100,
          "type": "heading",
          "order": 0,
          "data": { "level": "h1", "text": "Build Better Content, Faster" }
        },
        {
          "id": 101,
          "type": "description",
          "order": 1,
          "data": { "html": "<p>Hello world</p>" }
        },
        {
          "id": 102,
          "type": "button",
          "order": 2,
          "data": { "name": "Join Us", "url": "www.joinus.com" }
        }
      ]
    }
  ]
}
```

### 4.7 Create blog

`POST /admin/blogs`

**Content-Type:** `multipart/form-data`

#### Top-level fields

| Form field | Type | Required | Frontend source |
|------------|------|----------|-----------------|
| `name` | string | yes | Blog Name |
| `blog_category_id` | string/number | yes | Select Category |
| `feature_image` | file | recommended | Feature Image upload |
| `share_facebook` | `"true"` / `"false"` | no | Share checkbox |
| `share_twitter` | `"true"` / `"false"` | no | Share checkbox |
| `share_linkedin` | `"true"` / `"false"` | no | Share checkbox |
| `sections` | JSON string **or** nested FormData keys | no | Sections array |

#### Recommended approach A — nested FormData (best for images inside elements)

```text
name = AI & Machine Learning Trends 2024
blog_category_id = 8
share_facebook = true
share_twitter = true
share_linkedin = false
feature_image = <File>

sections[0][order] = 0
sections[0][elements][0][type] = heading
sections[0][elements][0][order] = 0
sections[0][elements][0][data][level] = h1
sections[0][elements][0][data][text] = Build Better Content, Faster

sections[0][elements][1][type] = description
sections[0][elements][1][order] = 1
sections[0][elements][1][data][html] = <p>Hello</p>

sections[0][elements][2][type] = image
sections[0][elements][2][order] = 2
sections[0][elements][2][data][caption] = Optional caption
sections[0][elements][2][data][image] = <File>

sections[0][elements][3][type] = button
sections[0][elements][3][order] = 3
sections[0][elements][3][data][name] = Join Us
sections[0][elements][3][data][url] = www.joinus.com

sections[0][elements][4][type] = table
sections[0][elements][4][order] = 4
sections[0][elements][4][data] = {"columns":[...],"rows":[...]}   # JSON string OK

sections[0][elements][5][type] = faq
sections[0][elements][5][order] = 5
sections[0][elements][5][data] = {"items":[{"question":"...","answer":"..."}]}
```

#### Recommended approach B — JSON + files

| Field | Value |
|-------|-------|
| `payload` | JSON string of blog + sections + elements (non-file fields) |
| `feature_image` | file |
| `section_images[sectionIndex][elementIndex]` | file for image elements |

Frontend can adapt to whichever approach backend chooses — **pick one and document it**. Approach A is closest to typical Laravel FormRequest parsing.

#### Create rules

- Do **not** require frontend local IDs (`new-...`, `element-...`)
- Persist `order` from array index if `order` omitted
- Return created blog with real IDs for sections/elements

### 4.8 Update blog

`POST /admin/blogs/:id` with `_method=PUT`  
**or** `PUT /admin/blogs/:id` (multipart if files present)

Same fields as create, plus:

| Form field | Notes |
|------------|-------|
| `sections[i][id]` | Send only for **existing** backend section IDs |
| `sections[i][elements][j][id]` | Send only for **existing** element IDs |
| New sections/elements | Omit `id` (frontend may still have `new-...` — backend must ignore those) |
| `feature_image` | New `File` **or** existing URL string |

**Sync recommendation for sections on update:**

1. Update sections whose IDs exist
2. Create sections without valid IDs
3. Delete sections that exist in DB but are missing from payload  
   (or accept a `deleted_section_ids[]` array — choose one strategy)

Same for elements inside each section.

### 4.9 Delete blog

`DELETE /admin/blogs/:id`

Cascade-delete sections, elements, and stored images.

---

## 5. Site Settings

Site Settings live on `/cms` with tabs: Favicon, Header, Footer, Social Media Links, Contact Info.

Recommended model: one settings record (singleton) **or** key/value store grouped by section.

### 5.1 Schema options

#### Option A — single table `site_settings` (recommended singleton)

One row (`id = 1`) with typed columns / JSON columns per group.

#### Option B — `site_settings` key-value

| Field | Type |
|-------|------|
| `key` | string unique (`favicon`, `header.logo`, …) |
| `value` | text / json |
| `updated_at` | datetime |

Below field names assume **Option A** with grouped JSON + image URLs.

### 5.2 Full site settings schema

```json
{
  "favicon": {
    "image": "https://cdn.example.com/site/favicon.png"
  },
  "header": {
    "logo": "https://cdn.example.com/site/header-logo.png",
    "page_header_image": "https://cdn.example.com/site/page-header.png"
  },
  "footer": {
    "logo": "https://cdn.example.com/site/footer-logo.png",
    "app_store_link": "www.appstore.com",
    "google_play_link": "www.googleplay.com",
    "description": "<p>Footer HTML...</p>",
    "copyright": "© 2026 GateLink Event. All rights reserved.",
    "title": "Join as Promoter",
    "button_name": "Join Us",
    "button_url": "www.joinus.com",
    "button_description": "<p>CTA description HTML...</p>"
  },
  "social": {
    "facebook_url": "www.facebook.com",
    "instagram_url": "www.instagram.com",
    "linkedin_url": "www.linkedin.com",
    "twitter_url": "www.tweeter.com"
  },
  "contact": {
    "address_line_1": "20 Cooper Square",
    "address_line_2": "Marquardt Route",
    "landmark": "Lake Oscar",
    "city": "Lake Oscar",
    "state": "new-york",
    "zipcode": "62704",
    "email": "hello@eventvibe.com",
    "phone": "+1 8973487340"
  }
}
```

### 5.3 Field tables (frontend ↔ API)

#### Favicon

| Frontend state | API field | Type | Required |
|----------------|-----------|------|----------|
| `favicon` | `favicon` / `favicon.image` | file / URL | yes (UI marked *) |

#### Header

| Frontend state | API field | Type | Required |
|----------------|-----------|------|----------|
| `headerLogo` | `header_logo` / `header.logo` | file / URL | yes |
| `pageHeaderImage` | `page_header_image` / `header.page_header_image` | file / URL | yes |

#### Footer

| Frontend state | API field | Type | Required |
|----------------|-----------|------|----------|
| `footer.logo` | `footer_logo` / `footer.logo` | file / URL | yes |
| `footer.appStoreLink` | `app_store_link` | string | no |
| `footer.googlePlayLink` | `google_play_link` | string | no |
| `footer.description` | `footer_description` | HTML string | yes |
| `footer.copyright` | `copyright` | string | yes |
| `footer.title` | `footer_title` | string | yes |
| `footer.buttonName` | `footer_button_name` | string | yes |
| `footer.buttonUrl` | `footer_button_url` | string | yes |
| `footer.buttonDescription` | `footer_button_description` | HTML string | yes |

#### Social Media Links

| Frontend state | API field | Type | Required |
|----------------|-----------|------|----------|
| `socialLinks.facebook` | `facebook_url` | string | no |
| `socialLinks.instagram` | `instagram_url` | string | no |
| `socialLinks.linkedin` | `linkedin_url` | string | no |
| `socialLinks.twitter` | `twitter_url` | string | no |

#### Contact Info

| Frontend state | API field | Type | Required |
|----------------|-----------|------|----------|
| `contact.addressLine1` | `address_line_1` | string | yes |
| `contact.addressLine2` | `address_line_2` | string | no |
| `contact.landmark` | `landmark` | string | no |
| `contact.city` | `city` | string | yes |
| `contact.state` | `state` | string | yes |
| `contact.zipcode` | `zipcode` | string | yes |
| `contact.email` | `email` | string (email) | yes |
| `contact.phone` | `phone` | string | yes |

### 5.4 Get site settings

`GET /admin/site-settings`

**Response `data`:** full object from §5.2 (image fields as public URLs).

### 5.5 Update site settings

**Recommended:** one upsert endpoint.

`POST /admin/site-settings`  
(or `PUT /admin/site-settings`)

**Content-Type:** `multipart/form-data`

#### Example FormData (flat keys)

```text
favicon = <File or existing URL>
header_logo = <File or existing URL>
page_header_image = <File or existing URL>

footer_logo = <File or existing URL>
app_store_link = www.appstore.com
google_play_link = www.googleplay.com
footer_description = <p>...</p>
copyright = © 2026 GateLink Event. All rights reserved.
footer_title = Join as Promoter
footer_button_name = Join Us
footer_button_url = www.joinus.com
footer_button_description = <p>...</p>

facebook_url = www.facebook.com
instagram_url = www.instagram.com
linkedin_url = www.linkedin.com
twitter_url = www.tweeter.com

address_line_1 = 20 Cooper Square
address_line_2 = Marquardt Route
landmark = Lake Oscar
city = Lake Oscar
state = new-york
zipcode = 62704
email = hello@eventvibe.com
phone = +1 8973487340
```

#### Alternative: tab-scoped updates

If easier for UI “Save” per tab later:

| Endpoint | Body |
|----------|------|
| `POST /admin/site-settings/favicon` | favicon file/URL |
| `POST /admin/site-settings/header` | header logos |
| `POST /admin/site-settings/footer` | footer fields |
| `POST /admin/site-settings/social` | social URLs |
| `POST /admin/site-settings/contact` | contact fields |

Frontend can support either; **one full upsert is enough for v1**.

### 5.6 Validation notes

- Images: `png|jpg|jpeg` (webp allowed for blog feature image; site settings UI text says png/jpg/jpeg, 250 KB)
- `email` must be valid email
- Required fields marked in UI should return `422` with field errors

---

## 6. CMS Pages (optional / future)

UI currently shows static page cards:

`Home`, `About`, `Join as promoter`, `Contact`, `Blog`, `Privacy Policy`, `Refund Policy`, `Terms & Conditions`

Only **Blog** is wired (`/cms/blogs`). Other pages are placeholders.

If backend will support page CMS later:

### Suggested schema — `cms_pages`

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer / uuid | |
| `slug` | string unique | `home`, `about`, `contact`, … |
| `title` | string | |
| `content` | json / HTML | Page builder payload later |
| `status` | enum | `draft` / `published` |
| `updated_at` | datetime | |

### Suggested endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/cms-pages` | List pages for CMS grid |
| `GET` | `/admin/cms-pages/:slug` | Get one page |
| `PUT` | `/admin/cms-pages/:slug` | Update page content |

Not required for Blog + Site Settings v1.

---

## 7. Endpoint summary checklist

### Blog Categories

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/admin/blog-categories` | List |
| `POST` | `/admin/blog-categories` | Create |
| `PUT` | `/admin/blog-categories/:id` | Update |
| `DELETE` | `/admin/blog-categories/:id` | Delete |

### Blogs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/admin/blogs` | List (cards) |
| `GET` | `/admin/blogs/:id` | Detail (edit) |
| `POST` | `/admin/blogs` | Create (multipart) |
| `POST/PUT` | `/admin/blogs/:id` | Update (multipart) |
| `DELETE` | `/admin/blogs/:id` | Delete |

### Site Settings

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/admin/site-settings` | Load all tabs |
| `POST/PUT` | `/admin/site-settings` | Upsert all / partial |

---

## 8. Frontend form state reference (integration mapping)

### Create Blog (`AddBlogPage`)

```js
formData = {
  name: '',
  category: '',              // maps to blog_category_id
  featureImage: null,        // File | URL
  share: {
    facebook: true,
    twitter: true,
    linkedin: false
  }
}

sections = [
  {
    id: 'new-1700000000',    // local only on create
    collapsed: false,        // UI only — do not persist
    elements: [
      {
        id: 'element-1700000001', // local only on create
        type: 'heading' | 'description' | 'image' | 'table' | 'faq' | 'button',
        data: { /* type schema in §4.4 */ }
      }
    ]
  }
]
```

### Blog Category dialog

```js
{ name: '' }
```

### Site Settings state

```js
favicon                  // File | URL | null
headerLogo               // File | URL | null
pageHeaderImage          // File | URL | null
footer = {
  logo, appStoreLink, googlePlayLink,
  description, copyright,
  title, buttonName, buttonUrl, buttonDescription
}
socialLinks = { facebook, instagram, linkedin, twitter }
contact = {
  addressLine1, addressLine2, landmark,
  city, state, zipcode, email, phone
}
```

---

## 9. Implementation notes for backend

1. **Prefer multipart** for any endpoint that accepts images.
2. **Ignore frontend local IDs** that start with `new-`, `element-`, `faq-`, `col-`, `row-` unless they are already persisted UUIDs you issued.
3. Persist section/element **order** from payload array index.
4. On blog list, return enough fields for the card grid without requiring a second request.
5. On blog detail, return nested `sections[].elements[]` so edit form can hydrate 1:1.
6. Keep HTML for description/footer fields as stored HTML (sanitized server-side recommended).
7. For table/faq JSON, validate structure lightly; do not flatten unless needed for public website rendering.
8. Return absolute image URLs in all GET responses.

---

## 10. Open decisions (confirm with product / frontend)

| Topic | Options |
|-------|---------|
| Blog delete from card UI | Soft delete vs hard delete |
| Category delete with blogs | Block vs cascade vs nullify FK |
| Site settings save UX | One global Save vs save per tab |
| Public website APIs | Separate `/api/public/...` read endpoints |
| Auth header name | `Authorization: Bearer <token>` vs cookie session |
| Update verb | Pure `PUT` vs `POST` + `_method=PUT` |

---

## 11. Minimal acceptance criteria for API handoff

Backend is ready for frontend integration when:

- [ ] Category CRUD works and returns `blog_count`
- [ ] Blog list returns card fields (`name`, category label, image, date, excerpt)
- [ ] Blog create accepts multipart + nested sections/elements
- [ ] Blog get-by-id returns nested sections/elements with real IDs
- [ ] Blog update keeps old images when no new file is uploaded
- [ ] Site settings GET hydrates all 5 tabs
- [ ] Site settings POST/PUT accepts files + text fields and returns updated URLs

---

*Generated for WPD Admin CMS frontend — Blog Categories, Blog Management (sections/elements), and Site Settings (Favicon, Header, Footer, Social, Contact).*
