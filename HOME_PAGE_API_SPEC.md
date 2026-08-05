# WPD Admin — Home Page CMS API Specification

API / database contract for the **Home Page CMS** editor in WPD Admin.  
Frontend route: `/cms/pages/home`  
Use this document to implement backend endpoints and tables that match the current UI 1:1 so frontend integration stays straightforward.

Base URL (current env):

```text
https://wpd-api.webprismdynamics.com/api/admin/
```

Recommended resource path:

```text
GET    /admin/pages/home
POST   /admin/pages/home          # create or full replace (multipart)
PUT    /admin/pages/home          # update (multipart) — or POST + _method=PUT if PUT is not registered
```

If your routing prefers a page slug:

```text
GET/POST/PUT /admin/pages/{slug}   where slug = "home"
```

---

## 1. Conventions

| Item | Rule |
|------|------|
| Auth | Bearer token (`Authorization: Bearer {token}`) — same as other admin routes |
| Content type (JSON read) | `application/json` |
| Content type (write with files) | `multipart/form-data` — **do not** force `Content-Type` on the client; browser sets boundary |
| Dates | ISO 8601 (`2026-08-04T10:00:00.000Z`) |
| IDs | Integer or UUID preferred in DB |
| Local-only frontend IDs | Temporary IDs like `service-1700000000-0`, `intro-…`, `feature-…`, `industry-…`, `testimonial-…`, `tech-…`, `keyphrase-…`. **Do not persist these.** Ignore on create; only treat real DB IDs as existing rows on update |
| Empty rich text | Treat `<p></p>`, `<br>`, `&nbsp;`, whitespace-only HTML as empty |
| Image types | `png`, `jpg`, `jpeg`, `webp` (technology icons may also allow `svg`) |
| Image edit rule | New upload = file; keep existing = URL string; optional clear = `null` / omit |
| Ordering | Persist `sort_order` / `order` from array index (0-based) |
| Success envelope | `{ "success": true, "message": "...", "data": {} }` |
| Error envelope | `{ "success": false, "message": "...", "errors": { "field": ["..."] } }` |

### 1.1 Success response

```json
{
  "success": true,
  "message": "Home page saved successfully.",
  "data": {}
}
```

### 1.2 Error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "banner.heading": ["Heading is required"],
    "services.section_title": ["Section title is required"]
  }
}
```

### 1.3 Image / file edit rule

| Case | Frontend sends | Backend should |
|------|----------------|----------------|
| New upload | Binary `File` in multipart | Store file, save public URL/path |
| Keep existing | Existing URL string (or omit field) | Keep previous file |
| Clear / remove | `null` / empty (if product requires) | Optional — confirm with product |

---

## 2. Frontend context

| UI | Route | Header actions |
|----|-------|----------------|
| Home Page CMS | `/cms/pages/home` | Settings (SEO dialog) + **Save** |

### 2.1 Sections on the page (top → bottom)

1. Banner  
2. Our Services (repeatable cards)  
3. Why Choose Us (section image + draggable intro/feature blocks + CTA)  
4. Industries We Serve (repeatable cards)  
5. Our Testimonials (repeatable cards)  
6. Technologies We Use (repeatable cards)  
7. SEO Settings (opened from header gear icon — saved with the page)

### 2.2 Current frontend validation (minimum)

| Field | Required today |
|-------|----------------|
| `banner.heading` | **Yes** |
| `services.sectionTitle` | **Yes** (validated in UI) |
| Everything else | Optional in UI today (backend may still enforce recommended rules) |

---

## 3. Frontend state shape (source of truth)

This is the exact in-memory shape used by `HomePageCms` + `createEmptyHomeForm()` + SEO dialog.

```json
{
  "banner": {
    "backgroundImage": null,
    "heading": "",
    "subheading": "",
    "buttonName": "",
    "buttonUrl": ""
  },
  "services": {
    "sectionTitle": "Our Services",
    "items": [
      {
        "id": "service-1700000000-0",
        "title": "",
        "description": "",
        "icon": null,
        "image": null
      }
    ]
  },
  "whyChooseUs": {
    "sectionTitle": "Why Choose Us",
    "image": null,
    "blocks": [
      {
        "id": "intro-1700000000-0",
        "type": "intro",
        "html": ""
      },
      {
        "id": "feature-1700000000-1",
        "type": "feature",
        "icon": null,
        "title": "",
        "description": ""
      }
    ],
    "buttonName": "",
    "buttonUrl": ""
  },
  "industries": {
    "sectionTitle": "Industries We Serve",
    "items": [
      {
        "id": "industry-1700000000-0",
        "title": "",
        "image": null
      }
    ]
  },
  "testimonials": {
    "sectionTitle": "Our Testimonials",
    "items": [
      {
        "id": "testimonial-1700000000-0",
        "rating": 5,
        "quote": "",
        "authorName": "",
        "authorRole": ""
      }
    ]
  },
  "technologies": {
    "sectionTitle": "Technologies We Use",
    "items": [
      {
        "id": "tech-1700000000-0",
        "name": "",
        "icon": null
      }
    ]
  },
  "seo": {
    "metaTitle": "",
    "metaDescription": "",
    "relatedKeyphrases": [
      {
        "id": "keyphrase-1700000000-0",
        "text": ""
      }
    ]
  }
}
```

### 3.1 CamelCase → snake_case mapping

| Frontend | API / DB |
|----------|----------|
| `backgroundImage` | `background_image` |
| `buttonName` | `button_name` |
| `buttonUrl` | `button_url` |
| `sectionTitle` | `section_title` |
| `whyChooseUs` | `why_choose_us` |
| `authorName` | `author_name` |
| `authorRole` | `author_role` |
| `metaTitle` | `meta_title` |
| `metaDescription` | `meta_description` |
| `relatedKeyphrases` | `related_keyphrases` |

Images may be:

- `File` on write (multipart)
- URL `string` on read / when keeping existing image

---

## 4. Recommended database design

Home page is a **singleton CMS page** (one active Home record). Prefer normalized child tables for repeatable items so ordering and file URLs are easy to manage.

### 4.1 Option A — normalized (recommended)

#### Table: `home_pages`

Singleton parent row for the Home CMS page.

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `slug` | `VARCHAR(50)` UNIQUE | no | Always `"home"` |
| `status` | `ENUM('draft','published')` | no | Default `'draft'` if needed |
| `created_at` | `TIMESTAMP` | no | |
| `updated_at` | `TIMESTAMP` | no | |

```sql
CREATE TABLE home_pages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table: `home_banners` (1:1 with home_pages)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK → `home_pages.id` | no | UNIQUE |
| `background_image` | `VARCHAR(500)` | yes | Stored URL/path |
| `heading` | `VARCHAR(255)` | no | Required in UI |
| `subheading` | `TEXT` | yes | |
| `button_name` | `VARCHAR(120)` | yes | |
| `button_url` | `VARCHAR(500)` | yes | |
| `created_at` | `TIMESTAMP` | no | |
| `updated_at` | `TIMESTAMP` | no | |

```sql
CREATE TABLE home_banners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  background_image VARCHAR(500) NULL,
  heading VARCHAR(255) NOT NULL,
  subheading TEXT NULL,
  button_name VARCHAR(120) NULL,
  button_url VARCHAR(500) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_banners_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);
```

#### Table: `home_service_sections` (1:1 section header)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK | no | UNIQUE |
| `section_title` | `VARCHAR(255)` | no | Default `"Our Services"` |
| `created_at` / `updated_at` | `TIMESTAMP` | no | |

#### Table: `home_services` (1:N cards)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK | no | |
| `title` | `VARCHAR(255)` | yes | |
| `description` | `TEXT` | yes | |
| `icon` | `VARCHAR(500)` | yes | URL |
| `image` | `VARCHAR(500)` | yes | Featured image URL |
| `sort_order` | `INT` | no | 0-based |
| `created_at` / `updated_at` | `TIMESTAMP` | no | |

```sql
CREATE TABLE home_service_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Our Services',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_service_sections_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NULL,
  description TEXT NULL,
  icon VARCHAR(500) NULL,
  image VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_services_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  INDEX idx_home_services_order (home_page_id, sort_order)
);
```

#### Table: `home_why_choose_us` (1:1 section)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK | no | UNIQUE |
| `section_title` | `VARCHAR(255)` | no | Default `"Why Choose Us"` |
| `image` | `VARCHAR(500)` | yes | Section image URL |
| `button_name` | `VARCHAR(120)` | yes | |
| `button_url` | `VARCHAR(500)` | yes | |

#### Table: `home_why_choose_us_blocks` (1:N ordered blocks)

Intro and features share one ordered list (drag-reorder in UI).

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK | no | |
| `type` | `ENUM('intro','feature')` | no | |
| `html` | `LONGTEXT` | yes | Used when `type = intro` (rich text HTML) |
| `icon` | `VARCHAR(500)` | yes | Used when `type = feature` |
| `title` | `VARCHAR(255)` | yes | Feature title |
| `description` | `TEXT` | yes | Feature description |
| `sort_order` | `INT` | no | 0-based across all blocks |

```sql
CREATE TABLE home_why_choose_us (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Why Choose Us',
  image VARCHAR(500) NULL,
  button_name VARCHAR(120) NULL,
  button_url VARCHAR(500) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_why_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_why_choose_us_blocks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  type ENUM('intro', 'feature') NOT NULL,
  html LONGTEXT NULL,
  icon VARCHAR(500) NULL,
  title VARCHAR(255) NULL,
  description TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_why_blocks_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  INDEX idx_home_why_blocks_order (home_page_id, sort_order)
);
```

**Rules for Why Choose Us blocks**

- Always keep **exactly one** `intro` block (UI enforces this).
- Keep **at least one** `feature` block.
- `sort_order` follows UI array order after drag-and-drop.
- For `intro`: persist `html`; ignore `icon/title/description`.
- For `feature`: persist `icon/title/description`; `html` can be null.

#### Table: `home_industry_sections` + `home_industries`

| `home_industry_sections` | Type | Notes |
|--------------------------|------|-------|
| `home_page_id` | FK UNIQUE | |
| `section_title` | `VARCHAR(255)` | Default `"Industries We Serve"` |

| `home_industries` | Type | Notes |
|-------------------|------|-------|
| `home_page_id` | FK | |
| `title` | `VARCHAR(255)` | |
| `image` | `VARCHAR(500)` | Background image URL |
| `sort_order` | `INT` | |

```sql
CREATE TABLE home_industry_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Industries We Serve',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_industry_sections_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_industries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NULL,
  image VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_industries_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  INDEX idx_home_industries_order (home_page_id, sort_order)
);
```

#### Table: `home_testimonial_sections` + `home_testimonials`

| `home_testimonials` column | SQL type | Notes |
|----------------------------|----------|-------|
| `rating` | `TINYINT UNSIGNED` | `1`–`5` (UI options) |
| `quote` | `TEXT` | |
| `author_name` | `VARCHAR(255)` | |
| `author_role` | `VARCHAR(255)` | |
| `sort_order` | `INT` | |

```sql
CREATE TABLE home_testimonial_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Our Testimonials',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_testimonial_sections_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_testimonials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  quote TEXT NULL,
  author_name VARCHAR(255) NULL,
  author_role VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_testimonials_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  CONSTRAINT chk_home_testimonials_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_home_testimonials_order (home_page_id, sort_order)
);
```

#### Table: `home_technology_sections` + `home_technologies`

| `home_technologies` column | SQL type | Notes |
|----------------------------|----------|-------|
| `name` | `VARCHAR(255)` | e.g. React |
| `icon` | `VARCHAR(500)` | URL |
| `sort_order` | `INT` | |

```sql
CREATE TABLE home_technology_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Technologies We Use',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_technology_sections_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_technologies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NULL,
  icon VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_technologies_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  INDEX idx_home_technologies_order (home_page_id, sort_order)
);
```

#### Table: `home_seo` (1:1)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK UNIQUE | no | |
| `meta_title` | `VARCHAR(60)` | yes | UI soft limit 60 chars |
| `meta_description` | `LONGTEXT` | yes | Rich text HTML from editor (plain-text recommend 150–160) |
| `created_at` / `updated_at` | `TIMESTAMP` | no | |

#### Table: `home_seo_keyphrases` (1:N)

| Column | SQL type | Nullable | Notes |
|--------|----------|----------|-------|
| `id` | `BIGINT UNSIGNED` PK AI | no | |
| `home_page_id` | `BIGINT UNSIGNED` FK | no | |
| `keyphrase` | `VARCHAR(255)` | no | |
| `sort_order` | `INT` | no | |

```sql
CREATE TABLE home_seo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL UNIQUE,
  meta_title VARCHAR(60) NULL,
  meta_description LONGTEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_seo_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE
);

CREATE TABLE home_seo_keyphrases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  home_page_id BIGINT UNSIGNED NOT NULL,
  keyphrase VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_seo_keyphrases_page
    FOREIGN KEY (home_page_id) REFERENCES home_pages(id) ON DELETE CASCADE,
  INDEX idx_home_seo_keyphrases_order (home_page_id, sort_order)
);
```

### 4.2 Option B — JSON columns (faster to ship, harder to query)

Single table `home_pages` with JSON columns for each section (`banner_json`, `services_json`, …, `seo_json`) plus separate storage for uploaded files referenced by URL inside JSON.  
Normalized Option A is preferred for ordering, SEO queries, and file lifecycle.

---

## 5. Field dictionary (per section)

### 5.1 Banner

| UI label | Frontend key | API key | Type | Required | Notes |
|----------|--------------|---------|------|----------|-------|
| Background Image | `backgroundImage` | `background_image` | file / URL | no | png/jpg/jpeg/webp |
| Heading | `heading` | `heading` | string | **yes** | |
| Subheading | `subheading` | `subheading` | string/text | no | multiline |
| Button name | `buttonName` | `button_name` | string | no | |
| Button URL | `buttonUrl` | `button_url` | string | no | absolute or relative URL |

### 5.2 Our Services

| UI label | Frontend key | API key | Type | Required | Notes |
|----------|--------------|---------|------|----------|-------|
| Section title | `services.sectionTitle` | `services.section_title` | string | **yes** (UI) | Default `"Our Services"` |
| Service Title | `items[].title` | `items[].title` | string | no | |
| Description | `items[].description` | `items[].description` | text | no | |
| Icon | `items[].icon` | `items[].icon` | file / URL | no | |
| Featured image | `items[].image` | `items[].image` | file / URL | no | |
| Order | array index | `items[].sort_order` | int | yes | |

UI always keeps **at least 1** service item.

### 5.3 Why Choose Us

| UI label | Frontend key | API key | Type | Required | Notes |
|----------|--------------|---------|------|----------|-------|
| Section title | `sectionTitle` | `section_title` | string | no | Default `"Why Choose Us"` |
| Section image | `image` | `image` | file / URL | no | |
| Intro (RTE) | `blocks[type=intro].html` | `blocks[].html` | HTML string | no | Rich text editor |
| Feature icon | `blocks[type=feature].icon` | `blocks[].icon` | file / URL | no | |
| Feature title | `blocks[].title` | `blocks[].title` | string | no | |
| Feature description | `blocks[].description` | `blocks[].description` | text | no | |
| Button name | `buttonName` | `button_name` | string | no | |
| Button URL | `buttonUrl` | `button_url` | string | no | |
| Block type | `blocks[].type` | `blocks[].type` | `intro` \| `feature` | yes | |
| Order | array index | `blocks[].sort_order` | int | yes | Intro + features share one list |

### 5.4 Industries We Serve

| UI label | Frontend key | API key | Type | Notes |
|----------|--------------|---------|------|-------|
| Section title | `sectionTitle` | `section_title` | string | Default `"Industries We Serve"` |
| Title | `items[].title` | `items[].title` | string | |
| Background image | `items[].image` | `items[].image` | file / URL | |
| Order | index | `sort_order` | int | At least 1 item in UI |

### 5.5 Our Testimonials

| UI label | Frontend key | API key | Type | Notes |
|----------|--------------|---------|------|-------|
| Section title | `sectionTitle` | `section_title` | string | Default `"Our Testimonials"` |
| Rating | `items[].rating` | `items[].rating` | int `1..5` | UI select |
| Quote | `items[].quote` | `items[].quote` | text | |
| Author name | `items[].authorName` | `items[].author_name` | string | |
| Author role | `items[].authorRole` | `items[].author_role` | string | |
| Order | index | `sort_order` | int | At least 1 item |

### 5.6 Technologies We Use

| UI label | Frontend key | API key | Type | Notes |
|----------|--------------|---------|------|-------|
| Section title | `sectionTitle` | `section_title` | string | Default `"Technologies We Use"` |
| Name | `items[].name` | `items[].name` | string | |
| Icon | `items[].icon` | `items[].icon` | file / URL | png/jpg/jpeg/webp/svg |
| Order | index | `sort_order` | int | At least 1 item |

### 5.7 SEO Settings

Opened from header settings icon; values are saved with the Home page payload.

| UI label | Frontend key | API key | Type | Notes |
|----------|--------------|---------|------|-------|
| Meta Title | `seo.metaTitle` | `seo.meta_title` | string ≤ 60 | Soft UI limit |
| Meta Description | `seo.metaDescription` | `seo.meta_description` | HTML string | Rich text editor; recommend ~150–160 plain chars |
| Related keyphrase | `seo.relatedKeyphrases[].text` | `seo.related_keyphrases[]` | string array / rows | Accordion “Add related keyphrase” |

---

## 6. API endpoints

### 6.1 Get Home page (hydrate edit form)

`GET /admin/pages/home`

**Headers**

```http
Accept: application/json
Authorization: Bearer {token}
```

**Response `data` (example)**

```json
{
  "id": 1,
  "slug": "home",
  "status": "published",
  "banner": {
    "background_image": "https://cdn.example.com/home/banner.jpg",
    "heading": "Empowering Your Business With Innovative IT Solutions",
    "subheading": "We specialize in delivering high-quality, scalable solutions.",
    "button_name": "Book A Call",
    "button_url": "https://example.com/contact"
  },
  "services": {
    "section_title": "Our Services",
    "items": [
      {
        "id": 11,
        "title": "QA & Testing",
        "description": "Short service description",
        "icon": "https://cdn.example.com/home/services/qa-icon.png",
        "image": "https://cdn.example.com/home/services/qa.jpg",
        "sort_order": 0
      }
    ]
  },
  "why_choose_us": {
    "section_title": "Why Choose Us",
    "image": "https://cdn.example.com/home/why.jpg",
    "button_name": "Learn More",
    "button_url": "https://example.com/about",
    "blocks": [
      {
        "id": 21,
        "type": "intro",
        "html": "<p>Why businesses choose us...</p>",
        "sort_order": 0
      },
      {
        "id": 22,
        "type": "feature",
        "icon": "https://cdn.example.com/home/why/network.png",
        "title": "Networking Expansion",
        "description": "Short feature description",
        "sort_order": 1
      }
    ]
  },
  "industries": {
    "section_title": "Industries We Serve",
    "items": [
      {
        "id": 31,
        "title": "Logistics",
        "image": "https://cdn.example.com/home/industries/logistics.jpg",
        "sort_order": 0
      }
    ]
  },
  "testimonials": {
    "section_title": "Our Testimonials",
    "items": [
      {
        "id": 41,
        "rating": 5,
        "quote": "Great partnership and delivery.",
        "author_name": "Dhiraj Poudel",
        "author_role": "CEO at BSNL",
        "sort_order": 0
      }
    ]
  },
  "technologies": {
    "section_title": "Technologies We Use",
    "items": [
      {
        "id": 51,
        "name": "React",
        "icon": "https://cdn.example.com/home/tech/react.svg",
        "sort_order": 0
      }
    ]
  },
  "seo": {
    "meta_title": "Home | WPD",
    "meta_description": "<p>Innovative IT solutions for modern businesses.</p>",
    "related_keyphrases": [
      { "id": 61, "keyphrase": "it solutions", "sort_order": 0 },
      { "id": 62, "keyphrase": "software development", "sort_order": 1 }
    ]
  },
  "created_at": "2026-08-01T10:00:00.000Z",
  "updated_at": "2026-08-04T10:00:00.000Z"
}
```

**Frontend hydration mapping**

| API | Frontend |
|-----|----------|
| `banner.background_image` | `banner.backgroundImage` |
| `services.section_title` | `services.sectionTitle` |
| `why_choose_us` | `whyChooseUs` |
| `why_choose_us.blocks[]` | `whyChooseUs.blocks[]` (preserve `sort_order`) |
| `testimonials.items[].author_name` | `authorName` |
| `seo.meta_title` | `seo.metaTitle` |
| `seo.related_keyphrases[].keyphrase` | `seo.relatedKeyphrases[].text` |

If no Home row exists yet, return empty defaults matching `createEmptyHomeForm()` + empty SEO, **or** auto-create a draft singleton on first GET.

---

### 6.2 Save / update Home page

`POST /admin/pages/home`  
(or `PUT /admin/pages/home` if supported; otherwise `POST` with `_method=PUT` only if your framework expects method spoofing)

**Content-Type:** `multipart/form-data`

#### Recommended approach — nested FormData + JSON fallback

Send scalar fields + nested keys for items, plus files as separate parts. Also accept a `payload` / `sections_json`-style JSON string for non-file fields if easier.

##### Top-level / section scalars

```text
banner[heading] = Empowering Your Business With Innovative IT Solutions
banner[subheading] = We specialize in...
banner[button_name] = Book A Call
banner[button_url] = https://example.com/contact
banner[background_image] = <File>   # or existing URL string

services[section_title] = Our Services
services[items][0][id] = 11                 # existing DB id only
services[items][0][title] = QA & Testing
services[items][0][description] = Short service description
services[items][0][sort_order] = 0
services[items][0][icon] = <File>
services[items][0][image] = <File>

why_choose_us[section_title] = Why Choose Us
why_choose_us[button_name] = Learn More
why_choose_us[button_url] = https://example.com/about
why_choose_us[image] = <File>
why_choose_us[blocks][0][id] = 21
why_choose_us[blocks][0][type] = intro
why_choose_us[blocks][0][html] = <p>Why businesses choose us...</p>
why_choose_us[blocks][0][sort_order] = 0
why_choose_us[blocks][1][id] = 22
why_choose_us[blocks][1][type] = feature
why_choose_us[blocks][1][title] = Networking Expansion
why_choose_us[blocks][1][description] = Short feature description
why_choose_us[blocks][1][sort_order] = 1
why_choose_us[blocks][1][icon] = <File>

industries[section_title] = Industries We Serve
industries[items][0][title] = Logistics
industries[items][0][sort_order] = 0
industries[items][0][image] = <File>

testimonials[section_title] = Our Testimonials
testimonials[items][0][rating] = 5
testimonials[items][0][quote] = Great partnership and delivery.
testimonials[items][0][author_name] = Dhiraj Poudel
testimonials[items][0][author_role] = CEO at BSNL
testimonials[items][0][sort_order] = 0

technologies[section_title] = Technologies We Use
technologies[items][0][name] = React
technologies[items][0][sort_order] = 0
technologies[items][0][icon] = <File>

seo[meta_title] = Home | WPD
seo[meta_description] = <p>Innovative IT solutions for modern businesses.</p>
seo[related_keyphrases][0] = it solutions
seo[related_keyphrases][1] = software development
```

##### Alternative: JSON payload + files

| Field | Value |
|-------|-------|
| `payload` | JSON string of entire Home page (non-file fields + existing image URLs) |
| `banner_background_image` | file |
| `services_icon_0` / `services_image_0` | files |
| `why_choose_us_image` | file |
| `why_choose_us_block_icon_1` | file |
| `industries_image_0` | file |
| `technologies_icon_0` | file |

Pick **one** strategy and stick to it. Nested FormData is closest to Laravel-style parsing.

---

### 6.3 Full JSON example payload (non-file / after upload URLs resolved)

Useful for documentation, tests, and if files are uploaded in a separate step.

```json
{
  "banner": {
    "background_image": "https://cdn.example.com/home/banner.jpg",
    "heading": "Empowering Your Business With Innovative IT Solutions",
    "subheading": "We specialize in delivering high-quality, scalable solutions.",
    "button_name": "Book A Call",
    "button_url": "https://example.com/contact"
  },
  "services": {
    "section_title": "Our Services",
    "items": [
      {
        "title": "QA & Testing",
        "description": "Short service description",
        "icon": "https://cdn.example.com/home/services/qa-icon.png",
        "image": "https://cdn.example.com/home/services/qa.jpg",
        "sort_order": 0
      },
      {
        "title": "Product Engineering",
        "description": "Build and scale products",
        "icon": "https://cdn.example.com/home/services/eng-icon.png",
        "image": "https://cdn.example.com/home/services/eng.jpg",
        "sort_order": 1
      }
    ]
  },
  "why_choose_us": {
    "section_title": "Why Choose Us",
    "image": "https://cdn.example.com/home/why.jpg",
    "button_name": "Learn More",
    "button_url": "https://example.com/about",
    "blocks": [
      {
        "type": "intro",
        "html": "<p>Trusted by teams worldwide.</p>",
        "sort_order": 0
      },
      {
        "type": "feature",
        "icon": "https://cdn.example.com/home/why/network.png",
        "title": "Networking Expansion",
        "description": "Grow your network with confidence.",
        "sort_order": 1
      }
    ]
  },
  "industries": {
    "section_title": "Industries We Serve",
    "items": [
      {
        "title": "Logistics",
        "image": "https://cdn.example.com/home/industries/logistics.jpg",
        "sort_order": 0
      }
    ]
  },
  "testimonials": {
    "section_title": "Our Testimonials",
    "items": [
      {
        "rating": 5,
        "quote": "Great partnership and delivery.",
        "author_name": "Dhiraj Poudel",
        "author_role": "CEO at BSNL",
        "sort_order": 0
      }
    ]
  },
  "technologies": {
    "section_title": "Technologies We Use",
    "items": [
      {
        "name": "React",
        "icon": "https://cdn.example.com/home/tech/react.svg",
        "sort_order": 0
      }
    ]
  },
  "seo": {
    "meta_title": "Home | WPD",
    "meta_description": "<p>Innovative IT solutions for modern businesses.</p>",
    "related_keyphrases": ["it solutions", "software development"]
  }
}
```

---

## 7. Sync rules on update (important)

When saving Home page, treat nested lists as the **source of truth**:

1. **Update** rows whose IDs exist in DB and appear in payload  
2. **Create** rows without valid backend IDs (frontend temp IDs like `service-…` must be ignored)  
3. **Delete** rows that exist in DB but are missing from payload  

Apply this to:

- `services.items`
- `why_choose_us.blocks`
- `industries.items`
- `testimonials.items`
- `technologies.items`
- `seo.related_keyphrases`

Persist `sort_order` from array order even if client omits explicit `sort_order`.

---

## 8. Validation recommendations

| Field | Rule |
|-------|------|
| `banner.heading` | Required, max 255 |
| `services.section_title` | Required, max 255 |
| `testimonials[].rating` | Integer 1–5 |
| `seo.meta_title` | Max 60 chars (soft/hard) |
| `seo.meta_description` | Optional; store HTML; optionally validate plain-text length ≤ 160 |
| Image mime | `image/png`, `image/jpeg`, `image/webp` (+ `image/svg+xml` for tech icons if allowed) |
| URLs | Optional URL format validation for `button_url` fields |
| Why Choose Us | Exactly one `intro` block; ≥ 1 `feature` block |

---

## 9. Public / website consumption (optional)

If the marketing site needs Home content:

```text
GET /api/pages/home
```

(or `/api/public/home`)

Return the same nested shape as admin GET, but without admin-only fields. Only return `status = published` if you support draft.

---

## 10. Endpoint checklist

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/pages/home` | Load Home CMS form |
| `POST` or `PUT` | `/admin/pages/home` | Save full Home CMS (multipart) |
| Optional `GET` | `/api/pages/home` | Public website read |

---

## 11. Acceptance checklist for backend

- [ ] Singleton Home page can be fetched and saved  
- [ ] Banner heading required validation works  
- [ ] Services / industries / testimonials / technologies support add / reorder / delete sync  
- [ ] Why Choose Us intro + features share one ordered `blocks` list  
- [ ] Intro HTML rich text persists correctly  
- [ ] All image uploads store and return absolute URLs  
- [ ] Existing image URLs are preserved when no new file is sent  
- [ ] SEO meta title / description / related keyphrases persist  
- [ ] Response envelope uses `{ success, message, data }`  
- [ ] Temp frontend IDs are never stored as primary keys  

---

## 12. Notes for frontend integration (after API is ready)

Current Home CMS Save is still local toast-only. Once this API exists, frontend will:

1. `GET /admin/pages/home` on mount → hydrate `formData` + `seoSettings`  
2. On **Save**, send multipart payload matching this spec  
3. On SEO dialog Save, keep values in page state and include them in the main Save request  

Share this file with backend as-is. Matching these field names and nested structures will make wiring the current Home CMS UI mostly mapping work (camelCase ↔ snake_case + FormData files).
