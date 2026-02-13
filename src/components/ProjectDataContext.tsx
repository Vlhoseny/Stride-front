import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ProjectService } from "../api/projectService";

// ── Types ──────────────────────────────────────────────
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

// ── Seed Data ──────────────────────────────────────────
const SEED_PROJECTS: Project[] = [
    {
        id: "proj-1",
        name: "Design System v3",
        description: "Rebuilding component library with new silk tokens and glass surfaces.",
        iconName: "Palette",
        progress: 72,
        status: "on-track",
        color: "indigo",
        mode: "team",
        members: [
            { id: "m1", initials: "AK", name: "Alex Kim", email: "alex@example.com", color: "bg-indigo-500", role: "owner" },
            { id: "m2", initials: "MJ", name: "Maya Jones", email: "maya@example.com", color: "bg-violet-500", role: "admin" },
            { id: "m3", initials: "RL", name: "Ryan Lee", email: "ryan@example.com", color: "bg-sky-500", role: "editor" },
        ],
        invites: [],
        notes: [
            { id: "n1", content: "Finalised the colour tokens — ready for review.", authorName: "Alex Kim", authorInitials: "AK", createdAt: Date.now() - 86_400_000 * 2 },
            { id: "n2", content: "Glass surfaces need a second pass on light mode contrast.", authorName: "Maya Jones", authorInitials: "MJ", createdAt: Date.now() - 86_400_000 },
        ],
        tags: [
            { id: "t1", label: "Design", color: "indigo" },
            { id: "t2", label: "Priority", color: "rose" },
            { id: "t3", label: "UX", color: "amber" },
        ],
        createdAt: Date.now() - 86_400_000 * 30,
        estimatedDays: 45,
    },
    {
        id: "proj-2",
        name: "API Gateway",
        description: "Rate limiting, auth middleware, and WebSocket proxy layer.",
        iconName: "Shield",
        progress: 45,
        status: "delayed",
        color: "rose",
        mode: "team",
        members: [
            { id: "m4", initials: "SC", name: "Sam Chen", email: "sam@example.com", color: "bg-emerald-500", role: "owner" },
            { id: "m5", initials: "MJ", name: "Maya Jones", email: "maya@example.com", color: "bg-violet-500", role: "editor" },
        ],
        invites: [],
        notes: [
            { id: "n3", content: "WebSocket proxy is blocked until infra migration is done.", authorName: "Sam Chen", authorInitials: "SC", createdAt: Date.now() - 86_400_000 * 3 },
        ],
        tags: [
            { id: "t4", label: "Backend", color: "emerald" },
            { id: "t5", label: "Security", color: "rose" },
            { id: "t6", label: "Feature", color: "sky" },
        ],
        createdAt: Date.now() - 86_400_000 * 20,
        estimatedDays: 60,
    },
    {
        id: "proj-3",
        name: "Mobile App",
        description: "React Native client with offline-first architecture.",
        iconName: "Rocket",
        progress: 88,
        status: "on-track",
        color: "emerald",
        mode: "team",
        members: [
            { id: "m6", initials: "RL", name: "Ryan Lee", email: "ryan@example.com", color: "bg-sky-500", role: "owner" },
            { id: "m7", initials: "AK", name: "Alex Kim", email: "alex@example.com", color: "bg-indigo-500", role: "admin" },
            { id: "m8", initials: "TW", name: "Taylor Wu", email: "taylor@example.com", color: "bg-amber-500", role: "editor" },
            { id: "m9", initials: "SC", name: "Sam Chen", email: "sam@example.com", color: "bg-emerald-500", role: "viewer" },
        ],
        invites: [],
        notes: [],
        tags: [
            { id: "t7", label: "Mobile", color: "sky" },
            { id: "t8", label: "Offline", color: "amber" },
        ],
        createdAt: Date.now() - 86_400_000 * 50,
        estimatedDays: 55,
    },
    {
        id: "proj-4",
        name: "AI Assistant",
        description: "LLM-powered copilot for task management and scheduling.",
        iconName: "Sparkles",
        progress: 30,
        status: "on-track",
        color: "amber",
        mode: "solo",
        members: [
            { id: "m10", initials: "TW", name: "Taylor Wu", email: "taylor@example.com", color: "bg-amber-500", role: "owner" },
        ],
        invites: [],
        notes: [
            { id: "n4", content: "Prompt engineering phase done. Starting integration with the scheduler.", authorName: "Taylor Wu", authorInitials: "TW", createdAt: Date.now() - 86_400_000 },
        ],
        tags: [
            { id: "t9", label: "AI", color: "amber" },
            { id: "t10", label: "Feature", color: "sky" },
        ],
        createdAt: Date.now() - 86_400_000 * 10,
        estimatedDays: 40,
    },
    {
        id: "proj-5",
        name: "Platform Infra",
        description: "Kubernetes migration, CI/CD pipelines, and monitoring.",
        iconName: "Layers",
        progress: 60,
        status: "delayed",
        color: "sky",
        mode: "team",
        members: [
            { id: "m11", initials: "SC", name: "Sam Chen", email: "sam@example.com", color: "bg-emerald-500", role: "owner" },
            { id: "m12", initials: "MJ", name: "Maya Jones", email: "maya@example.com", color: "bg-violet-500", role: "admin" },
            { id: "m13", initials: "AK", name: "Alex Kim", email: "alex@example.com", color: "bg-indigo-500", role: "editor" },
        ],
        invites: [],
        notes: [],
        tags: [
            { id: "t11", label: "DevOps", color: "sky" },
            { id: "t12", label: "Infra", color: "emerald" },
        ],
        createdAt: Date.now() - 86_400_000 * 40,
        estimatedDays: 70,
    },
];

const STORAGE_KEY = "wf_projects";

// Initial sync load for first render (seed fallback)
function loadProjectsSync(): Project[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return SEED_PROJECTS;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return SEED_PROJECTS;
        if (!parsed.every((p: any) => p && typeof p.id === "string" && typeof p.name === "string" && Array.isArray(p.members))) {
            return SEED_PROJECTS;
        }
        return parsed;
    } catch {
        return SEED_PROJECTS;
    }
}

// ── Context ────────────────────────────────────────────
interface ProjectDataContextType {
    projects: Project[];
    getProject: (id: string) => Project | undefined;
    addProject: (p: Omit<Project, "id" | "createdAt" | "notes" | "invites">) => Project;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addNote: (projectId: string, content: string, authorName: string, authorInitials: string) => void;
    deleteNote: (projectId: string, noteId: string) => void;
    addMember: (projectId: string, member: ProjectMember) => void;
    removeMember: (projectId: string, memberId: string) => void;
    updateMemberRole: (projectId: string, memberId: string, role: ProjectRole) => void;
    sendInvite: (projectId: string, email: string, role: ProjectRole, invitedBy: string) => void;
    acceptInvite: (projectId: string, inviteId: string, name: string, initials: string) => void;
    declineInvite: (projectId: string, inviteId: string) => void;
    getMyRole: (projectId: string, userEmail: string) => ProjectRole | null;
}

const ProjectDataContext = createContext<ProjectDataContextType | null>(null);

export function ProjectDataProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(loadProjectsSync);

    // Hydrate from async service on mount (ready for real API)
    useEffect(() => {
        let cancelled = false;
        ProjectService.fetchProjects().then((data) => {
            if (!cancelled && data.length > 0) setProjects(data);
        });
        return () => { cancelled = true; };
    }, []);

    // Optimistic update: apply to local state immediately, fire service call in background
    const optimistic = useCallback(
        (fn: (prev: Project[]) => Project[], sideEffect?: () => Promise<unknown>) => {
            // Capture previous state for rollback
            let snapshot: Project[] | null = null;
            setProjects((prev) => {
                snapshot = prev;
                return fn(prev);
            });
            sideEffect?.().catch((err) => {
                // Rollback on failure and notify user
                if (snapshot) setProjects(snapshot);
                toast.error("Failed to save changes. Reverted to previous state.");
                if (import.meta.env.DEV) console.error("Service error:", err);
            });
        },
        [],
    );

    const getProject = useCallback(
        (id: string) => projects.find((p) => p.id === id),
        [projects]
    );

    const addProject = useCallback(
        (p: Omit<Project, "id" | "createdAt" | "notes" | "invites">) => {
            const tempId = `proj-${crypto.randomUUID().slice(0, 8)}`;
            const newProj: Project = {
                ...p,
                id: tempId,
                createdAt: Date.now(),
                notes: [],
                invites: [],
            };
            optimistic(
                (prev) => [...prev, newProj],
                () => ProjectService.createProject(p).then((created) => {
                    setProjects((prev) =>
                        prev.map((proj) => (proj.id === tempId ? { ...proj, ...created } : proj))
                    );
                }),
            );
            return newProj;
        },
        [optimistic]
    );

    const updateProject = useCallback(
        (id: string, updates: Partial<Project>) => {
            optimistic(
                (prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                () => ProjectService.updateProject(id, updates),
            );
        },
        [optimistic]
    );

    const deleteProject = useCallback(
        (id: string) => {
            optimistic(
                (prev) => prev.filter((p) => p.id !== id),
                () => ProjectService.deleteProject(id),
            );
        },
        [optimistic]
    );

    const addNote = useCallback(
        (projectId: string, content: string, authorName: string, authorInitials: string) => {
            const tempId = `note-${crypto.randomUUID().slice(0, 8)}`;
            const note: ProjectNote = {
                id: tempId,
                content,
                authorName,
                authorInitials,
                createdAt: Date.now(),
            };
            optimistic(
                (prev) => prev.map((p) => p.id === projectId ? { ...p, notes: [note, ...p.notes] } : p),
                () => ProjectService.addNote(projectId, content, authorName, authorInitials),
            );
        },
        [optimistic]
    );

    const deleteNote = useCallback(
        (projectId: string, noteId: string) => {
            optimistic(
                (prev) => prev.map((p) => p.id === projectId ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) } : p),
                () => ProjectService.deleteNote(projectId, noteId),
            );
        },
        [optimistic]
    );

    const addMember = useCallback(
        (projectId: string, member: ProjectMember) => {
            optimistic(
                (prev) => prev.map((p) => p.id === projectId ? { ...p, members: [...p.members, member] } : p),
                () => ProjectService.addMember(projectId, member),
            );
        },
        [optimistic]
    );

    const removeMember = useCallback(
        (projectId: string, memberId: string) => {
            optimistic(
                (prev) => prev.map((p) => {
                    if (p.id !== projectId) return p;
                    const member = p.members.find((m) => m.id === memberId);
                    if (member?.role === "owner" && p.members.filter((m) => m.role === "owner").length <= 1) return p;
                    return { ...p, members: p.members.filter((m) => m.id !== memberId) };
                }),
                () => ProjectService.removeMember(projectId, memberId),
            );
        },
        [optimistic]
    );

    const updateMemberRole = useCallback(
        (projectId: string, memberId: string, role: ProjectRole) => {
            optimistic(
                (prev) => prev.map((p) =>
                    p.id === projectId
                        ? { ...p, members: p.members.map((m) => (m.id === memberId ? { ...m, role } : m)) }
                        : p
                ),
                () => ProjectService.updateMemberRole(projectId, memberId, role),
            );
        },
        [optimistic]
    );

    const sendInvite = useCallback(
        (projectId: string, email: string, role: ProjectRole, invitedBy: string) => {
            const tempId = `inv-${crypto.randomUUID().slice(0, 8)}`;
            const invite: ProjectInvite = {
                id: tempId,
                email,
                role,
                invitedBy,
                status: "pending",
                createdAt: Date.now(),
            };
            optimistic(
                (prev) => prev.map((p) => p.id === projectId ? { ...p, invites: [...(p.invites || []), invite] } : p),
                () => ProjectService.sendInvite(projectId, email, role, invitedBy),
            );
        },
        [optimistic]
    );

    const acceptInvite = useCallback(
        (projectId: string, inviteId: string, name: string, initials: string) => {
            optimistic(
                (prev) => prev.map((p) => {
                    if (p.id !== projectId) return p;
                    const invite = (p.invites || []).find((i) => i.id === inviteId);
                    if (!invite || invite.status !== "pending") return p;
                    const newMember: ProjectMember = {
                        id: `m-${crypto.randomUUID().slice(0, 8)}`,
                        initials,
                        name,
                        email: invite.email,
                        color: "bg-indigo-500",
                        role: invite.role,
                    };
                    return {
                        ...p,
                        invites: p.invites.map((i) =>
                            i.id === inviteId ? { ...i, status: "accepted" as InviteStatus } : i
                        ),
                        members: [...p.members, newMember],
                    };
                }),
                () => ProjectService.acceptInvite(projectId, inviteId, name, initials),
            );
        },
        [optimistic]
    );

    const declineInvite = useCallback(
        (projectId: string, inviteId: string) => {
            optimistic(
                (prev) => prev.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            invites: (p.invites || []).map((i) =>
                                i.id === inviteId ? { ...i, status: "declined" as InviteStatus } : i
                            ),
                        }
                        : p
                ),
                () => ProjectService.declineInvite(projectId, inviteId),
            );
        },
        [optimistic]
    );

    const getMyRole = useCallback(
        (projectId: string, userEmail: string): ProjectRole | null => {
            const proj = projects.find((p) => p.id === projectId);
            if (!proj) return null;
            const member = proj.members.find((m) => m.email === userEmail);
            return member?.role ?? null;
        },
        [projects]
    );

    return (
        <ProjectDataContext.Provider
            value={{
                projects,
                getProject,
                addProject,
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
                getMyRole,
            }}
        >
            {children}
        </ProjectDataContext.Provider>
    );
}

export function useProjectData() {
    const ctx = useContext(ProjectDataContext);
    if (!ctx) throw new Error("useProjectData must be used within ProjectDataProvider");
    return ctx;
}
