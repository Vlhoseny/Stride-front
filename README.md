<div align="center">

# ⚡ STRIDE

### Your Weekly Momentum

*A premium project management dashboard built with a **Silk & Glass** design language — translucent surfaces, soft gradients, micro-interactions, and an obsessive attention to detail.*

![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

</div>

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Daily Focused View** | A 7-day rolling task board with inline editing, priority badges, and drag-and-drop reordering via `@dnd-kit`. |
| **Chronos Timeline** | A visual project timeline with progress arcs, milestone markers, and animated SVG rings. |
| **Rollover Magic** | Uncompleted tasks automatically roll forward to the next day — no manual cleanup required. |
| **Cyber-Stealth Mode** | Press **Alt+S** to instantly blur all sensitive project names, task titles, and notes. Hover to peek. |
| **Focus Timer** | A draggable Pomodoro widget (25 min default) with a circular SVG progress ring that transitions from primary → amber → rose as time runs out. Browser notifications on completion. |
| **Global Command Palette** | Press **Ctrl+K** / **⌘K** to search across all projects & tasks, toggle theme, create projects, or navigate — all without touching the mouse. |
| **Role-Based Access** | Four-tier permission model (`owner` / `admin` / `editor` / `viewer`) enforced at the UI level with full RBAC ready for backend. |
| **Accent Color Theming** | Choose from 7 accent colours that ripple across the entire UI via CSS custom properties. |
| **Offline-First** | All data persists in `localStorage` with schema validation and seed-data fallback. Zero backend required to run. |
| **API-Ready Service Layer** | Every mutation routes through `ProjectService` → async Promises. Swap to a real REST API in under an hour. |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 with TypeScript (strict mode) |
| **Bundler** | Vite 5 + SWC |
| **Styling** | Tailwind CSS 3 · `tailwindcss-animate` · custom Silk & Glass design tokens |
| **Components** | shadcn/ui (Radix primitives) · Lucide icons |
| **Animation** | Framer Motion 12 (layout animations, springs, AnimatePresence) |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Command Palette** | `cmdk` |
| **Validation** | Zod 3 |
| **Routing** | React Router 6 (lazy-loaded routes) |
| **Toasts** | Sonner |
| **Testing** | Vitest + Testing Library + jsdom |
| **Linting** | ESLint 9 + `typescript-eslint` + React Hooks plugin |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or **bun** / **pnpm**)

### Install & Run

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd stride

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Other Scripts

| Command | Description |
|---|---|
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the workspace |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## 🏗 Architecture

```
src/
├── api/
│   ├── apiClient.ts          # Fetch wrapper with JWT interceptors
│   └── projectService.ts     # Async CRUD (localStorage-backed, API-ready)
├── components/
│   ├── ProjectDataContext.tsx # Central state — optimistic updates via service
│   ├── DailyFocusedView.tsx  # 7-day task board with DnD
│   ├── ChronosTimeline.tsx   # Visual project timeline
│   ├── CommandPalette.tsx    # Global ⌘K command palette
│   ├── StealthMode.tsx       # Cyber-Stealth blur context
│   ├── FocusTimer.tsx        # Pomodoro timer widget
│   ├── TaskDrawer.tsx        # Task detail side drawer
│   ├── AuthContext.tsx        # Auth state & guards
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   ├── use-mobile.tsx        # Responsive breakpoint hook
│   └── use-os.ts             # OS detection (Mac/Win/Linux)
├── lib/
│   ├── utils.ts              # cn() Tailwind merge helper
│   └── sanitize.ts           # XSS stripping + profanity filter
├── pages/
│   ├── Index.tsx              # Main dashboard (protected)
│   ├── Auth.tsx               # Login / Sign-up
│   └── NotFound.tsx           # 404
└── test/
    ├── setup.ts
    └── example.test.ts
```

### Data Flow

```
User Action
  → ProjectDataContext (optimistic state update)
    → ProjectService.* (async Promise)
      → localStorage (current) / REST API (future)
```

- **Optimistic Updates**: The UI updates instantly. The service call fires in parallel and errors are caught gracefully.
- **Offline-First**: On mount, state hydrates synchronously from `localStorage` with seed-data fallback. An async `fetchProjects()` call reconciles afterwards — ready for when it points at a real server.
- **Sanitisation**: All user-generated text passes through `sanitizeInput()` in the service layer before persistence — stripping HTML/XSS vectors and filtering profanity.

### Backend Swap (The 1-Hour Job)

1. Set `VITE_API_BASE_URL` in `.env`
2. Call `setAccessToken(jwt)` after login in `AuthContext`
3. In `src/api/projectService.ts`, uncomment each `// Future:` line and delete the `localStorage` body beneath it

See [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) for the full backend specification.

---

## 📄 License

This project is private and proprietary.

---

<div align="center">
  <sub>Built with precision. Shipped with pride.</sub>
</div>
