# STRIDE — Backend Requirements Specification

> **Audience**: Backend engineering team  
> **Status**: Ready for implementation  
> **Frontend Version**: 1.0.0  
> **Last Updated**: February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Frontend Integration Point](#2-frontend-integration-point)
3. [Database Schema](#3-database-schema)
4. [REST API Endpoints](#4-rest-api-endpoints)
5. [Authentication & Authorisation](#5-authentication--authorisation)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Data Integrity & Validation](#7-data-integrity--validation)
8. [Real-Time Considerations](#8-real-time-considerations)
9. [Deployment Checklist](#9-deployment-checklist)

---

## 1. Overview

STRIDE's frontend is a React 18 SPA that currently runs **entirely offline** using `localStorage`. All data mutations already flow through an **async Service Layer** (`src/api/projectService.ts`) that returns Promises. Each service function contains a `// Future:` comment showing the exact `apiClient` one-liner to activate.

**The goal**: Build a REST API that the frontend can connect to by:

1. Setting `VITE_API_BASE_URL` in the `.env` file
2. Calling `setAccessToken(jwt)` after login
3. Uncommenting the `// Future:` lines in `projectService.ts`

**No frontend refactoring is needed.** The contract is already defined.

---

## 2. Frontend Integration Point

### API Client (`src/api/apiClient.ts`)

The frontend uses a thin Fetch wrapper that:

- Prepends `VITE_API_BASE_URL` to every endpoint
- Injects `Authorization: Bearer <token>` on every request if a token is set
- Sends `Content-Type: application/json` for all bodies
- Throws an `ApiError` with status code and parsed body on non-2xx responses
- Returns `undefined` on `204 No Content`

### Service Layer (`src/api/projectService.ts`)

| Service Function | HTTP Method | Endpoint (Expected) |
|---|---|---|
| `fetchProjects()` | `GET` | `/api/projects` |
| `createProject(data)` | `POST` | `/api/projects` |
| `updateProject(id, updates)` | `PATCH` | `/api/projects/:id` |
| `deleteProject(id)` | `DELETE` | `/api/projects/:id` |
| `addNote(projectId, ...)` | `POST` | `/api/projects/:projectId/notes` |
| `deleteNote(projectId, noteId)` | `DELETE` | `/api/projects/:projectId/notes/:noteId` |
| `addMember(projectId, member)` | `POST` | `/api/projects/:projectId/members` |
| `removeMember(projectId, memberId)` | `DELETE` | `/api/projects/:projectId/members/:memberId` |
| `updateMemberRole(projectId, memberId, role)` | `PATCH` | `/api/projects/:projectId/members/:memberId` |
| `sendInvite(projectId, ...)` | `POST` | `/api/projects/:projectId/invites` |
| `acceptInvite(projectId, inviteId, ...)` | `POST` | `/api/projects/:projectId/invites/:inviteId/accept` |
| `declineInvite(projectId, inviteId)` | `DELETE` | `/api/projects/:projectId/invites/:inviteId` |
| `fetchTasks(projectId)` | `GET` | `/api/projects/:projectId/tasks` |
| `saveTasks(projectId, columns)` | `PUT` | `/api/projects/:projectId/tasks` |

> **Note**: The frontend performs **optimistic updates** — it updates local state immediately, then fires the service call. If the backend returns an error, the frontend catches it silently (for now). A future iteration may add rollback / retry logic.

---

## 3. Database Schema

### Suggested Entity-Relationship Diagram

```
┌──────────────┐       ┌─────────────────────┐       ┌──────────────┐
│    Users      │       │  ProjectMembers     │       │   Projects   │
├──────────────┤       ├─────────────────────┤       ├──────────────┤
│ id       PK  │──┐    │ id            PK    │    ┌──│ id       PK  │
│ email        │  │    │ user_id       FK  ──│────┘  │ name         │
│ full_name    │  └────│ project_id    FK    │       │ description  │
│ initials     │       │ role (enum)         │       │ icon_name    │
│ avatar_url   │       │ color              │       │ progress     │
│ password_hash│       │ joined_at          │       │ status (enum)│
│ created_at   │       └─────────────────────┘       │ color        │
└──────────────┘                                      │ mode (enum)  │
                                                      │ created_by FK│
       ┌──────────────┐       ┌──────────────┐       │ created_at   │
       │   Invites     │       │    Notes      │       │ estimated_days│
       ├──────────────┤       ├──────────────┤       └──────────────┘
       │ id       PK  │       │ id       PK  │              │
       │ project_id FK│       │ project_id FK│──────────────┘
       │ email        │       │ content      │
       │ role (enum)  │       │ author_id FK │
       │ invited_by FK│       │ created_at   │
       │ status (enum)│       └──────────────┘
       │ created_at   │
       └──────────────┘

       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
       │    Tags       │       │    Tasks      │       │  TaskColumns  │
       ├──────────────┤       ├──────────────┤       ├──────────────┤
       │ id       PK  │       │ id       PK  │       │ id       PK  │
       │ project_id FK│       │ column_id FK │       │ project_id FK│
       │ label        │       │ title        │       │ date         │
       │ color        │       │ description  │       │ sort_order   │
       └──────────────┘       │ done (bool)  │       └──────────────┘
                              │ rolled_over  │
                              │ priority     │
                              │ due_date     │
                              │ sort_order   │
                              │ assignees [] │
                              └──────────────┘
```

### Model Definitions

#### `Users`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY`, auto-generated |
| `email` | VARCHAR(255) | `UNIQUE`, `NOT NULL` |
| `full_name` | VARCHAR(255) | `NOT NULL` |
| `initials` | VARCHAR(4) | `NOT NULL` |
| `avatar_url` | TEXT | Nullable |
| `password_hash` | TEXT | `NOT NULL` |
| `created_at` | TIMESTAMP | `DEFAULT NOW()` |

#### `Projects`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY`, auto-generated |
| `name` | VARCHAR(255) | `NOT NULL` |
| `description` | TEXT | Nullable |
| `icon_name` | VARCHAR(50) | `DEFAULT 'Folder'` |
| `progress` | INTEGER | `DEFAULT 0`, `CHECK (0..100)` |
| `status` | ENUM | `'on-track'`, `'delayed'`, `'completed'` |
| `color` | VARCHAR(30) | `DEFAULT 'indigo'` |
| `mode` | ENUM | `'solo'`, `'team'` |
| `created_by` | UUID (FK → Users) | `NOT NULL` |
| `created_at` | TIMESTAMP | `DEFAULT NOW()` |
| `estimated_days` | INTEGER | `DEFAULT 30` |

#### `ProjectMembers`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `project_id` | UUID (FK → Projects) | `NOT NULL`, `ON DELETE CASCADE` |
| `user_id` | UUID (FK → Users) | `NOT NULL` |
| `role` | ENUM | `'owner'`, `'admin'`, `'editor'`, `'viewer'` |
| `color` | VARCHAR(30) | `DEFAULT 'bg-indigo-500'` |
| `joined_at` | TIMESTAMP | `DEFAULT NOW()` |

> **Unique constraint**: `(project_id, user_id)` — a user can only be a member once per project.

#### `Invites`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `project_id` | UUID (FK → Projects) | `NOT NULL`, `ON DELETE CASCADE` |
| `email` | VARCHAR(255) | `NOT NULL` |
| `role` | ENUM | `'owner'`, `'admin'`, `'editor'`, `'viewer'` |
| `invited_by` | UUID (FK → Users) | `NOT NULL` |
| `status` | ENUM | `'pending'`, `'accepted'`, `'declined'` |
| `created_at` | TIMESTAMP | `DEFAULT NOW()` |

#### `Notes`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `project_id` | UUID (FK → Projects) | `NOT NULL`, `ON DELETE CASCADE` |
| `content` | TEXT | `NOT NULL` |
| `author_id` | UUID (FK → Users) | `NOT NULL` |
| `created_at` | TIMESTAMP | `DEFAULT NOW()` |

#### `Tags`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `project_id` | UUID (FK → Projects) | `NOT NULL`, `ON DELETE CASCADE` |
| `label` | VARCHAR(50) | `NOT NULL` |
| `color` | VARCHAR(30) | `NOT NULL` |

#### `TaskColumns`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `project_id` | UUID (FK → Projects) | `NOT NULL`, `ON DELETE CASCADE` |
| `date` | DATE | `NOT NULL` |
| `sort_order` | INTEGER | `DEFAULT 0` |

> **Unique constraint**: `(project_id, date)` — one column per day per project.

#### `Tasks`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` |
| `column_id` | UUID (FK → TaskColumns) | `NOT NULL`, `ON DELETE CASCADE` |
| `title` | VARCHAR(500) | `NOT NULL` |
| `description` | TEXT | Nullable |
| `done` | BOOLEAN | `DEFAULT false` |
| `rolled_over` | BOOLEAN | `DEFAULT false` |
| `priority` | ENUM | `'low'`, `'medium'`, `'high'`, `'critical'` — Nullable |
| `due_date` | DATE | Nullable |
| `sort_order` | INTEGER | `DEFAULT 0` |

#### `TaskAssignees` (join table)

| Column | Type | Constraints |
|---|---|---|
| `task_id` | UUID (FK → Tasks) | `NOT NULL`, `ON DELETE CASCADE` |
| `user_initials` | VARCHAR(4) | `NOT NULL` |

> **Primary key**: `(task_id, user_initials)`

---

## 4. REST API Endpoints

All endpoints are prefixed with `/api`. All request/response bodies are JSON.

### 4.1 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and return JWT | Public |
| `POST` | `/api/auth/refresh` | Refresh an expired access token | Refresh token |
| `GET` | `/api/auth/me` | Return current user profile | Bearer |

**Login Response**:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "dGhpcyBpcyBh...",
  "user": {
    "id": "uuid",
    "email": "alex@example.com",
    "fullName": "Alex Kim",
    "initials": "AK",
    "avatarUrl": null
  }
}
```

### 4.2 Projects

| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/api/projects` | List all projects the user is a member of | Any member |
| `POST` | `/api/projects` | Create a new project (caller becomes `owner`) | Authenticated |
| `GET` | `/api/projects/:id` | Get a single project with members, tags, notes | `viewer` + |
| `PATCH` | `/api/projects/:id` | Update project fields (name, description, status, progress…) | `editor` + |
| `DELETE` | `/api/projects/:id` | Delete a project and all related data | `owner` |

**Create Project Body**:
```json
{
  "name": "Design System v3",
  "description": "Rebuilding component library.",
  "iconName": "Palette",
  "progress": 0,
  "status": "on-track",
  "color": "indigo",
  "mode": "team",
  "members": [
    { "initials": "AK", "name": "Alex Kim", "email": "alex@example.com", "color": "bg-indigo-500", "role": "owner" }
  ],
  "tags": [
    { "label": "Design", "color": "indigo" }
  ],
  "estimatedDays": 45
}
```

### 4.3 Project Members

| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `POST` | `/api/projects/:id/members` | Add a member directly | `admin` + |
| `PATCH` | `/api/projects/:id/members/:memberId` | Update a member's role | `admin` + |
| `DELETE` | `/api/projects/:id/members/:memberId` | Remove a member | `admin` + |

> **Business Rule**: The last `owner` of a project **cannot** be removed. The backend must enforce this.

### 4.4 Invites

| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `POST` | `/api/projects/:id/invites` | Send an invite (email + role) | `admin` + |
| `POST` | `/api/projects/:id/invites/:inviteId/accept` | Accept a pending invite | Invite recipient |
| `DELETE` | `/api/projects/:id/invites/:inviteId` | Decline / cancel an invite | Invite recipient or `admin` + |

**Send Invite Body**:
```json
{
  "email": "newuser@example.com",
  "role": "editor",
  "invitedBy": "Alex Kim"
}
```

### 4.5 Notes

| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `POST` | `/api/projects/:id/notes` | Add a note | `editor` + |
| `DELETE` | `/api/projects/:id/notes/:noteId` | Delete a note | Note author or `admin` + |

**Add Note Body**:
```json
{
  "content": "Finalised the colour tokens — ready for review.",
  "authorName": "Alex Kim",
  "authorInitials": "AK"
}
```

### 4.6 Tasks (Weekly Board)

The frontend sends the **entire day-column structure** as a single payload. This simplifies drag-and-drop reordering, rollover logic, and eliminates race conditions from individual task PATCH calls.

| Method | Endpoint | Description | Min Role |
|---|---|---|---|
| `GET` | `/api/projects/:id/tasks` | Fetch all task columns for the project | `viewer` + |
| `PUT` | `/api/projects/:id/tasks` | Replace all task columns (full overwrite) | `editor` + |

**PUT Body** (array of day columns):
```json
[
  {
    "date": "2026-02-13T00:00:00.000Z",
    "tasks": [
      {
        "id": "task-a1b2c3d4",
        "title": "Implement login flow",
        "description": "OAuth2 + email/password",
        "tags": [{ "label": "Auth", "color": "rose" }],
        "assignees": ["AK", "MJ"],
        "done": false,
        "rolledOver": false,
        "priority": "high",
        "dueDate": "2026-02-15T00:00:00.000Z"
      }
    ]
  }
]
```

> **Future Enhancement**: Consider adding granular task endpoints (`POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/rollover`) for real-time collaboration. The current bulk-PUT approach is sufficient for single-user and small-team use.

---

## 5. Authentication & Authorisation

### JWT Strategy

| Token | Lifetime | Storage (Frontend) | Usage |
|---|---|---|---|
| **Access Token** | 15 minutes | In-memory (`setAccessToken()`) | `Authorization: Bearer <token>` on every request |
| **Refresh Token** | 7 days | `httpOnly` cookie | `POST /api/auth/refresh` to get a new access token |

### Token Payload (Access Token)

```json
{
  "sub": "user-uuid",
  "email": "alex@example.com",
  "fullName": "Alex Kim",
  "iat": 1739452800,
  "exp": 1739453700
}
```

### Frontend Expectations

- On **401 Unauthorized**: The frontend will redirect to `/auth` (login page).
- On **403 Forbidden**: The frontend will show an inline error toast (no redirect).
- The `apiClient` does **not** currently auto-refresh tokens — this should be added when the backend is connected. A response interceptor can catch 401, call `/api/auth/refresh`, retry the original request.

---

## 6. Role-Based Access Control (RBAC)

The frontend enforces four permission tiers at the UI level. **The backend must mirror these checks on every endpoint.**

### Permission Matrix

| Action | `owner` | `admin` | `editor` | `viewer` |
|---|:---:|:---:|:---:|:---:|
| View project & tasks | ✅ | ✅ | ✅ | ✅ |
| Create / edit / delete **own** tasks | ✅ | ✅ | ✅ | ❌ |
| Create / edit / delete **any** task | ✅ | ✅ | ❌ | ❌ |
| Add / edit / delete notes | ✅ | ✅ | ✅ | ❌ |
| Add / remove members | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ❌ | ❌ |
| Send / manage invites | ✅ | ✅ | ❌ | ❌ |
| Edit project settings (name, status…) | ✅ | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

### Implementation Notes

- Middleware should extract the user ID from the JWT, look up the `ProjectMembers` table, and inject the role into the request context.
- Solo-mode projects (`mode: 'solo'`) should still have a single `owner` member record — no special-casing needed.
- An `editor` can only modify tasks **assigned to them** (the `assignees` array contains their initials). Admins and owners can modify all tasks.

---

## 7. Data Integrity & Validation

### Frontend Sanitisation (Already Implemented)

The frontend runs all user-generated text through `sanitizeInput()` (`src/lib/sanitize.ts`) before sending it to the service layer. This utility:

- **Strips HTML/XSS**: Removes `<script>`, `<style>`, all HTML tags, `javascript:` / `data:` URIs, and `on*=` event handlers.
- **Filters profanity**: Replaces matches from a regex-based word list with asterisks (`****`).
- **Trims whitespace**.

### ⚠️ Backend MUST Enforce Its Own Validation

**Never trust the client.** The backend **must** replicate equivalent validation on every write endpoint:

| Rule | Implementation |
|---|---|
| **XSS / HTML stripping** | Sanitise all string fields before persisting. Use a library like `sanitize-html` (Node.js), `Ganss.Xss.HtmlSanitizer` (.NET), or equivalent. |
| **Profanity filter** | Apply a server-side word list (same or expanded from the frontend). |
| **Schema validation** | Validate all request bodies against strict schemas. Use **Zod** (Node.js), **FluentValidation** (.NET), or **Pydantic** (Python). |
| **Max lengths** | `name` ≤ 255 chars, `description` ≤ 5000 chars, `note.content` ≤ 10000 chars, `task.title` ≤ 500 chars. |
| **Enum enforcement** | `status`, `mode`, `role`, `priority`, `inviteStatus` must be validated against their allowed values. |
| **UUID format** | All IDs must be valid UUIDs. |
| **Rate limiting** | Apply rate limits on auth endpoints (login, register) and invite sending. |

### Example: Zod Schema (Node.js)

```typescript
import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  iconName: z.string().max(50).default("Folder"),
  progress: z.number().int().min(0).max(100).default(0),
  status: z.enum(["on-track", "delayed", "completed"]),
  color: z.string().max(30).default("indigo"),
  mode: z.enum(["solo", "team"]),
  estimatedDays: z.number().int().min(1).max(365).default(30),
  members: z.array(z.object({
    initials: z.string().max(4),
    name: z.string().max(255),
    email: z.string().email(),
    color: z.string().max(30),
    role: z.enum(["owner", "admin", "editor", "viewer"]),
  })).min(1),
  tags: z.array(z.object({
    label: z.string().max(50),
    color: z.string().max(30),
  })).optional(),
});
```

---

## 8. Real-Time Considerations

The current frontend does **not** use WebSockets or SSE. However, for future team collaboration features, consider:

| Feature | Recommended Approach |
|---|---|
| Live task board updates | WebSocket room per project (`ws://host/projects/:id`) |
| Presence indicators | Heartbeat over WebSocket (who's viewing which project) |
| Notification delivery | SSE or WebSocket push for invite notifications |

The `apiClient` is Fetch-based and won't handle WebSocket connections. A separate `ws` client would need to be added to the frontend when real-time features are implemented.

---

## 9. Deployment Checklist

When the backend is ready, the frontend needs **three changes** to connect:

```bash
# .env (or .env.production)
VITE_API_BASE_URL=https://api.stride.app
```

```typescript
// src/components/AuthContext.tsx — after successful login
import { setAccessToken } from "../api/apiClient";
setAccessToken(response.accessToken);
```

```typescript
// src/api/projectService.ts — for each function, swap:
//   Before:  await tick(); ... localStorage ...
//   After:   return apiClient.get<Project[]>("/api/projects");
```

### Backend Infrastructure

| Concern | Recommendation |
|---|---|
| **Runtime** | Node.js 20+ (Express/Fastify), .NET 8, or Python (FastAPI) |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma (Node.js), Entity Framework (.NET), SQLAlchemy (Python) |
| **Auth** | `jsonwebtoken` / `jose` (Node.js), `System.IdentityModel.Tokens.Jwt` (.NET) |
| **Validation** | Zod (Node.js), FluentValidation (.NET), Pydantic (Python) |
| **CORS** | Allow `https://stride.app` origin, credentials: true |
| **Hosting** | Containerised (Docker) on AWS ECS, GCP Cloud Run, or Railway |

---

<div align="center">
  <sub>This document is the single source of truth for STRIDE backend integration.<br/>Keep it updated as endpoints evolve.</sub>
</div>
