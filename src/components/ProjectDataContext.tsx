import React, { createContext, useContext, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────
export type ProjectRole = "owner" | "admin" | "editor" | "viewer";
export type ProjectMode = "solo" | "team";
export type ProjectStatus = "on-track" | "delayed" | "completed";

export interface ProjectMember {
    id: string;
    initials: string;
    name: string;
    color: string;
    role: ProjectRole;
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
            { id: "m1", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "owner" },
            { id: "m2", initials: "MJ", name: "Maya Jones", color: "bg-violet-500", role: "admin" },
            { id: "m3", initials: "RL", name: "Ryan Lee", color: "bg-sky-500", role: "editor" },
        ],
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
            { id: "m4", initials: "SC", name: "Sam Chen", color: "bg-emerald-500", role: "owner" },
            { id: "m5", initials: "MJ", name: "Maya Jones", color: "bg-violet-500", role: "editor" },
        ],
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
            { id: "m6", initials: "RL", name: "Ryan Lee", color: "bg-sky-500", role: "owner" },
            { id: "m7", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "admin" },
            { id: "m8", initials: "TW", name: "Taylor Wu", color: "bg-amber-500", role: "editor" },
            { id: "m9", initials: "SC", name: "Sam Chen", color: "bg-emerald-500", role: "viewer" },
        ],
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
            { id: "m10", initials: "TW", name: "Taylor Wu", color: "bg-amber-500", role: "owner" },
        ],
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
            { id: "m11", initials: "SC", name: "Sam Chen", color: "bg-emerald-500", role: "owner" },
            { id: "m12", initials: "MJ", name: "Maya Jones", color: "bg-violet-500", role: "admin" },
            { id: "m13", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "editor" },
        ],
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

function loadProjects(): Project[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : SEED_PROJECTS;
    } catch {
        return SEED_PROJECTS;
    }
}

function persist(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ── Context ────────────────────────────────────────────
interface ProjectDataContextType {
    projects: Project[];
    getProject: (id: string) => Project | undefined;
    addProject: (p: Omit<Project, "id" | "createdAt" | "notes">) => Project;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addNote: (projectId: string, content: string, authorName: string, authorInitials: string) => void;
    deleteNote: (projectId: string, noteId: string) => void;
    addMember: (projectId: string, member: ProjectMember) => void;
    removeMember: (projectId: string, memberId: string) => void;
    updateMemberRole: (projectId: string, memberId: string, role: ProjectRole) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | null>(null);

export function ProjectDataProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(loadProjects);

    const save = useCallback((fn: (prev: Project[]) => Project[]) => {
        setProjects((prev) => {
            const next = fn(prev);
            persist(next);
            return next;
        });
    }, []);

    const getProject = useCallback(
        (id: string) => projects.find((p) => p.id === id),
        [projects]
    );

    const addProject = useCallback(
        (p: Omit<Project, "id" | "createdAt" | "notes">) => {
            const newProj: Project = {
                ...p,
                id: `proj-${Date.now()}`,
                createdAt: Date.now(),
                notes: [],
            };
            save((prev) => [...prev, newProj]);
            return newProj;
        },
        [save]
    );

    const updateProject = useCallback(
        (id: string, updates: Partial<Project>) => {
            save((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        },
        [save]
    );

    const deleteProject = useCallback(
        (id: string) => save((prev) => prev.filter((p) => p.id !== id)),
        [save]
    );

    const addNote = useCallback(
        (projectId: string, content: string, authorName: string, authorInitials: string) => {
            const note: ProjectNote = {
                id: `note-${Date.now()}`,
                content,
                authorName,
                authorInitials,
                createdAt: Date.now(),
            };
            save((prev) =>
                prev.map((p) =>
                    p.id === projectId ? { ...p, notes: [note, ...p.notes] } : p
                )
            );
        },
        [save]
    );

    const deleteNote = useCallback(
        (projectId: string, noteId: string) => {
            save((prev) =>
                prev.map((p) =>
                    p.id === projectId
                        ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
                        : p
                )
            );
        },
        [save]
    );

    const addMember = useCallback(
        (projectId: string, member: ProjectMember) => {
            save((prev) =>
                prev.map((p) =>
                    p.id === projectId ? { ...p, members: [...p.members, member] } : p
                )
            );
        },
        [save]
    );

    const removeMember = useCallback(
        (projectId: string, memberId: string) => {
            save((prev) =>
                prev.map((p) =>
                    p.id === projectId
                        ? { ...p, members: p.members.filter((m) => m.id !== memberId) }
                        : p
                )
            );
        },
        [save]
    );

    const updateMemberRole = useCallback(
        (projectId: string, memberId: string, role: ProjectRole) => {
            save((prev) =>
                prev.map((p) =>
                    p.id === projectId
                        ? { ...p, members: p.members.map((m) => (m.id === memberId ? { ...m, role } : m)) }
                        : p
                )
            );
        },
        [save]
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
