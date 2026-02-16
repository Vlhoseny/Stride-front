# STRIDE — Product Requirements Document (PRD)

> **Document Version**: 1.0.0  
> **Status**: Approved for Backend Development  
> **Last Updated**: February 2026  
> **Author**: Product & Engineering  
> **Audience**: Engineering, Design, QA, Stakeholders

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Features](#3-core-features)
   - 3.1 [Daily Focused View](#31-daily-focused-view)
   - 3.2 [Chronos Timeline](#32-chronos-timeline)
   - 3.3 [Advanced Focus Timer](#33-advanced-focus-timer)
   - 3.4 [Task Management](#34-task-management)
   - 3.5 [Collaboration & Notifications](#35-collaboration--notifications)
   - 3.6 [Enterprise Audit Log (Activity Trail)](#36-enterprise-audit-log-activity-trail)
   - 3.7 [Command Palette](#37-command-palette)
   - 3.8 [Stealth Mode](#38-stealth-mode)
4. [Role-Based Access Control (RBAC)](#4-role-based-access-control-rbac)
5. [Business Logic & Constraints](#5-business-logic--constraints)
6. [Design Language](#6-design-language)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics](#8-success-metrics)
9. [Roadmap & Milestones](#9-roadmap--milestones)

---

## 1. Product Vision

**STRIDE** is a high-performance, glassmorphic project management tool built for individuals and small teams who demand focus, clarity, and visual elegance. It combines deep-work principles with intuitive visual timelines to help users plan smarter and move faster.

### Problem Statement

Existing project management tools are either bloated with enterprise features that overwhelm solo developers, or too simplistic to handle real-world collaboration. There is no tool that balances **deep-work focus**, **visual task timelines**, and **team collaboration** in a premium, distraction-free interface.

### Solution

STRIDE provides:

- A **7-day rolling task board** that keeps users focused on the current week — not overwhelmed by backlogs
- A **horizontal Chronos Timeline** for visual project tracking with progress arcs and milestone markers
- An **Advanced Focus Timer** supporting scientifically-backed productivity methods (Pomodoro, 52/17 Rule, 90-Minute Flow)
- **Enterprise-grade audit logging** and **role-based access control** for teams
- A **Silk & Glass design language** — translucent surfaces, smooth animations, and obsessive attention to micro-interactions

### Core Differentiators

| Differentiator | Description |
|---|---|
| **Deep Work First** | Timer integration + distraction-free UI designed around focus sessions |
| **Visual Timeline** | Chronos provides at-a-glance project health via animated progress rings |
| **Premium Aesthetics** | Silk & Glass design language — no flat, generic dashboards |
| **Offline-First** | Full functionality without internet; seamless backend sync when connected |
| **API-Ready Architecture** | Frontend already built with async service layer — backend connects in hours, not weeks |

---

## 2. Target Users & Personas

### Persona 1: Solo Developer / Designer ("Alex")

- **Role**: Freelance full-stack developer
- **Pain Point**: Tracks tasks across too many tools (Notion, Todoist, physical notes)
- **STRIDE Value**: Single workspace with timeline, focus timer, and weekly task board
- **Plan**: Solo (up to 3 projects)

### Persona 2: Startup Team Lead ("Jordan")

- **Role**: Engineering lead at a 5-person startup
- **Pain Point**: Needs lightweight PM tool without Jira's complexity
- **STRIDE Value**: Team mode with RBAC, member management, invite system, and audit trail
- **Plan**: Team (up to 6 projects)

### Persona 3: Agency Project Manager ("Sam")

- **Role**: Manages 3-4 client projects simultaneously
- **Pain Point**: Needs quick project switching, visual progress tracking, and client-facing views
- **STRIDE Value**: Dashboard with filter toggle (All/Solo/Team), progress rings, and stealth mode for presentations
- **Plan**: Team

---

## 3. Core Features

### 3.1 Daily Focused View

The primary workspace — a **7-day rolling task board** displaying the current week (Mon–Sun) as vertical columns.

| Capability | Description |
|---|---|
| **Inline Task Creation** | "Quick Add" input with glassmorphic card design, Enter to save, Esc to cancel |
| **Drag & Drop** | Tasks can be reordered within a day or dragged across days via `@dnd-kit` |
| **Rollover** | Uncompleted tasks from past days can be manually rolled forward to today with one click |
| **Priority Badges** | Visual indicators for `low`, `medium`, `high`, `critical` priorities |
| **Completion Toggle** | Click to mark done; completed tasks show strikethrough styling |
| **Task Drawer** | Click a task to open a full detail drawer with sub-tasks, activity, and focus timer integration |

### 3.2 Chronos Timeline

A **horizontal scrollable timeline** rendered above the task board, providing a bird's-eye view of the project lifecycle.

| Capability | Description |
|---|---|
| **Progress Arcs** | Animated SVG rings showing per-project completion percentage |
| **Day Markers** | Highlighted current day with soft glow animation |
| **Estimated Duration** | Visual representation of project's estimated timeline (configurable, 1–365 days) |
| **Scroll Navigation** | Horizontal scroll with momentum, snapping to day boundaries |

### 3.3 Advanced Focus Timer

A **draggable floating widget** that supports three scientifically-backed productivity methods:

| Method | Focus Duration | Break Duration | Long Break |
|---|---|---|---|
| **Pomodoro** | 25 minutes | 5 minutes | 15 minutes |
| **52/17 Rule** | 52 minutes | 17 minutes | 17 minutes |
| **90-Minute Flow** | 90 minutes | 20 minutes | 20 minutes |

| Capability | Description |
|---|---|
| **Circular Progress Ring** | SVG ring that transitions colour from primary → amber → rose as time runs out |
| **Browser Notifications** | Native `Notification API` alerts when a session ends |
| **Web Audio Alerts** | `AudioContext` generates a gentle chime tone — no audio files needed |
| **Session Tracking** | Counts completed focus sessions (persisted across page reloads) |
| **Task Binding** | Timer can be launched from a specific task via the Task Drawer |
| **State Persistence** | Timer state (remaining time, status, method) survives page refresh via `localStorage` |
| **Method Switching** | Users can switch between Pomodoro, 52/17, and 90-Min Flow at any time |

### 3.4 Task Management

| Capability | Description |
|---|---|
| **Nested Sub-Tasks** | Each task supports unlimited sub-tasks with individual completion toggles and optional assignees |
| **Multi-Member Assignment** | Tasks can be assigned to multiple team members (displayed as stacked avatar chips) |
| **Custom Tags** | Colour-coded tags (`label` + `color`) for categorization; project-level tag management in Settings |
| **Priority Levels** | 4-tier system: `low`, `medium`, `high`, `critical` — each with distinct visual styling |
| **Due Dates** | Optional due date with calendar picker |
| **Bulk Operations** | Full-column task state is saved as a single `PUT` payload (optimistic updates) |
| **Context Menu** | Right-click any task for quick actions: assign, change priority, move to day, delete |

### 3.5 Collaboration & Notifications

| Capability | Description |
|---|---|
| **Team Mode** | Projects can be created as `solo` (single owner) or `team` (multi-member) |
| **Member Management** | Add/remove members with role assignment (see RBAC section below) |
| **Invite System** | Email-based invitations with `pending` / `accepted` / `declined` states |
| **Project Notes** | Shared note feed per project — author attribution with initials and timestamps |
| **Real-Time Notifications** | Toast notifications via Sonner for system events (future: WebSocket push) |
| **Notification Centre** | Bell icon in header with unread count badge and categorized notification list |

### 3.6 Enterprise Audit Log (Activity Trail)

A comprehensive, chronological record of all significant actions within a project. Accessible from **Project Settings → Activity Log** tab.

| Capability | Description |
|---|---|
| **Tracked Events** | Project creation, settings updates, member additions/removals, invites sent, notes added, project deletion |
| **Log Entry Fields** | `action` (human-readable string), `userEmail` (who performed it), `timestamp` (ISO 8601) |
| **Strict RBAC** | Only `owner` and `admin` roles can view the Activity Log; other roles see a "Restricted Access" lock screen |
| **Timeline UI** | Vertical timeline with relative timestamps ("Just now", "5m ago", "2d ago"), hover effects, and a scrollable container (max 420px) |
| **Auto-Logging** | Mutations in the data layer automatically create log entries — no manual instrumentation needed |
| **Persistence** | Audit logs are stored as part of the project entity and cascade-delete with the project |

### 3.7 Command Palette

Global keyboard-driven command interface triggered by **Ctrl+K** / **⌘K**.

| Capability | Description |
|---|---|
| **Universal Search** | Search across all projects and tasks simultaneously |
| **Quick Actions** | Create project, toggle theme (light/dark), navigate to pages |
| **Keyboard Navigation** | Full arrow-key navigation with Enter to select |
| **Fuzzy Matching** | Powered by `cmdk` with substring matching |

### 3.8 Stealth Mode

Privacy feature for public environments — triggered by **Alt+S** keyboard shortcut.

| Capability | Description |
|---|---|
| **Data Blurring** | All project names, task titles, descriptions, and notes are blurred via CSS `filter: blur()` |
| **Hover-to-Peek** | Hovering over blurred content temporarily reveals it |
| **Toggle Persistence** | Stealth mode state is session-scoped (resets on page reload) |
| **Global Scope** | Applies across all views simultaneously |

---

## 4. Role-Based Access Control (RBAC)

STRIDE implements a four-tier permission model. Roles are assigned per-project via the `ProjectMembers` relationship.

### Role Hierarchy

```
owner > admin > editor > viewer
```

### Permission Matrix

| Action | Owner | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|:---:|
| View project dashboard & tasks | ✅ | ✅ | ✅ | ✅ |
| View Chronos Timeline | ✅ | ✅ | ✅ | ✅ |
| Use Focus Timer | ✅ | ✅ | ✅ | ✅ |
| Create / edit / complete own tasks | ✅ | ✅ | ✅ | ❌ |
| Create / edit / delete any task | ✅ | ✅ | ❌ | ❌ |
| Add / edit / delete notes | ✅ | ✅ | ✅ | ❌ |
| Add / remove project members | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ❌ | ❌ |
| Send / manage invites | ✅ | ✅ | ❌ | ❌ |
| Edit project settings (name, icon, accent colour) | ✅ | ✅ | ❌ | ❌ |
| View Activity Log (Audit Trail) | ✅ | ✅ | ❌ | ❌ |
| Delete project (with confirmation) | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

### Business Rules

- Every project **must** have at least one `owner`.
- The last `owner` of a project **cannot** be removed or downgraded.
- Solo-mode projects have a single `owner` member — RBAC still applies for API consistency.
- Role checks are enforced **on both frontend (UI-level)** and **backend (API-level)**.

---

## 5. Business Logic & Constraints

### Project Limits

| Mode | Maximum Projects per User | Rationale |
|---|---|---|
| **Solo** | 3 | Encourages focus; prevents sprawl for individual users |
| **Team** | 6 | Supports multi-project collaboration without overwhelming teams |

- Limits are enforced at project creation time.
- When the limit is reached, the "Create Project" form disables the mode toggle and displays: *"You have reached the maximum of {N} {mode} projects for this plan. Delete an existing project or upgrade to continue."*
- The backend **must** enforce these limits independently — never trust the client.

### Project Creation Defaults

| Field | Default Value |
|---|---|
| `progress` | `0` |
| `status` | `on-track` |
| `color` | `indigo` |
| `iconName` | `Layers` |
| `estimatedDays` | `30` |

### Project Deletion

- Requires `owner` role.
- Requires typing the exact project name to confirm (case-insensitive match).
- Triggers cascade deletion of: all tasks, sub-tasks, notes, members, invites, tags, audit logs, and associated `localStorage` task data.
- Backend must implement `ON DELETE CASCADE` on all foreign keys.

### Task Rollover

- Tasks from **past days** that are not marked `done` can be rolled forward to today.
- Rolled tasks receive `rolledOver: true` flag for visual differentiation.
- Rollover is a manual action (not automatic) to preserve user intent.

### Data Validation

| Field | Constraint |
|---|---|
| `project.name` | 1–255 characters, HTML-stripped, profanity-filtered |
| `project.description` | 0–5,000 characters |
| `task.title` | 1–500 characters |
| `note.content` | 1–10,000 characters |
| `member.initials` | 1–4 characters |
| `tag.label` | 1–50 characters |
| `estimatedDays` | 1–365 (integer) |
| `progress` | 0–100 (integer) |

---

## 6. Design Language

### Silk & Glass Aesthetic

STRIDE uses a custom **"Silk & Glass"** design system — a refined glassmorphism approach built on these principles:

| Principle | Implementation |
|---|---|
| **Translucent Surfaces** | `bg-white/60 dark:bg-white/[0.04]` with `backdrop-blur-[40px]` |
| **Soft Borders** | `border-[0.5px] border-black/5 dark:border-white/20` |
| **Layered Shadows** | Multi-stop box shadows: `shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),...]` |
| **Micro-Interactions** | Framer Motion springs on every interactive element (`whileHover`, `whileTap`, `layoutId`) |
| **Colour System** | 7 accent colours via CSS custom properties (indigo, rose, amber, emerald, cyan, violet, pink) |
| **Typography** | Geist Mono for data; system `font-sans` for UI text; `tracking-tighter` for headings |
| **Dark Mode** | Full dark mode support with separate shadow and glow treatments |

### Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| `< 768px` | Mobile — single column, collapsible sidebar |
| `768px – 1024px` | Tablet — 2-column grid, condensed timeline |
| `> 1024px` | Desktop — full 3-column grid, expanded timeline |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Performance** | Lighthouse Performance score ≥ 90; bundle size < 600 KB gzipped |
| **Accessibility** | WCAG 2.1 AA compliance; keyboard-navigable; ARIA labels on interactive elements |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Offline Capability** | Full CRUD via `localStorage`; sync queue for when backend reconnects |
| **Security** | CSP with no `unsafe-eval`; CSRF protection; HTTPS enforcement in production; anti-clickjacking; strict payload validation |
| **Build Time** | Production build < 15 seconds |
| **Test Coverage** | Unit tests via Vitest; component tests via Testing Library |

---

## 8. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Task Completion Rate** | ≥ 70% of created tasks completed within the week | Analytics event tracking |
| **Focus Timer Adoption** | ≥ 40% of active users use the timer at least once per week | Session events |
| **Project Retention** | ≥ 60% of created projects have activity in the last 7 days | Backend query |
| **Team Invite Acceptance** | ≥ 50% acceptance rate on sent invites | Invite status tracking |
| **Page Load Time** | < 2 seconds on 3G connection | Lighthouse / RUM |

---

## 9. Roadmap & Milestones

### Phase 1: Foundation (✅ Complete)

- [x] Daily Focused View with drag-and-drop
- [x] Chronos Timeline with progress arcs
- [x] Focus Timer (Pomodoro)
- [x] Project CRUD with glassmorphic dashboard
- [x] Command Palette (Ctrl+K)
- [x] Stealth Mode (Alt+S)
- [x] Offline-first localStorage persistence
- [x] API-ready service layer

### Phase 2: Collaboration & Security (✅ Complete)

- [x] RBAC (Owner / Admin / Editor / Viewer)
- [x] Member management & invite system
- [x] Enterprise Audit Log (Activity Trail)
- [x] Advanced Focus Timer (52/17, 90-Min Flow)
- [x] Project limits enforcement (Solo: 3, Team: 6)
- [x] Dashboard Solo/Team filter toggle
- [x] CSP, CSRF, anti-clickjacking, prototype-pollution defense
- [x] Supply chain vulnerability remediation

### Phase 3: Backend Integration (🔄 In Progress)

- [ ] REST API implementation (see `BACKEND_REQUIREMENTS.md`)
- [ ] PostgreSQL database with schema migrations
- [ ] JWT authentication with HTTP-Only refresh cookies
- [ ] Server-side RBAC middleware
- [ ] Backend-enforced project limits & validation

### Phase 4: Real-Time & Scale (📋 Planned)

- [ ] WebSocket integration for live task board updates
- [ ] Presence indicators (who's viewing which project)
- [ ] Push notifications for invite / assignment events
- [ ] File attachments on tasks and notes
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Export (PDF project reports, CSV task exports)

---

<div align="center">
  <sub>This document is the single source of truth for STRIDE's product requirements.<br/>All feature decisions should reference this PRD.</sub>
</div>
