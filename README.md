<div align="center">

# ⚡ STRIDE

**High-Performance Glassmorphic Project Management**

*Enterprise-grade. Security-hardened. Focus-driven.*

<br />

![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

![Security](https://img.shields.io/badge/Security-Hardened-22c55e?style=flat-square)
![CSP](https://img.shields.io/badge/CSP-Strict-22c55e?style=flat-square)
![Zod](https://img.shields.io/badge/Zod-Strict_Mode-3068b7?style=flat-square)
![Audit](https://img.shields.io/badge/npm_audit-Clean-22c55e?style=flat-square)
![License](https://img.shields.io/badge/License-Proprietary-ef4444?style=flat-square)

</div>

---

## 🧭 The Philosophy

Most project management tools optimise for **breadth** — hundreds of views, infinite customisation, sprawling menus.

STRIDE optimises for **focus**.

Built around the *Daily Focused View* — a single, curated 7-day rolling board — STRIDE removes the noise and surfaces only what matters: **what you need to do today, and this week.** Every feature, from the triple-mode Focus Timer to the Chronos Timeline, exists to protect your flow state. The Silk & Glass design language — translucent surfaces, soft gradients, fluid micro-interactions — keeps the interface beautiful without being distracting.

The result is a tool you *want* to open, not one you *have* to.

---

## 🏆 Core Features — The Heroes

### 🕰️ Chronos Timeline

A **visual horizontal timeline** that renders each project as an animated SVG arc. Progress rings, milestone markers, and estimated-day calculations give you an intuitive sense of trajectory without spreadsheets or Gantt charts.

- Animated SVG progress arcs with real-time completion data
- Milestone markers and estimated completion dates
- Responsive horizontal scroll with smooth Framer Motion transitions

### ⏱️ Advanced Focus Timer

A **triple-mode productivity engine** — not just a Pomodoro clock. Choose the method that matches your task:

| Mode | Work | Short Break | Long Break |
|---|:---:|:---:|:---:|
| 🍅 **Pomodoro** | 25 min | 5 min | 15 min |
| 📊 **52/17 Rule** | 52 min | 17 min | 17 min |
| 🌊 **90-Min Flow** | 90 min | 20 min | 20 min |

- Draggable floating widget with circular SVG progress ring
- Colour transition (primary → amber → rose) as time expires
- Browser notification on completion — never miss the bell
- Persistent across page navigation via `FocusTimerContext`

### 🤝 Collaboration Engine

Enterprise-ready team features with **defence-in-depth access control**:

- **RBAC** — Three-tier permission model: `owner` → `admin` → `editor`
- **Invite System** — Email-based invites with pending/accepted/declined lifecycle
- **Real-Time Notifications** — Toast-based notification system for project events
- **Enterprise Audit Logs** — Immutable, timestamped activity trail per project (who did what, and when), visible to `admin`+ roles
- **Project Modes** — Solo and Team with a combined cap of 4 projects and max 5 members per project

### ✨ And Everything Else

| Feature | Description |
|---|---|
| 📋 **Daily Focused View** | 7-day rolling task board with inline editing, priority badges, sub-tasks, and drag-and-drop via `@dnd-kit` |
| 🔄 **Rollover Magic** | Uncompleted tasks auto-roll to the next day — zero manual cleanup |
| 🕵️ **Stealth Mode** | Press `Alt+S` to instantly blur all sensitive content. Hover to peek. |
| ⌨️ **Command Palette** | `Ctrl+K` / `⌘K` for instant search, navigation, theme toggle, and project creation |
| 🎨 **Accent Theming** | 7 accent colours ripple across the entire UI via CSS custom properties |
| 💾 **Offline-First** | Full `localStorage` persistence with seed-data fallback — zero backend required |
| 🔌 **API-Ready** | Swap to a real REST API in under an hour — every service has `// Future:` hooks |

---

## 💪 Tech Stack — The Muscle

### Frontend

| Layer | Technology |
|---|---|
| **Framework** | React 18 · TypeScript (strict mode) |
| **Bundler** | Vite 5 + SWC |
| **Styling** | Tailwind CSS 3 · `tailwindcss-animate` · Custom Silk & Glass design tokens |
| **Components** | shadcn/ui (Radix primitives) · Lucide icons |
| **Animation** | Framer Motion 12 — layout transitions, springs, `AnimatePresence` |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Command Palette** | `cmdk` |
| **Routing** | React Router 6 (lazy-loaded routes) |
| **Toasts** | Sonner |

### Logic & Quality

| Concern | Technology |
|---|---|
| **Validation** | Zod 3 with `.strict()` on all schemas — rejects unknown keys at runtime |
| **Sanitisation** | Custom `sanitizeInput()` — HTML stripping, XSS vector removal, profanity filter |
| **Testing** | Vitest + Testing Library + jsdom |
| **Linting** | ESLint 9 + `typescript-eslint` + React Hooks plugin |
| **Architecture** | Clean Architecture — API-ready service layer with optimistic updates |

---

## 🛡️ Security Fortress

STRIDE ships with **production-grade security hardening** out of the box. These are not aspirational — they are implemented and active.

| Measure | Implementation | Status |
|---|---|:---:|
| **Strict CSP** | `script-src 'self'` — blocks `unsafe-eval` and `unsafe-inline` | ✅ Active |
| **Anti-XSS** | `sanitizeInput()` strips HTML tags, `<script>`, `on*=` handlers, `javascript:` URIs | ✅ Active |
| **Zod `.strict()`** | All validation schemas reject undocumented/injected fields | ✅ Active |
| **Prototype Pollution Defense** | Allowlisted field sets on all object mutation paths | ✅ Active |
| **CSRF Protection** | `X-CSRF-Token` header on every state-changing request | ✅ Active |
| **Anti-Clickjacking** | CSP `frame-ancestors 'none'` + `X-Frame-Options: DENY` + frame-buster script | ✅ Active |
| **Console Anti-Hijacking** | Facebook-style Self-XSS warning + `console.*` neutered in production | ✅ Active |
| **Source Map Stripping** | `build.sourcemap: false` · `esbuild.drop: ["console", "debugger"]` in production | ✅ Active |
| **HTTPS Enforcement** | Runtime check — API client throws if base URL is not `https://` in production | ✅ Active |
| **MIME Protection** | `X-Content-Type-Options: nosniff` meta tag + request header | ✅ Active |
| **Supply Chain Audit** | `npm audit` clean — all high-severity vulnerabilities patched | ✅ Clean |
| **`dangerouslySetInnerHTML`** | Single instance — audited and sanitised with `SAFE_CSS_VALUE` regex | ✅ Audited |

---

## 🏗️ Architecture

STRIDE follows a **clean, layered architecture** designed for seamless backend integration:

```
📂 src/
├── 📂 pages/              ← Route-level entry points (Landing, UserHome, Auth, Dashboard, …)
├── 📂 components/          ← Feature components + React Context providers
│   ├── ProjectDataContext  ← Central state with optimistic updates via service layer
│   ├── AuthContext         ← Authentication state & route guards
│   ├── FocusTimerContext   ← Timer state persisted across navigation
│   ├── SettingsContext     ← User preferences (theme, accent, layout)
│   ├── Footer              ← Global footer (Landing page)
│   └── 📂 ui/             ← shadcn/ui Radix primitives
├── 📂 hooks/               ← Reusable hooks (useTasks, useProjects, use-mobile, …)
├── 📂 api/                 ← Service + transport layer
│   ├── apiClient.ts        ← Fetch wrapper (JWT, CSRF, HTTPS, credentials)
│   ├── projectService.ts   ← Async CRUD — localStorage now, REST API later
│   └── NotificationService ← Event-driven notification queue
├── 📂 lib/                 ← Utilities (cn(), sanitizeInput(), …)
├── 📂 types/               ← Shared TypeScript interfaces & type definitions
└── 📂 test/                ← Vitest test suite
```

### Routing Architecture

```
/              →  Public Landing Page (accessible to everyone, no forced redirects)
/auth          →  Login / Register (redirects to /home if already authenticated)
/home          →  User Home — Command Center (protected; greeting, quick actions, overview)
/dashboard     →  Project Dashboard — workspace with task boards (protected)
/profile       →  User profile page (protected)
/analytics     →  Analytics dashboard (protected)
/team          →  Team overview page (protected)
```

**Smart Navigation:**
- The STRIDE logo is a `<Link>` — routes to `/home` when authenticated, `/` when not.
- Landing page CTA buttons adapt: authenticated users see "Go to Home"; guests see "Get started" / "Sign in".
- Successful login/register redirects to `/home` (not `/dashboard`).
- Authenticated users are **not** forced away from the Landing page.

### Data Flow

```
User Action
  → Component (UI event)
    → Context Provider (optimistic state update)
      → Service Layer (async Promise)
        → localStorage (current) / REST API (future)
```

**Key properties**:

- **Optimistic Updates** — The UI updates instantly; the service call fires in parallel. Errors surface as toasts.
- **Offline-First** — State hydrates synchronously from `localStorage` with seed-data fallback. An async `fetchProjects()` reconciles once a backend is connected.
- **Sanitisation-at-the-Gate** — All user text passes through `sanitizeInput()` *before* reaching the service layer.
- **Backend Swap** — Set one env var, store the JWT, uncomment `// Future:` lines in the service. Done.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm**

### Install & Run

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd stride

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app launches at **http://localhost:5173** — no backend required.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` (source maps stripped, console dropped) |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint across the workspace |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## 📖 Documentation

| Document | Description |
|---|---|
| [**PRD.md**](PRD.md) | Product Requirements Document — features, personas, RBAC matrix, design language, roadmap |
| [**BACKEND_REQUIREMENTS.md**](BACKEND_REQUIREMENTS.md) | Backend Technical Blueprint — Mermaid ERD, REST API spec, JWT strategy, Zod schemas, WebSocket events, deployment checklist |

---

## 📄 License

This project is **private and proprietary**.

---

<div align="center">

  ⚡ **STRIDE** — Built with precision. Hardened with intent. Shipped with pride.

  <sub>React 18 · TypeScript Strict · Vite 5 · Tailwind CSS · Framer Motion · Zod Strict · CSP Hardened</sub>

</div>
