import { useState, useId, useEffect, lazy, Suspense } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Layers,
  Rocket,
  Sparkles,
  Palette,
  Shield,
  Plus,
  Zap,
  Globe,
  Code,
  Database,
  Terminal as TerminalIcon,
  Star,
  Heart,
  Users,
  User,
  Settings,
  LayoutGrid,
  Kanban,
  FileText,
  CalendarDays,
} from "lucide-react";
import { useProjectData, type Project as ProjectData, type ProjectStatus } from "./ProjectDataContext";
import CreateProjectModal from "./CreateProjectModal";
import { useCommandPalette } from "./CommandPalette";
import { AlertTriangle } from "lucide-react";

// ── Global project limit ───────────────────────────────
const MAX_TOTAL_PROJECTS = 4;

// Lazy-load Simple-mode tab components
const SimpleBoard = lazy(() => import("./SimpleBoard"));
const SimpleNotes = lazy(() => import("./SimpleNotes"));
const SimpleCalendar = lazy(() => import("./SimpleCalendar"));

// ── View mode types ────────────────────────────────────
type ViewMode = "simple" | "advanced";
type SimpleTab = "board" | "notes" | "calendar";

const SIMPLE_TABS: { key: SimpleTab; label: string; icon: React.ElementType }[] = [
  { key: "board", label: "Board", icon: Kanban },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

const MODE_STORAGE_KEY = "stride-dashboard-view-mode";
const TAB_STORAGE_KEY = "stride-dashboard-simple-tab";

function loadMode(): ViewMode {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY);
    return v === "simple" || v === "advanced" ? v : "advanced";
  } catch { return "advanced"; }
}

function loadTab(): SimpleTab {
  try {
    const v = localStorage.getItem(TAB_STORAGE_KEY);
    return v === "board" || v === "notes" || v === "calendar" ? v : "board";
  } catch { return "board"; }
}

// ── Icon map (shared) ──────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Palette, Layers, Rocket, Sparkles, Shield, Zap, Globe,
  Code, Database, Terminal: TerminalIcon, Star, Heart,
};

// ── Status Tag ─────────────────────────────────────────
const STATUS_STYLES: Record<ProjectStatus, { light: string; dark: string; label: string }> = {
  "on-track": {
    light: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700",
    dark: "bg-transparent ring-1 ring-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    label: "On Track",
  },
  delayed: {
    light: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700",
    dark: "bg-transparent ring-1 ring-rose-400/60 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
    label: "Delayed",
  },
  completed: {
    light: "bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700",
    dark: "bg-transparent ring-1 ring-indigo-400/60 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]",
    label: "Completed",
  },
};

function StatusTag({ status }: { status: ProjectStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <>
      <span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold ${s.light} dark:hidden`}>{s.label}</span>
      <span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold hidden dark:inline-flex ${s.dark}`}>{s.label}</span>
    </>
  );
}

// ── SVG Progress Ring ──────────────────────────────────
function ProgressRing({ progress, size = 64, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const gradId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/[0.06] dark:text-white/[0.08]"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-mono text-foreground tracking-tight">
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ── Stacked Avatars ────────────────────────────────────
function StackedAvatars({ members }: { members: { initials: string; color: string }[] }) {
  const show = members.slice(0, 4);
  const extra = members.length - 4;

  return (
    <div className="flex -space-x-2">
      {show.map((m, i) => (
        <div
          key={i}
          className={`
            w-7 h-7 rounded-full flex items-center justify-center
            text-[9px] font-bold text-white
            ring-2 ring-background
            ${m.color}
          `}
          style={{ zIndex: show.length - i }}
        >
          {m.initials}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="
            w-7 h-7 rounded-full flex items-center justify-center
            text-[9px] font-bold text-muted-foreground
            bg-foreground/[0.06] dark:bg-white/[0.08]
            ring-2 ring-background
          "
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

// ── Animation Variants ─────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

// ── Project Card ───────────────────────────────────────
function ProjectCard({
  project,
  onSelect,
  onOpenSettings,
}: {
  project: ProjectData;
  onSelect: (id: string) => void;
  onOpenSettings?: (id: string) => void;
}) {
  const Icon = ICON_MAP[project.iconName] || Layers;

  return (
    <motion.div
      variants={cardVariants}
      layoutId={`project-card-${project.id}`}
      onClick={() => onSelect(project.id)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="
        rounded-[2.5rem] p-6 cursor-pointer select-none relative
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_8px_24px_-8px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.4)]
        dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)]
        transition-shadow duration-500
        flex flex-col gap-5
      "
    >
      {/* Top: Icon + Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-primary/10 dark:bg-primary/15
            shadow-[0_0_20px_rgba(99,102,241,0.15)]
            dark:shadow-[0_0_20px_rgba(99,102,241,0.25)]
          ">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${project.mode === "solo" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"}`}>
            {project.mode === "solo" ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            {project.mode}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusTag status={project.status} />
          {onOpenSettings && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onOpenSettings(project.id); }}
              className="
                w-7 h-7 rounded-full flex items-center justify-center
                bg-foreground/[0.04] dark:bg-white/[0.06]
                hover:bg-foreground/[0.08] dark:hover:bg-white/[0.1]
                text-muted-foreground hover:text-foreground
                ring-1 ring-foreground/[0.06] dark:ring-white/[0.08]
                transition-all duration-200
              "
              title="Project Settings"
            >
              <Settings className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Title + Description */}
      <div className="flex-1">
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1 stealth-blur">
          {project.name}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 stealth-blur">
          {project.description}
        </p>
      </div>

      {/* Bottom: Progress Ring + Avatars */}
      <div className="flex items-end justify-between">
        <StackedAvatars members={project.members} />
        <ProgressRing progress={project.progress} />
      </div>
    </motion.div>
  );
}

// ── Create New Card ────────────────────────────────────
function CreateProjectCard({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={disabled ? undefined : { scale: 1.03, y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={`
        rounded-[2.5rem] p-6 select-none
        flex flex-col items-center justify-center gap-4
        min-h-[260px]
        border-2 border-dashed
        backdrop-blur-xl
        group transition-all duration-500
        ${disabled
          ? "border-foreground/[0.04] dark:border-white/[0.04] bg-foreground/[0.01] dark:bg-white/[0.005] cursor-not-allowed opacity-50"
          : "border-foreground/[0.08] dark:border-white/[0.08] bg-foreground/[0.01] dark:bg-white/[0.01] cursor-pointer hover:border-primary/30 dark:hover:border-primary/40"
        }
      `}
    >
      <motion.div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          bg-foreground/[0.03] dark:bg-white/[0.04]
          ${disabled ? "" : "group-hover:bg-primary/10 dark:group-hover:bg-primary/15 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"}
          transition-all duration-500
        `}
      >
        <Plus className={`w-7 h-7 ${disabled ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-primary"} transition-colors duration-300`} />
      </motion.div>
      <div className="text-center">
        <h3 className={`text-sm font-bold tracking-tight ${disabled ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-foreground"} transition-colors duration-300`}>
          {disabled ? "Limit Reached" : "New Project"}
        </h3>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {disabled ? `Maximum of ${MAX_TOTAL_PROJECTS} projects` : "Start from scratch"}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────
interface ProjectDashboardProps {
  onSelectProject: (id: string) => void;
  onOpenSettings?: (projectId: string) => void;
}

// ── Filter types ───────────────────────────────────────
type FilterType = "all" | "solo" | "team";

const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Projects", icon: Layers },
  { key: "solo", label: "Solo", icon: User },
  { key: "team", label: "Team", icon: Users },
];

const EMPTY_MESSAGES: Record<FilterType, { title: string; description: string }> = {
  all: {
    title: "Start your first project",
    description: "Organize tasks, track progress, and collaborate with your team — all in one place.",
  },
  solo: {
    title: "No solo projects found",
    description: "Create a solo project to start tracking your personal tasks and goals.",
  },
  team: {
    title: "No team projects found",
    description: "Create a team project to collaborate with others and manage shared goals.",
  },
};

export default function ProjectDashboard({ onSelectProject, onOpenSettings }: ProjectDashboardProps) {
  const { projects } = useProjectData();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const { pendingAction, clearPendingAction } = useCommandPalette();

  // View-mode state (persisted)
  const [viewMode, setViewMode] = useState<ViewMode>(loadMode);
  const [simpleTab, setSimpleTab] = useState<SimpleTab>(loadTab);

  useEffect(() => { localStorage.setItem(MODE_STORAGE_KEY, viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem(TAB_STORAGE_KEY, simpleTab); }, [simpleTab]);

  // React to "create-project" command from palette
  useEffect(() => {
    if (pendingAction === "create-project") {
      setCreateOpen(true);
      clearPendingAction();
    }
  }, [pendingAction, clearPendingAction]);

  // ── Global limit ─────────────────────────────────────
  const totalProjects = projects.length;
  const limitReached = totalProjects >= MAX_TOTAL_PROJECTS;

  // ── Mode-aware filtering ─────────────────────────────
  // Projects whose viewMode matches the active toggle
  const modeProjects = projects.filter(
    (p) => (p.viewMode ?? "advanced") === viewMode
  );

  // Advanced-mode solo/team sub-filter
  const filteredProjects = filterType === "all"
    ? modeProjects
    : modeProjects.filter((p) => p.mode === filterType);

  const emptyMsg = EMPTY_MESSAGES[filterType];

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* Header + Mode Toggle */}
        <motion.div variants={cardVariants} className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">
              Projects
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {modeProjects.length
                ? `${modeProjects.length} project${modeProjects.length !== 1 ? "s" : ""} · Select one to open your workspace`
                : "No projects yet — create your first one below"}
            </p>
          </div>

          {/* Mode toggle pill */}
          <div
            className="
              inline-flex items-center gap-1 p-1 rounded-2xl self-start sm:self-auto
              bg-white/50 dark:bg-white/[0.04]
              backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/10
              shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]
            "
          >
            {([
              { key: "simple" as const, label: "Simple", icon: Kanban },
              { key: "advanced" as const, label: "Advanced", icon: LayoutGrid },
            ]).map(({ key, label, icon: MIcon }) => {
              const active = viewMode === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => setViewMode(key)}
                  whileTap={{ scale: 0.96 }}
                  className={`
                    relative px-3.5 py-1.5 rounded-xl text-[11px] font-semibold
                    flex items-center gap-1.5 transition-colors duration-200
                    ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-xl
                        bg-white dark:bg-white/[0.08]
                        shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                        ring-[0.5px] ring-black/[0.04] dark:ring-white/[0.06]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <MIcon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Limit Warning ─────────────────────────── */}
        {limitReached && (
          <motion.div
            variants={cardVariants}
            className="mb-5 md:mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl
              bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10
              ring-1 ring-amber-500/20 dark:ring-amber-400/20"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Maximum limit of {MAX_TOTAL_PROJECTS} projects reached
            </p>
            <span className="ml-auto text-[10px] font-mono tabular-nums text-amber-600/60 dark:text-amber-400/50">
              {totalProjects}/{MAX_TOTAL_PROJECTS}
            </span>
          </motion.div>
        )}

        {/* ── Simple Mode ─────────────────────────────── */}
        {viewMode === "simple" && (
          <>
            {/* Simple tab bar + Create button */}
            <motion.div variants={cardVariants} className="mb-5 md:mb-6 flex items-center justify-between gap-3 flex-wrap">
              <div
                className="
                  inline-flex items-center gap-1 p-1 rounded-2xl
                  bg-white/50 dark:bg-white/[0.04]
                  backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/10
                  shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]
                "
              >
                {SIMPLE_TABS.map(({ key, label, icon: TabIcon }) => {
                  const active = simpleTab === key;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => setSimpleTab(key)}
                      whileTap={{ scale: 0.96 }}
                      className={`
                        relative px-3.5 py-1.5 rounded-xl text-[11px] font-semibold
                        flex items-center gap-1.5 transition-colors duration-200
                        ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
                      `}
                    >
                      {active && (
                        <motion.div
                          layoutId="simple-tab"
                          className="absolute inset-0 rounded-xl
                            bg-white dark:bg-white/[0.08]
                            shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                            ring-[0.5px] ring-black/[0.04] dark:ring-white/[0.06]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <TabIcon className="w-3.5 h-3.5" />
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Simple-mode Create button */}
              <motion.button
                whileHover={limitReached ? undefined : { scale: 1.04 }}
                whileTap={limitReached ? undefined : { scale: 0.96 }}
                onClick={limitReached ? undefined : () => setCreateOpen(true)}
                disabled={limitReached}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[11px] font-semibold
                  transition-all duration-200
                  ${limitReached
                    ? "bg-foreground/[0.03] text-muted-foreground/40 cursor-not-allowed"
                    : "bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_12px_rgba(99,102,241,0.1)]"}
                `}
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </motion.button>
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={simpleTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20 text-xs text-muted-foreground/40">
                      Loading…
                    </div>
                  }
                >
                  {simpleTab === "board" && (
                    <SimpleBoard projects={modeProjects} onSelectProject={onSelectProject} />
                  )}
                  {simpleTab === "notes" && <SimpleNotes />}
                  {simpleTab === "calendar" && (
                    <SimpleCalendar projects={modeProjects} onSelectProject={onSelectProject} />
                  )}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* ── Advanced Mode (original view) ───────────── */}
        {viewMode === "advanced" && (
          <>
            {modeProjects.length > 0 && (
              <motion.div variants={cardVariants} className="mb-5 md:mb-6">
                <div className="inline-flex items-center gap-1 p-1 rounded-2xl
              bg-white/50 dark:bg-white/[0.04]
              backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/10
              shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
                >
                  {FILTER_OPTIONS.map(({ key, label, icon: FilterIcon }) => {
                    const isActive = filterType === key;
                    return (
                      <motion.button
                        key={key}
                        onClick={() => setFilterType(key)}
                        whileTap={{ scale: 0.96 }}
                        className={`
                      relative px-3.5 py-1.5 rounded-xl text-[11px] font-semibold
                      flex items-center gap-1.5 transition-colors duration-200
                      ${isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground/70"}
                    `}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="filter-pill"
                            className="absolute inset-0 rounded-xl
                          bg-white dark:bg-white/[0.08]
                          shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                          ring-[0.5px] ring-black/[0.04] dark:ring-white/[0.06]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <FilterIcon className="w-3.5 h-3.5" />
                          {label}
                          {key !== "all" && (
                            <span className={`text-[9px] tabular-nums ${isActive ? "text-foreground/50" : "text-muted-foreground/40"
                              }`}>
                              {modeProjects.filter((p) => p.mode === key).length}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center justify-center py-16 mb-8 rounded-[2.5rem]
              bg-white/30 dark:bg-white/[0.02]
              backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/10"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 dark:bg-primary/15 mb-5 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                  <Layers className="w-8 h-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-1">{emptyMsg.title}</h3>
                <p className="text-xs text-muted-foreground/60 mb-6 max-w-[260px] text-center leading-relaxed">
                  {emptyMsg.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCreateOpen(true)}
                  className="px-6 py-2.5 rounded-full btn-silk text-sm font-semibold shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                >
                  <Plus className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  Create Project
                </motion.button>
              </motion.div>
            )}

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={onSelectProject}
                  onOpenSettings={onOpenSettings}
                />
              ))}
              <CreateProjectCard onClick={() => setCreateOpen(true)} disabled={limitReached} />
            </div>
          </>
        )}
      </motion.div>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} defaultViewMode={viewMode} />
    </>
  );
}
