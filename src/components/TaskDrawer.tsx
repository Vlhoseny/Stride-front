import { useState, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  X,
  User,
  Calendar,
  Flag,
  Check,
  Plus,
  MessageSquare,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type Tag = { label: string; color: string };

export type DrawerTask = {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  assignee?: string;
  done: boolean;
  rolledOver: boolean;
};

type SubTask = { id: string; label: string; done: boolean };
type ActivityEntry = { id: string; text: string; time: string };

interface TaskDrawerProps {
  task: DrawerTask | null;
  open: boolean;
  onClose: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onToggleDone: (id: string) => void;
}

// ── Seed sub-tasks / activity per task ─────────────────
function getSeedSubTasks(taskId: string): SubTask[] {
  const seeds: Record<string, SubTask[]> = {
    "1": [
      { id: "s1", label: "Audit existing tokens", done: true },
      { id: "s2", label: "Define new color palette", done: false },
      { id: "s3", label: "Update component variants", done: false },
    ],
    "3": [
      { id: "s4", label: "Wireframe step flow", done: true },
      { id: "s5", label: "Build progress indicator", done: false },
    ],
    "4": [
      { id: "s6", label: "Set up WebSocket server", done: false },
      { id: "s7", label: "Design notification card", done: false },
      { id: "s8", label: "Add sound effects", done: false },
    ],
  };
  return seeds[taskId] || [
    { id: `ds-${taskId}-1`, label: "Research & planning", done: false },
    { id: `ds-${taskId}-2`, label: "Implementation", done: false },
  ];
}

function getSeedActivity(taskId: string): ActivityEntry[] {
  return [
    { id: "a1", text: "Task created", time: "2 days ago" },
    { id: "a2", text: "Assigned to team member", time: "1 day ago" },
    { id: "a3", text: "Priority updated to High", time: "6 hours ago" },
    { id: "a4", text: "Sub-task completed", time: "2 hours ago" },
  ];
}

// ── Drawer ─────────────────────────────────────────────
export default function TaskDrawer({
  task,
  open,
  onClose,
  onUpdateTitle,
  onToggleDone,
}: TaskDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [activity] = useState<ActivityEntry[]>([]);
  const [newSubTask, setNewSubTask] = useState("");
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setSubTasks(getSeedSubTasks(task.id));
    }
  }, [task]);

  const activityEntries = task ? getSeedActivity(task.id) : [];

  const completedCount = subTasks.filter((s) => s.done).length;
  const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

  const toggleSubTask = useCallback((id: string) => {
    setSubTasks((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (!s.done) {
            setCelebrateId(id);
            setTimeout(() => setCelebrateId(null), 600);
          }
          return { ...s, done: !s.done };
        }
        return s;
      })
    );
  }, []);

  const addSubTask = useCallback(() => {
    if (newSubTask.trim()) {
      setSubTasks((prev) => [
        ...prev,
        { id: `st-${Date.now()}`, label: newSubTask.trim(), done: false },
      ]);
      setNewSubTask("");
    }
  }, [newSubTask]);

  const handleTitleBlur = useCallback(() => {
    if (task && title !== task.title) {
      onUpdateTitle(task.id, title);
    }
  }, [task, title, onUpdateTitle]);

  return (
    <AnimatePresence>
      {open && task && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-[480px]
              bg-white/60 dark:bg-black/60
              backdrop-blur-[64px]
              shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15),inset_-1px_-1px_2px_rgba(0,0,0,0.05),-20px_0_60px_rgba(0,0,0,0.1)]
              dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.06),inset_-1px_-1px_2px_rgba(0,0,0,0.2),-20px_0_60px_rgba(0,0,0,0.4)]
              flex flex-col overflow-hidden
            "
          >
            {/* Progress bar at top */}
            <div className="h-1 w-full bg-foreground/[0.04] dark:bg-white/[0.06]">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    className="
                      w-full text-2xl font-black tracking-tighter text-foreground
                      bg-transparent outline-none border-none
                      rounded-xl px-2 py-1 -mx-2
                      focus:bg-foreground/[0.03] dark:focus:bg-white/[0.05]
                      focus:ring-1 focus:ring-primary/20
                      transition-all duration-200
                      placeholder:text-muted-foreground/40
                    "
                    placeholder="Task title..."
                  />
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-1 px-2">
                    {completedCount}/{subTasks.length} sub-tasks complete
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="
                    w-8 h-8 rounded-full flex items-center justify-center
                    bg-foreground/[0.04] dark:bg-white/[0.06]
                    hover:bg-foreground/[0.08] dark:hover:bg-white/[0.1]
                    text-muted-foreground
                    transition-colors duration-200
                  "
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Description */}
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  Description
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Add a description..."
                  className="
                    w-full text-sm text-foreground leading-relaxed
                    bg-foreground/[0.02] dark:bg-white/[0.03]
                    backdrop-blur-xl rounded-2xl p-4
                    ring-1 ring-white/10
                    outline-none resize-none
                    focus:ring-primary/20
                    placeholder:text-muted-foreground/40
                    transition-all duration-200
                  "
                />
              </section>

              {/* Metadata bento grid */}
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Details
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: User, label: "Assignee", value: task.assignee || "Unassigned" },
                    { icon: Calendar, label: "Due Date", value: "Feb 14" },
                    { icon: Flag, label: "Priority", value: "High" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="
                        rounded-2xl p-3 flex flex-col items-center gap-1.5
                        bg-foreground/[0.02] dark:bg-white/[0.03]
                        backdrop-blur-xl ring-1 ring-white/10
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
                        dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]
                      "
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{label}</span>
                      <span className="text-[11px] font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sub-tasks */}
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Sub-tasks
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {subTasks.map((st) => (
                      <motion.div
                        key={st.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="
                          flex items-center gap-3 px-4 py-2.5 rounded-2xl
                          bg-foreground/[0.02] dark:bg-white/[0.03]
                          ring-1 ring-white/10
                          backdrop-blur-xl
                        "
                      >
                        <motion.button
                          onClick={() => toggleSubTask(st.id)}
                          whileTap={{ scale: 0.8 }}
                          className={`
                            w-5 h-5 rounded-full flex items-center justify-center shrink-0
                            transition-all duration-300
                            ${st.done
                              ? "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(99,102,241,0.5)]"
                              : "ring-1 ring-foreground/10 hover:ring-primary/40"
                            }
                          `}
                        >
                          {st.done && <Check className="w-3 h-3" />}
                        </motion.button>

                        {/* Celebration pop */}
                        <AnimatePresence>
                          {celebrateId === st.id && (
                            <motion.div
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2.5, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="absolute w-5 h-5 rounded-full bg-primary/30"
                            />
                          )}
                        </AnimatePresence>

                        <span
                          className={`
                            text-xs flex-1
                            ${st.done
                              ? "line-through text-muted-foreground/50 decoration-primary/40"
                              : "text-foreground"
                            }
                          `}
                        >
                          {st.label}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add sub-task */}
                  <div className="flex gap-2">
                    <input
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addSubTask(); }}
                      placeholder="Add sub-task..."
                      className="
                        flex-1 px-4 py-2 rounded-2xl text-xs
                        bg-foreground/[0.02] dark:bg-white/[0.03]
                        ring-1 ring-white/10 backdrop-blur-xl
                        text-foreground placeholder:text-muted-foreground/40
                        outline-none focus:ring-primary/20
                        transition-all duration-200
                      "
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={addSubTask}
                      className="
                        w-8 h-8 rounded-full flex items-center justify-center
                        bg-primary/10 text-primary
                        hover:bg-primary/20
                        transition-colors duration-200
                      "
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </section>

              {/* Activity Log */}
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Activity
                </h3>
                <div className="relative pl-5">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

                  <div className="space-y-4">
                    {activityEntries.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="relative flex items-start gap-3"
                      >
                        {/* Glowing dot */}
                        <div
                          className="
                            absolute -left-5 top-1 w-[9px] h-[9px] rounded-full
                            bg-primary/60 ring-2 ring-background
                            shadow-[0_0_8px_rgba(99,102,241,0.5)]
                          "
                        />
                        <div>
                          <p className="text-xs text-foreground">{entry.text}</p>
                          <p className="text-[9px] text-muted-foreground/50 font-mono">{entry.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer action */}
            <div className="px-6 py-4 border-t border-white/[0.06]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onToggleDone(task.id); onClose(); }}
                className={`
                  w-full py-3 rounded-2xl text-sm font-semibold
                  transition-all duration-300
                  ${task.done
                    ? "bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.08]"
                    : "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.3)]"
                  }
                `}
              >
                {task.done ? "Mark as Incomplete" : "Mark as Complete"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
