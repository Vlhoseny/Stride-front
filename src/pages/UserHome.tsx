import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FolderKanban,
    Plus,
    ArrowRight,
    CalendarClock,
    BarChart3,
    Sparkles,
    Sun,
    Moon,
    StickyNote,
    Timer,
    Play,
    Pause,
    RotateCcw,
    Zap,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useProjectData } from "@/components/ProjectDataContext";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";
import { FocusTimerProvider, useFocusTimer, PRODUCTIVITY_METHODS, MODE_LABELS } from "@/components/FocusTimerContext";
import type { StandaloneNote, Task } from "@/types";

/* ─── Animation presets ─────────────────────────────── */
const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.07 } },
};

/* ─── Greeting helper ───────────────────────────────── */
function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

/* ─── Quick Action Card ─────────────────────────────── */
function QuickAction({
    icon: Icon,
    gradient,
    title,
    description,
    onClick,
    delay = 0,
}: {
    icon: React.ElementType;
    gradient: string;
    title: string;
    description: string;
    onClick: () => void;
    delay?: number;
}) {
    return (
        <motion.button
            {...fadeUp}
            transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="
        group relative text-left p-6 rounded-[1.5rem] overflow-hidden
        bg-white/[0.55] dark:bg-white/[0.025]
        backdrop-blur-lg
        border border-black/[0.06] dark:border-white/[0.06]
        shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]
        transition-shadow duration-200 w-full
      "
        >
            <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}
            >
                <Icon className="w-5 h-5 text-white/90" />
            </div>
            <h3 className="text-[15px] font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
                {description}
            </p>
            <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </motion.button>
    );
}

/* ─── Widget Card (placeholder) ─────────────────────── */
function WidgetCard({
    icon: Icon,
    gradient,
    title,
    children,
    delay = 0,
}: {
    icon: React.ElementType;
    gradient: string;
    title: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            {...fadeUp}
            transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="
        relative p-6 rounded-[1.5rem] overflow-hidden
        bg-white/[0.55] dark:bg-white/[0.025]
        backdrop-blur-lg
        border border-black/[0.06] dark:border-white/[0.06]
        shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
      "
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
                >
                    <Icon className="w-4 h-4 text-white/90" />
                </div>
                <h3 className="text-sm font-bold tracking-tight">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

/* ─── Helpers: load real data from localStorage ─────── */
function loadStandaloneNotes(): StandaloneNote[] {
    try {
        const raw = localStorage.getItem("stride_standalone_notes");
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function loadAllTasks(projectIds: string[]): { projectId: string; projectName: string; task: Task }[] {
    const results: { projectId: string; projectName: string; task: Task }[] = [];
    for (const pid of projectIds) {
        try {
            const raw = localStorage.getItem("stride_tasks_" + pid);
            if (!raw) continue;
            const cols = JSON.parse(raw);
            if (!Array.isArray(cols)) continue;
            for (const col of cols) {
                if (!Array.isArray(col.tasks)) continue;
                for (const t of col.tasks) {
                    results.push({ projectId: pid, projectName: pid, task: t });
                }
            }
        } catch { /* skip corrupt data */ }
    }
    return results;
}

/* ─── Embedded mini Focus Timer widget ─────────────── */
function MiniTimer() {
    const timer = useFocusTimer();
    const { mode, status, timeLeft, method, durations } = timer;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const total = durations[mode];
    const pct = total > 0 ? ((total - timeLeft) / total) * 100 : 0;
    const cfg = PRODUCTIVITY_METHODS[method];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider">
                    {cfg.label} · {MODE_LABELS[mode]}
                </span>
                <span className="text-[10px] text-muted-foreground/50">{cfg.description}</span>
            </div>

            {/* Circular-ish progress + time */}
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                        <circle
                            cx="32" cy="32" r="28" fill="none" strokeWidth="3"
                            className="text-primary transition-all duration-500"
                            strokeDasharray={Math.PI * 56}
                            strokeDashoffset={Math.PI * 56 * (1 - pct / 100)}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold tabular-nums">
                            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {status === "running" ? (
                        <button
                            onClick={timer.pause}
                            className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center hover:bg-primary/20 transition-colors"
                        >
                            <Pause className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (status === "idle") timer.openTimer("Focus Session");
                                timer.play();
                            }}
                            className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center hover:bg-primary/20 transition-colors"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={timer.reset}
                        className="w-9 h-9 rounded-xl bg-muted/30 text-muted-foreground grid place-items-center hover:bg-muted/50 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Mode selector */}
            <div className="flex gap-1.5">
                {(["focus", "short-break", "long-break"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => timer.setMode(m)}
                        className={`
                            flex-1 h-7 rounded-lg text-[10px] font-semibold transition-all
                            ${mode === m
                                ? "bg-primary/15 text-primary"
                                : "bg-foreground/[0.03] text-muted-foreground/60 hover:text-muted-foreground"
                            }
                        `}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   UserHome — The Command Center (with FocusTimer wrapper)
   ═══════════════════════════════════════════════════════ */
export default function UserHome() {
    return (
        <FocusTimerProvider>
            <UserHomeInner />
        </FocusTimerProvider>
    );
}

function UserHomeInner() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects } = useProjectData();
    const { theme, toggleTheme } = useTheme();

    const firstName = user?.fullName?.split(" ")[0] || "there";
    const activeCount = projects.filter((p) => p.status !== "completed").length;
    const completedCount = projects.filter((p) => p.status === "completed").length;

    // ── Load real standalone notes ─────────────────
    const [recentNotes, setRecentNotes] = useState<StandaloneNote[]>([]);
    useEffect(() => {
        const notes = loadStandaloneNotes()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 4);
        setRecentNotes(notes);
    }, []);

    // ── Real tasks due today ──────────────────────
    const todayTasks = useMemo(() => {
        const projectIds = projects.map((p) => p.id);
        const allTasks = loadAllTasks(projectIds);
        const todayStr = new Date().toDateString();

        // Map project names properly
        const projectMap = new Map(projects.map((p) => [p.id, p.name]));

        return allTasks
            .map((t) => ({ ...t, projectName: projectMap.get(t.projectId) || t.projectId }))
            .filter((t) => {
                if (t.task.done) return false;
                if (t.task.dueDate) {
                    return new Date(t.task.dueDate).toDateString() === todayStr;
                }
                return false;
            })
            .slice(0, 5);
    }, [projects]);

    // ── Active sprints (non-completed projects) ───
    const activeSprints = useMemo(
        () => projects.filter((p) => p.status !== "completed").slice(0, 4),
        [projects],
    );

    return (
        <div
            className={`min-h-screen ${theme === "dark" ? "mesh-gradient-dark" : "mesh-gradient-light"
                }`}
        >
            {/* ── Nav Bar ─────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div
                        className="flex items-center justify-between h-14 mt-3 px-4 rounded-2xl
              bg-background/70 backdrop-blur-lg
              border border-border/50
              shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_12px_rgba(0,0,0,0.04)]
              dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                    >
                        <Link to="/home" className="flex items-center gap-2.5">
                            <img
                                src="/stride-logo.webp"
                                alt="STRIDE"
                                className="w-7 h-7 object-contain"
                            />
                            <span className="text-[15px] font-extrabold tracking-tight">
                                STRIDE
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-4 h-4" />
                                ) : (
                                    <Moon className="w-4 h-4" />
                                )}
                            </button>
                            <Link
                                to="/profile"
                                className="h-8 px-4 rounded-lg text-[13px] font-medium inline-flex items-center gap-1.5
                  bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]
                  transition-all duration-150"
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Content ─────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        {getGreeting()},{" "}
                        <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                            {firstName}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-[15px]">
                        Here&apos;s your command center. What would you like to work on?
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.section {...stagger} initial="initial" animate="animate" className="mb-10">
                    <motion.p
                        {...fadeUp}
                        className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-4"
                    >
                        Quick Actions
                    </motion.p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <QuickAction
                            icon={FolderKanban}
                            gradient="from-indigo-500 to-violet-600"
                            title="Go to Project Dashboard"
                            description="View all your projects, sprints, and task boards."
                            onClick={() => navigate("/dashboard")}
                            delay={0.05}
                        />
                        <QuickAction
                            icon={Plus}
                            gradient="from-emerald-500 to-teal-600"
                            title="Create New Project"
                            description="Start a fresh project with tasks and timelines."
                            onClick={() => navigate("/dashboard?action=create")}
                            delay={0.1}
                        />
                        <QuickAction
                            icon={StickyNote}
                            gradient="from-amber-500 to-orange-600"
                            title="Open Notes"
                            description="Your Notion-like workspace for ideas and notes."
                            onClick={() => navigate("/notes")}
                            delay={0.15}
                        />
                    </div>
                </motion.section>

                {/* ── Widget Area — 2×2 grid ──────────────── */}
                <motion.section {...stagger} initial="initial" animate="animate">
                    <motion.p
                        {...fadeUp}
                        className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-4"
                    >
                        Overview
                    </motion.p>
                    <div className="grid sm:grid-cols-2 gap-4">

                        {/* ── Focus Timer Widget ───────────── */}
                        <WidgetCard
                            icon={Timer}
                            gradient="from-violet-500 to-purple-600"
                            title="Focus Timer"
                            delay={0.15}
                        >
                            <MiniTimer />
                        </WidgetCard>

                        {/* ── Tasks Due Today Widget ───────── */}
                        <WidgetCard
                            icon={CalendarClock}
                            gradient="from-amber-500 to-orange-600"
                            title="Due Today"
                            delay={0.2}
                        >
                            <div className="space-y-2">
                                {todayTasks.length === 0 ? (
                                    <div className="flex flex-col items-center py-4 text-center">
                                        <Zap className="w-5 h-5 text-emerald-500/40 mb-1.5" />
                                        <p className="text-[11px] text-muted-foreground/50">
                                            All clear — no tasks due today!
                                        </p>
                                    </div>
                                ) : (
                                    todayTasks.map((t, i) => (
                                        <div
                                            key={t.task.id}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/60 dark:bg-white/[0.03] border border-border/40"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.task.priority === "critical" ? "bg-rose-500"
                                                : t.task.priority === "high" ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] text-foreground/70 truncate">{t.task.title}</p>
                                                <p className="text-[10px] text-muted-foreground/40 truncate">{t.projectName}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {todayTasks.length > 0 && (
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full text-center text-[10px] text-primary hover:underline pt-1"
                                    >
                                        View all in Dashboard →
                                    </button>
                                )}
                            </div>
                        </WidgetCard>

                        {/* ── Recent Notes Widget ──────────── */}
                        <WidgetCard
                            icon={StickyNote}
                            gradient="from-sky-500 to-blue-600"
                            title="Recent Notes"
                            delay={0.25}
                        >
                            <div className="space-y-2">
                                {recentNotes.length === 0 ? (
                                    <div className="flex flex-col items-center py-4 text-center">
                                        <StickyNote className="w-5 h-5 text-muted-foreground/20 mb-1.5" />
                                        <p className="text-[11px] text-muted-foreground/50">No notes yet</p>
                                        <button
                                            onClick={() => navigate("/notes")}
                                            className="mt-1 text-[10px] text-primary hover:underline"
                                        >
                                            Create your first note
                                        </button>
                                    </div>
                                ) : (
                                    recentNotes.map((note) => (
                                        <button
                                            key={note.id}
                                            onClick={() => navigate("/notes")}
                                            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/60 dark:bg-white/[0.03] border border-border/40 hover:bg-background/80 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[8px] font-bold text-primary">{note.authorInitials}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-medium text-foreground/70 truncate">{note.title || "Untitled"}</p>
                                                <p className="text-[10px] text-muted-foreground/40 truncate">
                                                    {note.content?.replace(/<[^>]*>/g, "").slice(0, 60) || "Empty note"}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                                {recentNotes.length > 0 && (
                                    <button
                                        onClick={() => navigate("/notes")}
                                        className="w-full text-center text-[10px] text-primary hover:underline pt-1"
                                    >
                                        Open Notes Workspace →
                                    </button>
                                )}
                            </div>
                        </WidgetCard>

                        {/* ── Active Sprints Widget ────────── */}
                        <WidgetCard
                            icon={BarChart3}
                            gradient="from-emerald-500 to-teal-600"
                            title={`Active Projects (${activeCount})`}
                            delay={0.3}
                        >
                            <div className="space-y-2.5">
                                {activeSprints.length === 0 ? (
                                    <div className="flex flex-col items-center py-4 text-center">
                                        <Sparkles className="w-5 h-5 text-muted-foreground/20 mb-1.5" />
                                        <p className="text-[11px] text-muted-foreground/50">No active projects</p>
                                        <button
                                            onClick={() => navigate("/dashboard?action=create")}
                                            className="mt-1 text-[10px] text-primary hover:underline"
                                        >
                                            Create a project
                                        </button>
                                    </div>
                                ) : (
                                    activeSprints.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => navigate("/dashboard")}
                                            className="w-full text-left px-3 py-2.5 rounded-xl bg-background/60 dark:bg-white/[0.03] border border-border/40 hover:bg-background/80 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[12px] font-semibold text-foreground/80 truncate">{project.name}</p>
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${project.status === "on-track"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                    }`}>
                                                    {project.status === "on-track" ? "On Track" : "Delayed"}
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full bg-primary/70"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(project.progress, 100)}%` }}
                                                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/40 mt-1">
                                                {project.progress}% complete · {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                                            </p>
                                        </button>
                                    ))
                                )}
                                {activeCount > 4 && (
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full text-center text-[10px] text-primary hover:underline pt-1"
                                    >
                                        +{activeCount - 4} more projects →
                                    </button>
                                )}
                            </div>
                        </WidgetCard>

                    </div>
                </motion.section>
            </div>
        </div>
    );
}
