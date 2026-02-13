import { useState, useCallback, useId, useMemo, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
} from "framer-motion";
import { Plus, RotateCcw, Check, Lock } from "lucide-react";
import TaskDrawer, { type DrawerTask } from "./TaskDrawer";
import TaskContextMenu, { type ContextMenuAction, TEAM_MEMBERS } from "./TaskContextMenu";
import { useAuth } from "./AuthContext";
import { useProjectData, type ProjectRole, type ProjectMode, type ProjectMember as ProjectMemberType } from "./ProjectDataContext";
import { useCommandPalette } from "./CommandPalette";
import { sanitizeInput } from "@/lib/sanitize";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ──────────────────────────────────────────────
type Tag = { label: string; color: string };

type Task = {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  assignees: string[];
  done: boolean;
  rolledOver: boolean;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: Date;
};

type DayColumn = {
  date: Date;
  tasks: Task[];
};

// ── Seed data helper ───────────────────────────────────
function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function buildWeek(): DayColumn[] {
  const monday = getMondayOfWeek(new Date());

  const seedTasks: Record<number, Task[]> = {
    0: [
      { id: "1", title: "Design System Overhaul", description: "Rebuild the component library with new tokens.", tags: [{ label: "Design", color: "indigo" }, { label: "Priority", color: "rose" }], assignees: ["AK", "MJ"], done: false, rolledOver: false },
      { id: "2", title: "API Rate Limiting", description: "Implement throttling middleware for public endpoints.", tags: [{ label: "Backend", color: "emerald" }], assignees: ["MJ"], done: true, rolledOver: false },
    ],
    1: [
      { id: "3", title: "Onboarding Flow", description: "Create a step-by-step wizard for new users.", tags: [{ label: "UX", color: "amber" }, { label: "Feature", color: "sky" }], assignees: ["RL", "SC", "AK", "TW"], done: false, rolledOver: false },
    ],
    2: [
      { id: "4", title: "Real-time Notifications", description: "WebSocket-based live notification system.", tags: [{ label: "Feature", color: "sky" }, { label: "Backend", color: "emerald" }], assignees: ["SC", "MJ"], done: false, rolledOver: false },
      { id: "5", title: "Dark Mode Polish", description: "Fine-tune contrast ratios across all surfaces.", tags: [{ label: "Design", color: "indigo" }], assignees: ["AK"], done: false, rolledOver: true },
    ],
    3: [
      { id: "6", title: "Auth Integration", description: "OAuth 2.0 with Google and GitHub providers.", tags: [{ label: "Backend", color: "emerald" }, { label: "Security", color: "rose" }], assignees: ["MJ", "RL"], done: false, rolledOver: false },
    ],
    4: [
      { id: "7", title: "Landing Page", description: "Hero section with animated gradients and CTA.", tags: [{ label: "Design", color: "indigo" }], assignees: ["RL"], done: false, rolledOver: false },
    ],
    5: [],
    6: [],
  };

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { date, tasks: seedTasks[i] || [] };
  });
}

// ── Tag styles ─────────────────────────────────────────
const TAG_STYLES: Record<string, { light: string; dark: string }> = {
  indigo: {
    light: "bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700",
    dark: "bg-transparent ring-1 ring-indigo-400/60 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]",
  },
  rose: {
    light: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700",
    dark: "bg-transparent ring-1 ring-rose-400/60 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
  },
  emerald: {
    light: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700",
    dark: "bg-transparent ring-1 ring-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
  },
  amber: {
    light: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700",
    dark: "bg-transparent ring-1 ring-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
  },
  sky: {
    light: "bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700",
    dark: "bg-transparent ring-1 ring-sky-400/60 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)]",
  },
};

// ── Stacked Assignee Avatars ───────────────────────────
function StackedAssignees({ assignees, maxVisible = 3, size = "sm" }: { assignees: string[]; maxVisible?: number; size?: "sm" | "md" }) {
  if (assignees.length === 0) return null;
  const visible = assignees.slice(0, maxVisible);
  const extra = assignees.length - maxVisible;
  const dim = size === "sm" ? "w-6 h-6 text-[8px]" : "w-7 h-7 text-[9px]";
  const overlap = size === "sm" ? "-ml-2" : "-ml-2.5";

  return (
    <div className="flex items-center">
      <AnimatePresence>
        {visible.map((initials, idx) => {
          const member = TEAM_MEMBERS.find((m) => m.initials === initials);
          return (
            <motion.div
              key={initials}
              initial={{ opacity: 0, scale: 0.5, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
              className={`
                ${dim} rounded-full flex items-center justify-center font-bold text-white
                ${member?.color || "bg-primary"}
                ring-2 ring-white/80 dark:ring-black/60
                shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                ${idx > 0 ? overlap : ""}
              `}
              style={{ zIndex: maxVisible - idx }}
            >
              {initials}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {extra > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            ${dim} rounded-full flex items-center justify-center font-bold
            bg-foreground/[0.08] dark:bg-white/[0.1]
            text-muted-foreground
            ring-2 ring-white/80 dark:ring-black/60
            ${overlap}
          `}
          style={{ zIndex: 0 }}
        >
          +{extra}
        </motion.div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────
function TaskTag({ tag }: { tag: Tag }) {
  const s = TAG_STYLES[tag.color] || TAG_STYLES.indigo;
  return (
    <>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${s.light} dark:hidden`}>{tag.label}</span>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold hidden dark:inline-flex ${s.dark}`}>{tag.label}</span>
    </>
  );
}

// ── Static card renderer (used for overlay & display) ──
function TaskCardContent({ task }: { task: Task }) {
  return (
    <div className={`${task.done ? "opacity-60" : ""}`}>
      {task.rolledOver && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 flex items-center justify-center" title="Rolled over">
          <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </div>
      )}
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map((t) => <TaskTag key={t.label} tag={t} />)}
      </div>
      <h3 className={`stealth-blur font-bold tracking-tighter text-foreground text-[13px] mb-1 ${task.done ? "line-through decoration-2 decoration-primary/40" : ""}`}>
        {task.title}
      </h3>
      <p className={`stealth-blur text-[11px] text-muted-foreground leading-relaxed mb-3 ${task.done ? "line-through decoration-1 decoration-muted-foreground/30" : ""}`}>
        {task.description}
      </p>
    </div>
  );
}

// ── Sortable task card ─────────────────────────────────
function SortableTaskCard({
  task,
  onToggle,
  onClick,
  onContextMenu,
  readOnly,
  canToggle,
  hideAssignees,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  readOnly?: boolean;
  canToggle?: boolean;
  hideAssignees?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`
        rounded-[2rem] p-4 ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"} select-none relative
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
        shadow-[0_16px_48px_-12px_rgba(0,0,0,0.07),0_6px_20px_-6px_rgba(0,0,0,0.03)]
        dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5),0_0_24px_rgba(99,102,241,0.04)]
        transition-shadow duration-500
        touch-none
      `}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      onContextMenu={readOnly ? undefined : onContextMenu}
    >
      <div onClick={onClick}>
        <TaskCardContent task={task} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {!hideAssignees && <StackedAssignees assignees={task.assignees} maxVisible={3} size="sm" />}
        {hideAssignees && <div />}
        {(canToggle !== false) && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
              ${task.done
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                : "ring-1 ring-foreground/10 hover:ring-primary/40 hover:bg-primary/5"
              }
            `}
          >
            {task.done && <Check className="w-3 h-3" />}
          </button>
        )}
        {canToggle === false && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center ring-1 ring-foreground/5 text-muted-foreground/30">
            <Lock className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Drag Overlay Card ──────────────────────────────────
function DragOverlayCard({ task }: { task: Task }) {
  return (
    <div
      className="
        rounded-[2rem] p-4 select-none relative
        bg-white/80 dark:bg-white/[0.08]
        backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
        shadow-[0_24px_80px_-12px_rgba(99,102,241,0.25),0_12px_36px_-8px_rgba(0,0,0,0.15)]
        dark:shadow-[0_24px_80px_-12px_rgba(99,102,241,0.4),0_12px_36px_-8px_rgba(0,0,0,0.5)]
        rotate-[2deg] scale-105
        transition-all duration-150
      "
      style={{ maxWidth: 220 }}
    >
      <TaskCardContent task={task} />
      <div className="flex items-center justify-between">
        <StackedAssignees assignees={task.assignees} maxVisible={3} size="sm" />
      </div>
    </div>
  );
}

// ── Quick Add Input ────────────────────────────────────
function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
      setOpen(false);
    }
  };

  return (
    <div className="mt-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-2"
          >
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
              placeholder="Task title…"
              className="
                w-full px-4 py-2 rounded-2xl text-xs
                bg-white/40 dark:bg-white/[0.06]
                backdrop-blur-xl ring-1 ring-white/10
                text-foreground placeholder:text-muted-foreground
                outline-none focus:ring-primary/30
                transition-all duration-200
              "
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => (open ? submit() : setOpen(true))}
        className="
          w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl
          text-[10px] font-semibold text-muted-foreground
          bg-foreground/[0.03] dark:bg-white/[0.03]
          hover:bg-foreground/[0.06] dark:hover:bg-white/[0.06]
          ring-1 ring-white/10
          transition-all duration-200
        "
      >
        <Plus className="w-3 h-3" />
        {open ? "Save" : "Quick Add"}
      </motion.button>
    </div>
  );
}

// ── Droppable Day Column ───────────────────────────────
function DroppableDayColumn({
  columnId,
  children,
  isToday: today,
  day,
  dateStr,
  taskCount,
}: {
  columnId: string;
  children: React.ReactNode;
  isToday: boolean;
  day: string;
  dateStr: string;
  taskCount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <motion.div
      ref={setNodeRef}
      variants={colVariants}
      className={`
        flex flex-col gap-3 min-w-[200px] w-[75vw] sm:w-[45vw] md:w-auto md:min-w-0 snap-center rounded-[2rem] p-4
        backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
        transition-all duration-300 flex-shrink-0 md:flex-shrink
        ${today
          ? "bg-primary/[0.06] dark:bg-primary/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.08)]"
          : "bg-white/[0.05] dark:bg-black/[0.05]"
        }
        ${isOver
          ? "border-primary/30 bg-primary/[0.04] dark:bg-primary/[0.06] shadow-[0_0_40px_rgba(99,102,241,0.12)]"
          : ""
        }
      `}
    >
      {/* Day header */}
      <div className="px-1 mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {day.slice(0, 3)}
          </h2>
          {today && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          )}
          <div className="
            ml-auto w-5 h-5 rounded-full flex items-center justify-center
            text-[9px] font-bold text-muted-foreground
            bg-foreground/[0.04] dark:bg-white/[0.06]
            backdrop-blur-xl ring-1 ring-foreground/[0.06]
          ">
            {taskCount}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{dateStr}</p>
      </div>

      {children}
    </motion.div>
  );
}

// ── Empty State ────────────────────────────────────────
function EmptyDayState() {
  return (
    <div className="flex-1 flex items-center justify-center py-8">
      <p className="text-[11px] font-medium text-muted-foreground/25 dark:text-muted-foreground/20 blur-[0.5px] select-none italic">
        Rest Day
      </p>
    </div>
  );
}

// ── Day Names ──────────────────────────────────────────
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDayHeader(date: Date): { day: string; dateStr: string } {
  return {
    day: DAY_NAMES[date.getDay()],
    dateStr: `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`,
  };
}

function checkIsToday(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

// ── Container animations ───────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const colVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

// ── Helpers ────────────────────────────────────────────
function findColumnOfTask(columns: DayColumn[], taskId: string): number {
  return columns.findIndex((col) => col.tasks.some((t) => t.id === taskId));
}

// ── Task persistence per project (via service layer) ───
import { ProjectService } from "../api/projectService";

function loadProjectTasks(projectId: string): DayColumn[] | null {
  try {
    // Sync fallback for initial render — service is async but localStorage is instant
    const raw = localStorage.getItem("stride_tasks_" + projectId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((col: any) => ({
      ...col,
      date: new Date(col.date),
      tasks: Array.isArray(col.tasks) ? col.tasks : [],
    }));
  } catch {
    return null;
  }
}

function saveProjectTasks(projectId: string, columns: DayColumn[]) {
  // Fire-and-forget through the service layer (localStorage under the hood for now)
  ProjectService.saveTasks(projectId, columns).catch(() => {/* silent */ });
}

// ── Main Component ─────────────────────────────────────
export default function DailyFocusedView({ projectId, projectMode = "solo", projectMembers = [] }: { projectId?: string; projectMode?: ProjectMode; projectMembers?: ProjectMemberType[] }) {
  const { user } = useAuth();
  const { getMyRole } = useProjectData();

  // Determine current user's role in the project
  const myRole: ProjectRole | null = useMemo(() => {
    if (!projectId || !user?.email) return "owner"; // fallback: full access
    return getMyRole(projectId, user.email);
  }, [projectId, user?.email, getMyRole]);

  const isViewer = myRole === "viewer";
  const isEditor = myRole === "editor";
  const isFullAccess = myRole === "owner" || myRole === "admin";
  const isSolo = projectMode === "solo";

  // Get current user initials for filtering editor tasks
  const userInitials = useMemo(() => {
    if (!user?.fullName) return "";
    return user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }, [user?.fullName]);

  const [columns, setColumns] = useState<DayColumn[]>(() => {
    if (projectId) {
      const saved = loadProjectTasks(projectId);
      if (saved) return saved;
    }
    return buildWeek();
  });

  // Persist columns whenever they change
  useEffect(() => {
    if (projectId) saveProjectTasks(projectId, columns);
  }, [projectId, columns]);

  // Reset columns when switching projects
  useEffect(() => {
    if (!projectId) return;
    const saved = loadProjectTasks(projectId);
    setColumns(saved ?? buildWeek());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [contextMenuTaskId, setContextMenuTaskId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Command palette: auto-open a task drawer when navigating to a specific task
  const { pendingNav, clearPendingNav } = useCommandPalette();
  useEffect(() => {
    if (pendingNav?.taskId) {
      for (const col of columns) {
        const found = col.tasks.find((t) => t.id === pendingNav.taskId);
        if (found) {
          setDrawerTask(found);
          setDrawerOpen(true);
          clearPendingNav();
          return;
        }
      }
    }
  }, [pendingNav?.taskId, columns, clearPendingNav]);

  // For editors, filter tasks to only show assigned ones
  const visibleColumns = useMemo(() => {
    if (!isEditor || !userInitials) return columns;
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t.assignees.includes(userInitials)),
    }));
  }, [columns, isEditor, userInitials]);

  // Helper: check if a column index is within ±1 day of today
  const todayIdx = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return columns.findIndex((c) => c.date.getTime() === today.getTime());
  }, [columns]);

  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Rollover: move uncompleted tasks from past days to today
  const rollover = useCallback(() => {
    setColumns((prev) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIdx = prev.findIndex((c) => c.date.getTime() === today.getTime());
      if (todayIdx <= 0) return prev;

      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const migrated: Task[] = [];

      for (let i = 0; i < todayIdx; i++) {
        const remaining: Task[] = [];
        for (const t of next[i].tasks) {
          if (!t.done) {
            migrated.push({ ...t, rolledOver: true });
          } else {
            remaining.push(t);
          }
        }
        next[i].tasks = remaining;
      }

      next[todayIdx].tasks = [...migrated, ...next[todayIdx].tasks];
      return next;
    });
  }, []);

  const toggleTask = useCallback((dayIdx: number, taskId: string) => {
    setColumns((prev) => {
      const next = [...prev];
      next[dayIdx] = {
        ...next[dayIdx],
        tasks: next[dayIdx].tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
      };
      return next;
    });
  }, []);

  const addTask = useCallback((dayIdx: number, title: string) => {
    const safeTitle = sanitizeInput(title);
    if (!safeTitle) return;
    setColumns((prev) => {
      const next = [...prev];
      next[dayIdx] = {
        ...next[dayIdx],
        tasks: [
          ...next[dayIdx].tasks,
          {
            id: `task-${crypto.randomUUID().slice(0, 8)}`,
            title: safeTitle,
            description: "",
            tags: [],
            assignees: [],
            done: false,
            rolledOver: false,
          },
        ],
      };
      return next;
    });
  }, []);

  const openDrawer = useCallback((task: Task) => {
    setDrawerTask(task);
    setDrawerOpen(true);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    // Sanitize any string fields (title, description) before applying
    const sanitized: Partial<Task> = {};
    for (const [key, val] of Object.entries(updates)) {
      (sanitized as Record<string, unknown>)[key] =
        typeof val === "string" ? sanitizeInput(val) : val;
    }
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === id ? { ...t, ...sanitized } : t)),
      }))
    );
  }, []);

  const toggleTaskById = useCallback((id: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      }))
    );
  }, []);

  const handleCardContextMenu = useCallback((e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenuTaskId(taskId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const contextMenuActions: ContextMenuAction = {
    changeTag: (taskId, tag) => {
      if (isViewer || isEditor) return; // restricted
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const hasTag = t.tags.some((tt) => tt.label === tag.label);
            return {
              ...t,
              tags: hasTag
                ? t.tags.filter((tt) => tt.label !== tag.label)
                : [...t.tags, tag],
            };
          }),
        }))
      );
    },
    changeAssignee: (taskId, assigneeInitials) => {
      if (isViewer || isEditor) return; // restricted
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const has = t.assignees.includes(assigneeInitials);
            return {
              ...t,
              assignees: has
                ? t.assignees.filter((a) => a !== assigneeInitials)
                : [...t.assignees, assigneeInitials],
            };
          }),
        }))
      );
    },
    deleteTask: (taskId) => {
      if (isViewer || isEditor) return; // restricted
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }))
      );
    },
  };

  // ── DnD handlers ─────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (isViewer) return;
    const { active } = event;
    setColumns((prev) => {
      const colIdx = findColumnOfTask(prev, active.id as string);
      if (colIdx >= 0) {
        const task = prev[colIdx].tasks.find((t) => t.id === active.id);
        if (task) setActiveTask(task);
      }
      return prev; // no mutation
    });
  }, [isViewer]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (isViewer) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const activeColIdx = findColumnOfTask(prev, activeId);
      let overColIdx = prev.findIndex((_, i) => `day-${i}` === overId);
      if (overColIdx < 0) overColIdx = findColumnOfTask(prev, overId);

      if (activeColIdx < 0 || overColIdx < 0 || activeColIdx === overColIdx) return prev;

      // Editor restriction: only allow ±1 day from today
      if (isEditor && todayIdx >= 0) {
        const allowed = [todayIdx - 1, todayIdx, todayIdx + 1].filter((i) => i >= 0 && i < prev.length);
        if (!allowed.includes(overColIdx)) return prev;
      }

      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const taskIdx = next[activeColIdx].tasks.findIndex((t) => t.id === activeId);
      if (taskIdx < 0) return prev;
      const [task] = next[activeColIdx].tasks.splice(taskIdx, 1);

      const overTaskIdx = next[overColIdx].tasks.findIndex((t) => t.id === overId);
      if (overTaskIdx >= 0) {
        next[overColIdx].tasks.splice(overTaskIdx, 0, task);
      } else {
        next[overColIdx].tasks.push(task);
      }
      return next;
    });
  }, [isViewer, isEditor, todayIdx]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (isViewer) { setActiveTask(null); return; }
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const activeColIdx = findColumnOfTask(prev, activeId);
      let overColIdx = prev.findIndex((_, i) => `day-${i}` === overId);
      if (overColIdx < 0) overColIdx = findColumnOfTask(prev, overId);

      if (activeColIdx < 0 || overColIdx < 0) return prev;

      // Editor restriction
      if (isEditor && todayIdx >= 0) {
        const allowed = [todayIdx - 1, todayIdx, todayIdx + 1].filter((i) => i >= 0 && i < prev.length);
        if (!allowed.includes(overColIdx)) return prev;
      }

      // Same column reorder
      if (activeColIdx === overColIdx && activeId !== overId) {
        const next = [...prev];
        const col = { ...next[activeColIdx], tasks: [...next[activeColIdx].tasks] };
        const oldIdx = col.tasks.findIndex((t) => t.id === activeId);
        const newIdx = col.tasks.findIndex((t) => t.id === overId);
        if (oldIdx >= 0 && newIdx >= 0) {
          col.tasks = arrayMove(col.tasks, oldIdx, newIdx);
        }
        next[activeColIdx] = col;
        return next;
      }
      return prev;
    });
  }, [isViewer, isEditor, todayIdx]);

  return (
    <LayoutGroup>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={colVariants} className="flex items-center gap-4 mb-6">
            <h1 className="text-xl font-black tracking-tighter text-foreground">
              Daily Focus
            </h1>
            {isViewer && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold bg-foreground/[0.04] text-muted-foreground ring-1 ring-foreground/[0.06]">
                <Lock className="w-3 h-3" /> View Only
              </span>
            )}
            {isEditor && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold bg-primary/10 text-primary ring-1 ring-primary/20">
                Editor
              </span>
            )}
            {!isViewer && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={rollover}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold
                  bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400
                  backdrop-blur-lg ring-1 ring-white/10
                  shadow-[0_4px_16px_rgba(245,158,11,0.1)]
                  hover:shadow-[0_4px_24px_rgba(245,158,11,0.2)]
                  transition-shadow duration-300
                "
              >
                <RotateCcw className="w-3 h-3" />
                Rollover
              </motion.button>
            )}
          </motion.div>

          {/* 7-day grid — horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-7 md:overflow-x-visible md:pb-0 md:snap-none">
            {visibleColumns.map((col, dayIdx) => {
              const { day, dateStr } = formatDayHeader(col.date);
              const today = checkIsToday(col.date);
              const columnId = `day-${dayIdx}`;

              return (
                <DroppableDayColumn
                  key={col.date.toISOString()}
                  columnId={columnId}
                  isToday={today}
                  day={day}
                  dateStr={dateStr}
                  taskCount={col.tasks.length}
                >
                  {/* Tasks */}
                  <SortableContext
                    items={col.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2.5 flex-1 min-h-[60px]">
                      {col.tasks.length === 0 && <EmptyDayState />}
                      <AnimatePresence mode="popLayout">
                        {col.tasks.map((task) => (
                          <SortableTaskCard
                            key={task.id}
                            task={task}
                            onToggle={(id) => isViewer ? undefined : toggleTask(dayIdx, id)}
                            onClick={() => openDrawer(task)}
                            onContextMenu={(e) => handleCardContextMenu(e, task.id)}
                            readOnly={isViewer}
                            canToggle={!isViewer}
                            hideAssignees={isSolo}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>

                  {/* Quick Add — hidden for viewers and editors */}
                  {isFullAccess && (
                    <QuickAdd onAdd={(title) => addTask(dayIdx, title)} />
                  )}
                </DroppableDayColumn>
              );
            })}
          </div>
        </motion.div>

        {/* Drag overlay — the floating "lifted" card */}
        <DragOverlay dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}>
          {activeTask ? <DragOverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        task={drawerTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateTask={updateTask}
        onToggleDone={toggleTaskById}
        isSolo={isSolo}
        projectMembers={projectMembers}
      />

      <TaskContextMenu
        taskId={contextMenuTaskId}
        position={contextMenuPos}
        onClose={() => { setContextMenuTaskId(null); setContextMenuPos(null); }}
        actions={contextMenuActions}
        isSolo={isSolo}
        projectMembers={projectMembers}
        restrictActions={isViewer || isEditor}
      />
    </LayoutGroup>
  );
}
