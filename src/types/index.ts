// ── STRIDE Entities Layer ──────────────────────────────
// Single source of truth for all core business types.
// No component should redeclare these — import from here.

// ── Auth ───────────────────────────────────────────────
export interface User {
  email: string;
  fullName: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface StoredUser {
  /** SHA-256 hex digest — plaintext passwords are never stored */
  passwordHash: string;
  fullName: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
}

// ── Project ────────────────────────────────────────────
export type ProjectRole = "owner" | "admin" | "editor" | "viewer";
export type ProjectMode = "solo" | "team";
export type ProjectStatus = "on-track" | "delayed" | "completed";
export type InviteStatus = "pending" | "accepted" | "declined";

export interface ProjectMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  color: string;
  role: ProjectRole;
}

export interface ProjectInvite {
  id: string;
  email: string;
  role: ProjectRole;
  invitedBy: string;
  status: InviteStatus;
  createdAt: number;
}

export interface ProjectNote {
  id: string;
  content: string;
  authorName: string;
  authorInitials: string;
  createdAt: number;
}

export interface ProjectTag {
  id: string;
  label: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  iconName: string;
  progress: number;
  status: ProjectStatus;
  color: string;
  mode: ProjectMode;
  members: ProjectMember[];
  invites: ProjectInvite[];
  notes: ProjectNote[];
  tags: ProjectTag[];
  createdAt: number;
  estimatedDays: number;
}

// ── Task ───────────────────────────────────────────────
export type Priority = "low" | "medium" | "high" | "critical";

export interface Tag {
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  assignees: string[];
  done: boolean;
  rolledOver: boolean;
  priority?: Priority;
  dueDate?: Date;
}

export interface DayColumn {
  date: Date;
  tasks: Task[];
}

export interface SubTask {
  id: string;
  label: string;
  done: boolean;
  assigneeId?: string;
}

export interface ActivityEntry {
  id: string;
  text: string;
  time: string;
}

/** Alias re-exported by TaskDrawer for backward compat */
export type DrawerTask = Task;
