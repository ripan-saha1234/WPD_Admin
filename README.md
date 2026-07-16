# WPD Admin

React + Vite admin panel for WPD. This document explains the project structure, setup, how to extend it, and how the code connects.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Folder structure](#folder-structure)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Authentication](#authentication)
7. [Routing](#routing)
8. [Layout system](#layout-system)
9. [Sidebar](#sidebar)
10. [Adding a new page](#adding-a-new-page)
11. [Shared components](#shared-components)
12. [Scripts](#scripts)
13. [Architecture — how code connects](#architecture--how-code-connects)
14. [Design decisions](#design-decisions)
15. [Enabling the real API](#enabling-the-real-api)
16. [Common issues](#common-issues)

---

## Overview

**WPD Admin** is a single-page application (SPA) for internal administration. It provides:

- Login (static credentials until the backend API is ready)
- Authenticated shell: sidebar, header, breadcrumbs, header actions, toasts
- A starter dashboard page that demonstrates how pages plug into the layout

Business feature pages (companies, users, etc.) are added by you under `src/pages/`.

---

## Tech stack

| Tool | Purpose |
|------|---------|
| React 19 | UI |
| Vite 7 | Dev server, build, environment variables |
| React Router 7 | URLs and navigation |
| MUI (`@mui/material`) | Snackbar / Alert in layout |
| Plain CSS | Global, layout, and page styles |

There is **no backend in this repository**. API calls go to `VITE_API_BASE_URL` when enabled in `src/services/`.

---

## Folder structure

```
WPD_Admin/
├── public/                    # Static assets (served at /filename.svg)
├── index.html                 # HTML shell, favicon
├── .env                       # VITE_API_BASE_URL
├── package.json
├── vite.config.js
│
└── src/
    ├── main.jsx               # Entry: Router + Context + App
    ├── App.jsx                # Renders routes only
    ├── index.css              # Global styles, fonts
    │
    ├── routes/
    │   └── AppRoutes.jsx      # All URL → page mappings
    │
    ├── context/
    │   └── context.jsx        # User, auth guard, layout chrome, toast
    │
    ├── layouts/               # Application shell (not business pages)
    │   ├── AppLayout/
    │   │   ├── AppLayout.jsx
    │   │   ├── LayoutHeader.jsx
    │   │   ├── HeaderActions.jsx
    │   │   ├── LayoutToast.jsx
    │   │   ├── AppLayout.css
    │   │   └── hooks/useClickOutside.js
    │   │
    │   └── sidebar/
    │       ├── Sidebar.jsx
    │       ├── navConfig.js       # Menu items — edit here for new links
    │       ├── SidebarNavItem.jsx
    │       ├── SidebarLogout.jsx
    │       ├── Sidebar.css
    │       ├── index.js
    │       └── hooks/
    │           ├── useActiveNav.js
    │           └── useSidebarLogout.js
    │
    ├── pages/                 # Screen content (inside layout outlet)
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── LoginPage.css
    │   └── dashboard/
    │       ├── DashboardPage.jsx
    │       └── DashboardPage.css
    │
    ├── components/            # Reusable UI (tables, dialogs, inputs, …)
    ├── css/                   # Shared styles for common components
    │
    ├── services/              # API / auth (no UI)
    │   └── authService.js
    │
    └── utils/
        └── auth.js            # Token, user storage, static credentials
```

### Why folders are split this way

| Folder | Role |
|--------|------|
| `layouts/` | Sidebar + header wrap every logged-in page; only inner content changes. |
| `pages/` | Route-specific screens rendered in `<Outlet />`. |
| `routes/` | Single place to see and manage all URLs. |
| `services/` | HTTP and auth logic; keeps pages thin. |
| `utils/` | localStorage, token parsing — shared by context, login, logout. |
| `components/` | Shared widgets reused across pages. |
| `public/` | Files referenced as `/icon.svg` (not imported as modules). |

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173 (or next free port)
npm run build    # Output: dist/
npm run preview  # Preview production build
```

---

## Environment variables

Create or edit `.env` in the project root:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

Only variables prefixed with `VITE_` are exposed to the client. Used when API calls are enabled in `src/services/authService.js`.

---

## Authentication

### Current mode: static login

Until the backend is ready, credentials are defined in `src/utils/auth.js`:

| Field | Value |
|-------|--------|
| Email | `admin@wpd.com` |
| Password | `admin123` |

Login flow is implemented in `src/services/authService.js` (mock) and `src/pages/auth/LoginPage.jsx`.

### Session storage

| Key | Content |
|-----|---------|
| `WPD Admin token` | JWT or dev token (JSON-stringified in localStorage) |
| `WPD Admin user` | User object (JSON) |

Helpers live in `src/utils/auth.js`: `getAuthToken`, `getStoredUser`, `setAuthSession`, `clearAuthSession`, `mapUserFromApi`.

### Route protection

`src/context/context.jsx` runs on every route change:

- No token and path is not `/auth` → redirect to `/auth`
- Token exists and path is `/auth` → redirect to `/dashboard`

### Logout

Sidebar logout (`src/layouts/sidebar/hooks/useSidebarLogout.js`) clears session and navigates to `/auth`. API logout is commented until the backend is ready.

---

## Routing

Defined in `src/routes/AppRoutes.jsx`:

| URL | Layout | Page |
|-----|--------|------|
| `/auth` | None (full-screen) | `LoginPage` |
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | `AppLayout` | `DashboardPage` |

Authenticated routes are children of `<Route path="/" element={<AppLayout />}>`.

---

## Layout system

Logged-in pages do **not** render the sidebar or header themselves. `AppLayout` provides the shell; pages render inside `<Outlet />`.

### AppLayout pieces

| File | Responsibility |
|------|----------------|
| `AppLayout.jsx` | Composes sidebar, header, toast, and outlet |
| `LayoutHeader.jsx` | Breadcrumbs, page title, subtitle badge, user avatar |
| `HeaderActions.jsx` | Header buttons, search, dropdown, select, icon |
| `LayoutToast.jsx` | Top-right MUI snackbar |
| `hooks/useClickOutside.js` | Closes header dropdown on outside click |

### What pages control via `globalContext`

| Function / state | Purpose |
|------------------|---------|
| `setPageTitle` | Main heading in header |
| `setBreadcrums` | Breadcrumb trail |
| `setSubTitle` | Small colored badge next to title |
| `setButtonList` | Header action bar (see types below) |
| `showToast` / `hideToast` | Global notifications |
| `user` / `setUser` | Logged-in user (avatar, name) |

### `buttonList` item types

Used by `HeaderActions.jsx`:

| `type` | Purpose |
|--------|---------|
| `button` | `CommonButton` in header |
| `search` | Search input with icon |
| `dropdown` | Triple-dot menu |
| `select` | `<select>` in header |
| `icon` | Clickable icon |

**Important:** Clear `buttonList` in a `useEffect` cleanup when the page unmounts, so the next page does not inherit buttons.

Example: see `src/pages/dashboard/DashboardPage.jsx`.

---

## Sidebar

Location: `src/layouts/sidebar/`

| File | Role |
|------|------|
| `navConfig.js` | `SIDEBAR_NAV_ITEMS`, logo, logout config |
| `Sidebar.jsx` | Renders menu + logout |
| `SidebarNavItem.jsx` | Single nav button |
| `SidebarLogout.jsx` | Logout button |
| `hooks/useActiveNav.js` | Active item from current URL |
| `hooks/useSidebarLogout.js` | Clear session and go to `/auth` |

Add a menu item in `navConfig.js` and register the matching route in `AppRoutes.jsx`.

---

## Adding a new page

Example: **Users** at `/users`.

### 1. Create the page

```
src/pages/users/UsersPage.jsx
src/pages/users/UsersPage.css   (optional)
```

In `useEffect`:

```jsx
setPageTitle('Users');
setBreadcrums([{ title: 'Users', link: '/users' }]);
setButtonList([/* optional */]);

return () => {
  setButtonList([]);
};
```

### 2. Register the route

In `src/routes/AppRoutes.jsx`, inside the `AppLayout` route:

```jsx
<Route path="users" element={<UsersPage />} />
```

### 3. Add sidebar link

In `src/layouts/sidebar/navConfig.js`:

```js
{
  id: 'users',
  path: '/users',
  label: 'Users',
  icon: '/users-icon.svg',  // place file in public/
},
```

### 4. API (when ready)

Create `src/services/usersService.js` and call it from the page — not from layout files.

---

## Shared components

Under `src/components/` (from the previous admin codebase):

- `common-table`, `common-dialog`, `common-input`, `common-button`, `common-loader`, etc.
- Styles often in `src/css/common-*.css`

Use these inside **pages** for lists, forms, and dialogs.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |

---

## Architecture — how code connects

### Bootstrap chain

```
index.html
  → main.jsx
      → BrowserRouter
          → GlobalContextProvider (context.jsx)
              → App.jsx
                  → AppRoutes.jsx
                      → /auth     → LoginPage
                      → / + child → AppLayout → Outlet → Page
```

**Why this order**

1. `BrowserRouter` must wrap anything using routes or navigation hooks.
2. `GlobalContextProvider` supplies auth guard and layout state app-wide.
3. `App.jsx` only mounts routes.
4. `AppRoutes.jsx` is the single routing table.

### Auth flow

```
LoginPage
  → authService.loginAdmin()
  → setAuthSession(token, user)   [localStorage via utils/auth.js]
  → setUser() in globalContext
  → navigate('/dashboard')

On every pathname change (context.jsx)
  → getAuthToken()
  → redirect to /auth or /dashboard if needed

Logout (sidebar)
  → clearAuthSession()
  → navigate('/auth')
```

**Why `authService` and `utils/auth.js` are separate**

| Module | Responsibility |
|--------|----------------|
| `authService.js` | How login/logout work (HTTP or static mock) |
| `auth.js` | Where data is stored and how it is read/parsed |

Switching from static login to API only requires changes in `authService.js` (and logout hook), not in every page.

### Layout composition

```
AppLayout
├── LayoutToast        ← reads toast from globalContext
├── Sidebar            ← navConfig + navigation hooks
├── LayoutHeader       ← breadcrumbs, title, user
│   └── HeaderActions  ← buttonList from globalContext
└── Outlet             ← active page (DashboardPage, etc.)
```

Pages update `globalContext` in `useEffect`; header and actions re-render automatically. Context avoids passing props through many layers.

### Sidebar connection

```
navConfig.js → Sidebar → SidebarNavItem → navigate(path)
              → useActiveNav (highlights from URL)
              → SidebarLogout → useSidebarLogout → clearAuthSession
```

### Page ↔ layout contract

When a page mounts, it sets title, breadcrumbs, and optional header buttons. When it unmounts, it should clear `buttonList` so the next page does not show stale actions.

### File connection reference

| From | Uses | Purpose |
|------|------|---------|
| `main.jsx` | `App`, `GlobalContextProvider`, `BrowserRouter` | Bootstrap |
| `App.jsx` | `AppRoutes` | Route tree |
| `AppRoutes.jsx` | `AppLayout`, pages | URL mapping |
| `AppLayout.jsx` | `Sidebar`, `LayoutHeader`, `Outlet` | Shell |
| `LayoutHeader.jsx` | `Breadcrums`, `HeaderActions`, context | Top bar |
| `LoginPage.jsx` | `authService`, `auth` utils, context | Login |
| `Sidebar` | `navConfig`, hooks | Navigation |
| `context.jsx` | `auth` utils | Guard + shared state |
| Pages | `globalContext`, `components/*` | Screen content |

---

## Design decisions

| Decision | Reason |
|----------|--------|
| Layouts under `src/layouts/` | Layout is shell, not a business page. |
| Sidebar beside `AppLayout` | Both are part of the authenticated chrome. |
| Routes in `AppRoutes.jsx` | Easier to scale with many routes. |
| Static auth in `authService` | Same response shape as future API; minimal UI changes later. |
| Token in `localStorage` | Simple SPA session across refresh. |
| Auth guard in context | Protects all routes under `/` without per-route wrappers yet. |
| Icons in `public/` | Simple paths in config and JSX (`/logo.svg`). |
| Large `common-*` components kept | Reuse existing UI kit; refactor per feature when needed. |

### Route + sidebar config

For each new screen, update **both**:

1. `src/routes/AppRoutes.jsx`
2. `src/layouts/sidebar/navConfig.js`

Keep paths in sync (e.g. `/users` in both).

---

## Enabling the real API

1. Set `VITE_API_BASE_URL` in `.env`.
2. Uncomment `fetch` blocks in `src/services/authService.js` (`loginAdmin`, `logoutAdmin`).
3. Uncomment API logout in `src/layouts/sidebar/hooks/useSidebarLogout.js`.
4. Remove or disable static credentials in `authService.js` when no longer needed.
5. Keep `LoginPage` using `loginAdmin` + `setAuthSession` if the API returns `{ success, data: { token, user } }`.

---

## Common issues

| Problem | Likely cause |
|---------|----------------|
| 404 on icons | SVG missing in `public/` |
| Header buttons on wrong page | Missing `setButtonList([])` cleanup on unmount |
| Sidebar link does nothing | Route missing in `AppRoutes.jsx` or path mismatch with `navConfig` |
| Stuck on login | Wrong credentials or cleared localStorage |
| Login works but blank dashboard | Check browser console for JS errors |

---

## License

Private project — WPD Admin.
#   W P D _ A d m i n  
 