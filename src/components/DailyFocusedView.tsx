import { useState, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  LayoutGroup,
} from "framer-motion";
import { Plus, RotateCcw, Check } from "lucide-react";
import TaskDrawer, { type DrawerTask } from "./TaskDrawer";

// ── Types ──────────────────────────────────────────────
type Tag = { label: string; color: string };

type Task = {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  assignee?: string;
  done: boolean;
  rolledOver: boolean;
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const seedTasks: Record<number, Task[]> = {
    0: [
      { id: "1", title: "Design System Overhaul", description: "Rebuild the component library with new tokens.", tags: [{ label: "Design", color: "indigo" }, { label: "Priority", color: "rose" }], assignee: "AK", done: false, rolledOver: false },
      { id: "2", title: "API Rate Limiting", description: "Implement throttling middleware for public endpoints.", tags: [{ label: "Backend", color: "emerald" }], assignee: "MJ", done: true, rolledOver: false },
    ],
    1: [
      { id: "3", title: "Onboarding Flow", description: "Create a step-by-step wizard for new users.", tags: [{ label: "UX", color: "amber" }, { label: "Feature", color: "sky" }], assignee: "RL", done: false, rolledOver: false },
    ],
    2: [
      { id: "4", title: "Real-time Notifications", description: "WebSocket-based live notification system.", tags: [{ label: "Feature", color: "sky" }, { label: "Backend", color: "emerald" }], assignee: "SC", done: false, rolledOver: false },
      { id: "5", title: "Dark Mode Polish", description: "Fine-tune contrast ratios across all surfaces.", tags: [{ label: "Design", color: "indigo" }], assignee: "AK", done: false, rolledOver: true },
    ],
    3: [
      { id: "6", title: "Auth Integration", description: "OAuth 2.0 with Google and GitHub providers.", tags: [{ label: "Backend", color: "emerald" }, { label: "Security", color: "rose" }], assignee: "MJ", done: false, rolledOver: false },
    ],
    4: [
      { id: "7", title: "Landing Page", description: "Hero section with animated gradients and CTA.", tags: [{ label: "Design", color: "indigo" }], assignee: "RL", done: false, rolledOver: false },
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

function DailyTaskCard({
  task,
  onToggle,
  onClick,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onClick: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [6, -6]);
  const rotateY = useTransform(x, [-80, 80], [-6, 6]);
  const sRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const sRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left - r.width / 2);
      y.set(e.clientY - r.top - r.height / 2);
    },
    [x, y]
  );
  const resetMouse = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      whileHover={{ scale: 1.04, y: -3 }}
      style={{ rotateX: sRotateX, rotateY: sRotateY, transformPerspective: 800 }}
      className={`
        rounded-[2rem] p-4 cursor-pointer select-none relative
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-2xl ring-1 ring-foreground/[0.06]
        shadow-[0_16px_48px_-12px_rgba(0,0,0,0.07),0_6px_20px_-6px_rgba(0,0,0,0.03)]
        dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5),0_0_24px_rgba(99,102,241,0.04)]
        transition-shadow duration-500
        ${task.done ? "opacity-60" : ""}
      `}
    >
      {/* Rolled-over badge */}
      {task.rolledOver && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 flex items-center justify-center" title="Rolled over">
          <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map((t) => <TaskTag key={t.label} tag={t} />)}
      </div>

      {/* Title */}
      <h3 className={`font-bold tracking-tighter text-foreground text-[13px] mb-1 ${task.done ? "line-through decoration-2 decoration-primary/40" : ""}`}>
        {task.title}
      </h3>

      {/* Description */}
      <p className={`text-[11px] text-muted-foreground leading-relaxed mb-3 ${task.done ? "line-through decoration-1 decoration-muted-foreground/30" : ""}`}>
        {task.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
            {task.assignee}
          </div>
        )}
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
      </div>
    </motion.div>
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

// ── Day Names ──────────────────────────────────────────
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDayHeader(date: Date): { day: string; dateStr: string } {
  return {
    day: DAY_NAMES[date.getDay()],
    dateStr: `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`,
  };
}

function isToday(date: Date): boolean {
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

// ── Main Component ─────────────────────────────────────
export default function DailyFocusedView() {
  const [columns, setColumns] = useState<DayColumn[]>(buildWeek);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setColumns((prev) => {
      const next = [...prev];
      next[dayIdx] = {
        ...next[dayIdx],
        tasks: [
          ...next[dayIdx].tasks,
          {
            id: `new-${Date.now()}`,
            title,
            description: "",
            tags: [],
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

  const updateTaskTitle = useCallback((id: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
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

  return (
    <LayoutGroup>
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={colVariants} className="flex items-center gap-4 mb-6">
          <h1 className="text-xl font-black tracking-tighter text-foreground">
            Daily Focus
          </h1>
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
        </motion.div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-3 overflow-x-auto">
          {columns.map((col, dayIdx) => {
            const { day, dateStr } = formatDayHeader(col.date);
            const today = isToday(col.date);

            return (
              <motion.div
                key={col.date.toISOString()}
                variants={colVariants}
                className={`
                  flex flex-col gap-3 min-w-[160px] rounded-[2rem] p-4
                  backdrop-blur-xl ring-1 ring-white/10
                  ${today
                    ? "bg-primary/[0.06] dark:bg-primary/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                    : "bg-white/[0.05] dark:bg-black/[0.05]"
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
                      {col.tasks.length}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{dateStr}</p>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-2.5 flex-1">
                  <AnimatePresence mode="popLayout">
                    {col.tasks.map((task) => (
                      <DailyTaskCard
                        key={task.id}
                        task={task}
                        onToggle={(id) => toggleTask(dayIdx, id)}
                        onClick={() => openDrawer(task)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Quick Add */}
                <QuickAdd onAdd={(title) => addTask(dayIdx, title)} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <TaskDrawer
        task={drawerTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateTitle={updateTaskTitle}
        onToggleDone={toggleTaskById}
      />
    </LayoutGroup>
  );
}
