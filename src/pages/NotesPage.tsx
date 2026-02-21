import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    StickyNote, Plus, Trash2, Search, Pin, PinOff,
    FileText, FolderKanban, Clock, Sparkles, X, Check,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useProjectData } from "@/components/ProjectDataContext";
import { sanitizeInput, sanitizeHtml } from "@/lib/sanitize";
import type { StandaloneNote } from "@/types";

/* ─── Constants ────────────────────────────────────── */
const STORAGE_KEY = "stride_standalone_notes";
const NOTE_COLORS = [
    { id: "none", label: "None", class: "" },
    { id: "blue", label: "Blue", class: "border-l-blue-500" },
    { id: "emerald", label: "Green", class: "border-l-emerald-500" },
    { id: "amber", label: "Amber", class: "border-l-amber-500" },
    { id: "rose", label: "Rose", class: "border-l-rose-500" },
    { id: "violet", label: "Violet", class: "border-l-violet-500" },
];

/* ─── Persistence helpers ──────────────────────────── */
function loadNotes(): StandaloneNote[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveNotes(notes: StandaloneNote[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/* ─── Time-ago helper ──────────────────────────────── */
function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

/* ─── Animation presets ────────────────────────────── */
const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

/* ═══════════════════════════════════════════════════════
   NotesPage — Standalone Notion-like Workspace
   ═══════════════════════════════════════════════════════ */
export default function NotesPage() {
    const { user } = useAuth();
    const { projects } = useProjectData();

    const [notes, setNotes] = useState<StandaloneNote[]>(loadNotes);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterProject, setFilterProject] = useState<string | "all">("all");
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Persist on every change
    useEffect(() => { saveNotes(notes); }, [notes]);

    // ── Selected note ─────────────────────────────
    const selectedNote = useMemo(
        () => notes.find((n) => n.id === selectedId) ?? null,
        [notes, selectedId],
    );

    // ── Filtered + sorted list ────────────────────
    const filteredNotes = useMemo(() => {
        let list = [...notes];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (n) =>
                    n.title.toLowerCase().includes(q) ||
                    n.content.toLowerCase().includes(q),
            );
        }
        if (filterProject !== "all") {
            list = list.filter((n) =>
                filterProject === "standalone" ? !n.projectId : n.projectId === filterProject,
            );
        }
        // Pinned first, then most-recently updated
        return list.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.updatedAt - a.updatedAt;
        });
    }, [notes, search, filterProject]);

    // ── CRUD ──────────────────────────────────────
    const createNote = useCallback(() => {
        if (!user) return;
        const initials = user.fullName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";
        const now = Date.now();
        const newNote: StandaloneNote = {
            id: `note_${now}_${Math.random().toString(36).slice(2, 8)}`,
            title: "",
            content: "",
            authorName: user.fullName || "Unknown",
            authorInitials: initials,
            createdAt: now,
            updatedAt: now,
        };
        setNotes((prev) => [newNote, ...prev]);
        setSelectedId(newNote.id);
        // Focus title after render
        setTimeout(() => titleRef.current?.focus(), 80);
    }, [user]);

    const updateNote = useCallback(
        (id: string, patch: Partial<StandaloneNote>) => {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
                ),
            );
        },
        [],
    );

    const deleteNote = useCallback(
        (id: string) => {
            setNotes((prev) => prev.filter((n) => n.id !== id));
            if (selectedId === id) setSelectedId(null);
        },
        [selectedId],
    );

    const togglePin = useCallback(
        (id: string) => {
            updateNote(id, { pinned: !notes.find((n) => n.id === id)?.pinned });
        },
        [notes, updateNote],
    );

    // ── Save handler (sanitise content) ───────────
    const handleContentBlur = useCallback(() => {
        if (!selectedNote) return;
        const rawContent = contentRef.current?.value ?? "";
        // sanitizeHtml preserves safe formatting, strips XSS
        const safeContent = sanitizeHtml(rawContent);
        updateNote(selectedNote.id, { content: safeContent });
    }, [selectedNote, updateNote]);

    const handleTitleBlur = useCallback(() => {
        if (!selectedNote) return;
        const rawTitle = titleRef.current?.value ?? "";
        updateNote(selectedNote.id, { title: sanitizeInput(rawTitle) });
    }, [selectedNote, updateNote]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
            {/* ═══════════════════════════════════════════
               LEFT: Notes Sidebar/List
               ═══════════════════════════════════════════ */}
            <motion.aside
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="
                    w-full lg:w-80 shrink-0
                    rounded-[1.5rem] overflow-hidden
                    bg-white/[0.55] dark:bg-white/[0.025]
                    backdrop-blur-lg
                    border border-black/[0.06] dark:border-white/[0.06]
                    shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
                    flex flex-col
                "
            >
                {/* Sidebar header */}
                <div className="p-4 pb-3 border-b border-border/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <StickyNote className="w-4 h-4 text-white/90" />
                            </div>
                            <h2 className="text-sm font-bold tracking-tight">Notes</h2>
                            <span className="text-[11px] text-muted-foreground/60">
                                ({notes.length})
                            </span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={createNote}
                            className="
                                w-8 h-8 rounded-lg bg-primary/10 text-primary
                                grid place-items-center hover:bg-primary/20
                                transition-colors
                            "
                            aria-label="New note"
                        >
                            <Plus className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search notes…"
                            className="
                                w-full h-8 pl-8 pr-3 rounded-lg text-xs
                                bg-foreground/[0.03] dark:bg-white/[0.04]
                                border border-border/30
                                placeholder:text-muted-foreground/40
                                focus:outline-none focus:ring-1 focus:ring-primary/30
                                transition-all
                            "
                        />
                    </div>

                    {/* Project filter */}
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="
                            w-full mt-2 h-8 px-3 rounded-lg text-xs
                            bg-foreground/[0.03] dark:bg-white/[0.04]
                            border border-border/30 text-foreground
                            focus:outline-none focus:ring-1 focus:ring-primary/30
                        "
                    >
                        <option value="all">All Notes</option>
                        <option value="standalone">Standalone Only</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Note list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <AnimatePresence>
                        {filteredNotes.length === 0 && (
                            <motion.div
                                {...fadeUp}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <FileText className="w-8 h-8 text-muted-foreground/20 mb-3" />
                                <p className="text-xs text-muted-foreground/50">
                                    {search ? "No notes match your search" : "No notes yet"}
                                </p>
                                {!search && (
                                    <button
                                        onClick={createNote}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Create your first note
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {filteredNotes.map((note) => {
                            const isActive = selectedId === note.id;
                            const colorClass = NOTE_COLORS.find((c) => c.id === note.color)?.class ?? "";
                            const linkedProject = note.projectId
                                ? projects.find((p) => p.id === note.projectId)
                                : null;

                            return (
                                <motion.button
                                    key={note.id}
                                    {...fadeUp}
                                    onClick={() => setSelectedId(note.id)}
                                    className={`
                                        w-full text-left p-3 rounded-xl transition-all duration-150
                                        border-l-[3px] ${colorClass || "border-l-transparent"}
                                        ${isActive
                                            ? "bg-primary/8 dark:bg-primary/10 ring-1 ring-primary/20"
                                            : "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[13px] font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                                                {note.title || "Untitled"}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                                                {note.content?.replace(/<[^>]*>/g, "").slice(0, 80) || "Empty note"}
                                            </p>
                                        </div>
                                        {note.pinned && (
                                            <Pin className="w-3 h-3 text-primary/60 flex-shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] text-muted-foreground/40">
                                            {timeAgo(note.updatedAt)}
                                        </span>
                                        {linkedProject && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40">
                                                <FolderKanban className="w-2.5 h-2.5" />
                                                {linkedProject.name}
                                            </span>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* ═══════════════════════════════════════════
               RIGHT: Note Editor
               ═══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="
                    flex-1 rounded-[1.5rem] overflow-hidden
                    bg-white/[0.55] dark:bg-white/[0.025]
                    backdrop-blur-lg
                    border border-black/[0.06] dark:border-white/[0.06]
                    shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
                    flex flex-col
                "
            >
                {selectedNote ? (
                    <>
                        {/* Editor toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/30">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-primary">{selectedNote.authorInitials}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-muted-foreground/50">
                                        by {selectedNote.authorName} · {timeAgo(selectedNote.updatedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {/* Color picker */}
                                <div className="flex items-center gap-1 mr-2">
                                    {NOTE_COLORS.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => updateNote(selectedNote.id, { color: c.id === "none" ? undefined : c.id })}
                                            className={`
                                                w-6 h-6 rounded-full border transition-all
                                                ${c.id === "none"
                                                    ? "bg-muted/30 border-border/50"
                                                    : `bg-${c.id}-500/60 border-${c.id}-500/80`
                                                }
                                                ${(selectedNote.color || "none") === c.id
                                                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110"
                                                    : "hover:scale-110"
                                                }
                                            `}
                                            title={c.label}
                                        />
                                    ))}
                                </div>

                                {/* Project link */}
                                <select
                                    value={selectedNote.projectId || ""}
                                    onChange={(e) => updateNote(selectedNote.id, { projectId: e.target.value || undefined })}
                                    className="
                                        h-8 px-2 rounded-lg text-[11px]
                                        bg-foreground/[0.03] dark:bg-white/[0.04]
                                        border border-border/30 text-foreground
                                        focus:outline-none focus:ring-1 focus:ring-primary/30
                                    "
                                    title="Link to project"
                                >
                                    <option value="">No project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                {/* Pin */}
                                <button
                                    onClick={() => togglePin(selectedNote.id)}
                                    className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                    title={selectedNote.pinned ? "Unpin" : "Pin"}
                                >
                                    {selectedNote.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => deleteNote(selectedNote.id)}
                                    className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                    title="Delete note"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="px-6 pt-5">
                            <input
                                ref={titleRef}
                                key={`title-${selectedNote.id}`}
                                defaultValue={selectedNote.title}
                                onBlur={handleTitleBlur}
                                placeholder="Untitled note…"
                                className="
                                    w-full text-2xl font-bold tracking-tight bg-transparent
                                    placeholder:text-muted-foreground/30
                                    outline-none border-none
                                "
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 px-6 pt-3 pb-6">
                            <textarea
                                ref={contentRef}
                                key={`content-${selectedNote.id}`}
                                defaultValue={selectedNote.content}
                                onBlur={handleContentBlur}
                                placeholder="Start writing… (supports plain text — HTML is sanitised for security)"
                                className="
                                    w-full h-full min-h-[200px] resize-none
                                    text-sm leading-relaxed text-foreground/80
                                    bg-transparent placeholder:text-muted-foreground/25
                                    outline-none border-none
                                "
                            />
                        </div>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-5">
                                <Sparkles className="w-7 h-7 text-amber-500/60" />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight mb-2">
                                Your Notes Workspace
                            </h3>
                            <p className="text-sm text-muted-foreground/60 max-w-xs mb-5 leading-relaxed">
                                Select a note from the sidebar or create a new one to start writing.
                                Link notes to projects for better organisation.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={createNote}
                                className="
                                    inline-flex items-center gap-2 px-5 h-10 rounded-xl
                                    bg-primary text-primary-foreground text-sm font-semibold
                                    shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                                    transition-shadow
                                "
                            >
                                <Plus className="w-4 h-4" />
                                New Note
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
