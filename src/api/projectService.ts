// ── Project Service ────────────────────────────────────
// Abstracted CRUD that currently uses localStorage but returns Promises.
// To connect a real backend: replace each function body with an apiClient call.
// The public API stays identical → 1-hour swap.

import type {
  Project,
  ProjectMember,
  ProjectInvite,
  ProjectNote,
  ProjectRole,
  InviteStatus,
} from "../components/ProjectDataContext";
import { sanitizeInput } from "../lib/sanitize";

// ── Storage helpers (private) ──────────────────────────
const STORAGE_KEY = "wf_projects";

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (p: unknown) =>
          p &&
          typeof (p as Project).id === "string" &&
          typeof (p as Project).name === "string" &&
          Array.isArray((p as Project).members),
      )
    ) {
      return [];
    }
    return parsed as Project[];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/** Simulate async latency that a real API would have (0 ms in dev) */
function tick(): Promise<void> {
  return Promise.resolve();
}

/** Collision-safe unique ID */
function uid(prefix = ""): string {
  return `${prefix}${crypto.randomUUID().slice(0, 8)}`;
}

// ── Sanitise text fields of a project-level payload ────
function sanitizeProjectFields<T extends Partial<Project>>(p: T): T {
  const clone = { ...p };
  if (typeof clone.name === "string") clone.name = sanitizeInput(clone.name);
  if (typeof clone.description === "string")
    clone.description = sanitizeInput(clone.description);
  return clone;
}

// ── Public service functions ───────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  // Future: return apiClient.get<Project[]>("/projects");
  await tick();
  return readAll();
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "notes" | "invites">,
): Promise<Project> {
  // Future: return apiClient.post<Project>("/projects", sanitizeProjectFields(data));
  await tick();
  const clean = sanitizeProjectFields(data);
  const newProj: Project = {
    ...clean,
    id: uid("proj-"),
    createdAt: Date.now(),
    notes: [],
    invites: [],
  };
  const all = readAll();
  writeAll([...all, newProj]);
  return newProj;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project> {
  // Future: return apiClient.patch<Project>(`/projects/${id}`, sanitizeProjectFields(updates));
  await tick();
  const clean = sanitizeProjectFields(updates);
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Project ${id} not found`);
  all[idx] = { ...all[idx], ...clean };
  writeAll(all);
  return all[idx];
}

export async function deleteProject(id: string): Promise<void> {
  // Future: return apiClient.delete(`/projects/${id}`);
  await tick();
  writeAll(readAll().filter((p) => p.id !== id));
}

// ── Notes ──────────────────────────────────────────────

export async function addNote(
  projectId: string,
  content: string,
  authorName: string,
  authorInitials: string,
): Promise<ProjectNote> {
  // Future: return apiClient.post<ProjectNote>(`/projects/${projectId}/notes`, { content, authorName, authorInitials });
  await tick();
  const note: ProjectNote = {
    id: uid("note-"),
    content: sanitizeInput(content),
    authorName: sanitizeInput(authorName),
    authorInitials: sanitizeInput(authorInitials),
    createdAt: Date.now(),
  };
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.notes = [note, ...proj.notes];
    writeAll(all);
  }
  return note;
}

export async function deleteNote(
  projectId: string,
  noteId: string,
): Promise<void> {
  // Future: return apiClient.delete(`/projects/${projectId}/notes/${noteId}`);
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.notes = proj.notes.filter((n) => n.id !== noteId);
    writeAll(all);
  }
}

// ── Members ────────────────────────────────────────────

export async function addMember(
  projectId: string,
  member: ProjectMember,
): Promise<void> {
  // Future: return apiClient.post(`/projects/${projectId}/members`, member);
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.members = [...proj.members, member];
    writeAll(all);
  }
}

export async function removeMember(
  projectId: string,
  memberId: string,
): Promise<void> {
  // Future: return apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (!proj) return;
  const member = proj.members.find((m) => m.id === memberId);
  if (
    member?.role === "owner" &&
    proj.members.filter((m) => m.role === "owner").length <= 1
  ) {
    return; // Prevent removing the last owner
  }
  proj.members = proj.members.filter((m) => m.id !== memberId);
  writeAll(all);
}

export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: ProjectRole,
): Promise<void> {
  // Future: return apiClient.patch(`/projects/${projectId}/members/${memberId}`, { role });
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.members = proj.members.map((m) =>
      m.id === memberId ? { ...m, role } : m,
    );
    writeAll(all);
  }
}

// ── Invites ────────────────────────────────────────────

export async function sendInvite(
  projectId: string,
  email: string,
  role: ProjectRole,
  invitedBy: string,
): Promise<ProjectInvite> {
  // Future: return apiClient.post<ProjectInvite>(`/projects/${projectId}/invites`, { email, role, invitedBy });
  await tick();
  const invite: ProjectInvite = {
    id: uid("inv-"),
    email: sanitizeInput(email),
    role,
    invitedBy: sanitizeInput(invitedBy),
    status: "pending",
    createdAt: Date.now(),
  };
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.invites = [...(proj.invites || []), invite];
    writeAll(all);
  }
  return invite;
}

export async function acceptInvite(
  projectId: string,
  inviteId: string,
  name: string,
  initials: string,
): Promise<void> {
  // Future: return apiClient.post(`/projects/${projectId}/invites/${inviteId}/accept`, { name, initials });
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (!proj) return;
  const invite = (proj.invites || []).find((i) => i.id === inviteId);
  if (!invite || invite.status !== "pending") return;
  const newMember: ProjectMember = {
    id: uid("m-"),
    initials: sanitizeInput(initials),
    name: sanitizeInput(name),
    email: invite.email,
    color: "bg-indigo-500",
    role: invite.role,
  };
  proj.invites = proj.invites.map((i) =>
    i.id === inviteId ? { ...i, status: "accepted" as InviteStatus } : i,
  );
  proj.members = [...proj.members, newMember];
  writeAll(all);
}

export async function declineInvite(
  projectId: string,
  inviteId: string,
): Promise<void> {
  // Future: return apiClient.delete(`/projects/${projectId}/invites/${inviteId}`);
  await tick();
  const all = readAll();
  const proj = all.find((p) => p.id === projectId);
  if (proj) {
    proj.invites = (proj.invites || []).map((i) =>
      i.id === inviteId ? { ...i, status: "declined" as InviteStatus } : i,
    );
    writeAll(all);
  }
}

// ── Task persistence (per-project) ────────────────────

const TASK_PREFIX = "stride_tasks_";

export async function fetchTasks(projectId: string): Promise<unknown[] | null> {
  // Future: return apiClient.get(`/projects/${projectId}/tasks`);
  await tick();
  try {
    const raw = localStorage.getItem(TASK_PREFIX + projectId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveTasks(
  projectId: string,
  columns: unknown[],
): Promise<void> {
  // Future: return apiClient.put(`/projects/${projectId}/tasks`, columns);
  await tick();
  try {
    localStorage.setItem(TASK_PREFIX + projectId, JSON.stringify(columns));
  } catch {
    /* quota exceeded — silent */
  }
}

// ── Aggregate export ───────────────────────────────────
export const ProjectService = {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  addNote,
  deleteNote,
  addMember,
  removeMember,
  updateMemberRole,
  sendInvite,
  acceptInvite,
  declineInvite,
  fetchTasks,
  saveTasks,
} as const;

export default ProjectService;
