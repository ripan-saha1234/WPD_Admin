# Home Page — New Fields (Backend Spec)

Use this document to add the **new / updated fields** required by the Home Page CMS.

**Base URL:** `https://wpd-api.webprismdynamics.com/api/admin`  
**Endpoints:**
- `GET  /pages/home` — load home page
- `POST /pages/home` — save home page

**Auth:** Bearer token required  
**Content-Type (POST):** `multipart/form-data`  
(Files as binary parts; non-file data also sent as nested FormData keys + a `payload` JSON string)

---

## What changed (summary)

| Section | Field | Action | Type | Notes |
|---------|-------|--------|------|-------|
| `banner` | `background_type` | **NEW** | `"image"` \| `"video"` | Which background media is active |
| `banner` | `background_video` | **NEW** | file / URL string | Used when `background_type` is `"video"` |
| `banner` | `background_image` | existing | file / URL string | Used when `background_type` is `"image"` |
| `services.items[]` | `url` | **NEW** | string | Hyperlink for each service card |
| `industries.items[]` | `description` | **NEW** | string | Description for each industry item |

Everything else stays the same as the existing home page structure.

---

## Full JSON shape (after changes)

This is the expected structure for **GET response** (`data`) and for the **`payload` JSON** sent on POST.

```json
{
  "status": "draft",
  "banner": {
    "heading": "string",
    "subheading": "string",
    "button_name": "string",
    "button_url": "string",
    "background_type": "image",
    "background_image": "string (URL) or File",
    "background_video": "string (URL) or File"
  },
  "services": {
    "section_title": "string",
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "url": "string",
        "sort_order": 0,
        "icon": "string (URL) or File",
        "image": "string (URL) or File"
      }
    ]
  },
  "why_choose_us": {
    "section_title": "string",
    "image": "string (URL) or File",
    "button_name": "string",
    "button_url": "string",
    "blocks": [
      {
        "id": "string",
        "type": "intro",
        "html": "string",
        "sort_order": 0
      },
      {
        "id": "string",
        "type": "feature",
        "title": "string",
        "description": "string",
        "icon": "string (URL) or File",
        "sort_order": 1
      }
    ]
  },
  "industries": {
    "section_title": "string",
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "sort_order": 0,
        "image": "string (URL) or File"
      }
    ]
  },
  "testimonials": {
    "section_title": "string",
    "items": [
      {
        "id": "string",
        "rating": 5,
        "quote": "string",
        "author_name": "string",
        "author_role": "string",
        "sort_order": 0
      }
    ]
  },
  "technologies": {
    "section_title": "string",
    "items": [
      {
        "id": "string",
        "name": "string",
        "sort_order": 0,
        "icon": "string (URL) or File"
      }
    ]
  },
  "seo": {
    "meta_title": "string",
    "meta_description": "string",
    "related_keyphrases": [
      {
        "id": "string",
        "text": "string",
        "keyphrase": "string"
      }
    ]
  }
}
```

---

## New fields — details

### 1. Banner — `background_type` + `background_video`

| Field | Required | Type | Allowed values / notes |
|-------|----------|------|------------------------|
| `banner.background_type` | yes | string | `"image"` or `"video"` |
| `banner.background_image` | when type is image | file or URL | png / jpg / jpeg / webp |
| `banner.background_video` | when type is video | file or URL | mp4 / mov / webm |

**Rules:**
- If `background_type` = `"image"` → use `background_image`
- If `background_type` = `"video"` → use `background_video`
- Frontend sends only the active media field on save
- On GET, return both if stored, plus `background_type` so CMS can open the correct upload box

**FormData keys (example):**
```text
banner[background_type] = image
banner[background_image] = <File or existing URL>

# OR

banner[background_type] = video
banner[background_video] = <File or existing URL>
```

---

### 2. Services — `url` (hyperlink)

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `services.items[].url` | no | string | Absolute or relative URL for the service card link |

**FormData key (example):**
```text
services[items][0][url] = https://example.com/services/qa
```

---

### 3. Industries — `description`

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `industries.items[].description` | no | string / text | Short description under industry title |

**FormData key (example):**
```text
industries[items][0][description] = Solutions for logistics and supply chain.
```

---

## Example payload (sample values)

```json
{
  "status": "published",
  "banner": {
    "heading": "Empowering Your Business With Innovative IT Solutions",
    "subheading": "We specialize in delivering high-quality, scalable solutions.",
    "button_name": "Book A Call",
    "button_url": "https://example.com/contact",
    "background_type": "video",
    "background_video": "https://cdn.example.com/home/banner.mp4"
  },
  "services": {
    "section_title": "Our Services",
    "items": [
      {
        "id": "11",
        "title": "QA & Testing",
        "description": "Short service description",
        "url": "https://example.com/services/qa",
        "sort_order": 0,
        "icon": "https://cdn.example.com/home/services/qa-icon.png",
        "image": "https://cdn.example.com/home/services/qa.jpg"
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
        "id": "21",
        "type": "intro",
        "html": "<p>Why businesses choose us...</p>",
        "sort_order": 0
      },
      {
        "id": "22",
        "type": "feature",
        "title": "Networking Expansion",
        "description": "Short feature description",
        "icon": "https://cdn.example.com/home/why/network.png",
        "sort_order": 1
      }
    ]
  },
  "industries": {
    "section_title": "Industries We Serve",
    "items": [
      {
        "id": "31",
        "title": "Logistics",
        "description": "Solutions for logistics and supply chain.",
        "sort_order": 0,
        "image": "https://cdn.example.com/home/industries/logistics.jpg"
      }
    ]
  },
  "testimonials": {
    "section_title": "Our Testimonials",
    "items": [
      {
        "id": "41",
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
        "id": "51",
        "name": "React",
        "sort_order": 0,
        "icon": "https://cdn.example.com/home/tech/react.png"
      }
    ]
  },
  "seo": {
    "meta_title": "Home | WPD",
    "meta_description": "<p>Innovative IT solutions for modern businesses.</p>",
    "related_keyphrases": [
      {
        "id": "61",
        "text": "it solutions",
        "keyphrase": "it solutions"
      }
    ]
  }
}
```

---

## Banner example — image type

```json
{
  "banner": {
    "heading": "Empowering Your Business With Innovative IT Solutions",
    "subheading": "We specialize in delivering high-quality, scalable solutions.",
    "button_name": "Book A Call",
    "button_url": "https://example.com/contact",
    "background_type": "image",
    "background_image": "https://cdn.example.com/home/banner.jpg"
  }
}
```

---

## Nested FormData field map (new fields only)

```text
banner[background_type]                 = image | video
banner[background_image]                = <File> or URL   # when type = image
banner[background_video]                = <File> or URL   # when type = video

services[items][0][url]                 = https://...

industries[items][0][description]       = Short industry description
```

Also accept a top-level JSON string:
```text
payload = { ...full home page JSON above... }
```

---

## Backend checklist

- [ ] Add `background_type` to banner (`image` | `video`)
- [ ] Add `background_video` storage + upload handling
- [ ] Keep `background_image` working as before
- [ ] Add `url` on each service item
- [ ] Add `description` on each industry item
- [ ] Return all new fields on `GET /pages/home`
- [ ] Accept new fields on `POST /pages/home` (multipart + `payload` JSON)
- [ ] Empty / unfilled list items may be omitted by frontend — treat missing `items` arrays as `[]`

---

## Notes for backend

1. **Files:** new uploads arrive as binary multipart files; existing media is sent as URL strings.
2. **IDs:** frontend only sends real DB ids for existing rows; new items may omit `id`.
3. **Empty items:** frontend filters out blank placeholder rows before save (e.g. empty testimonials are not sent).
4. **GET response:** return the same snake_case JSON shape so the admin CMS can hydrate without extra mapping beyond what it already does.
