import { useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

type Tag = { label: string; color: string };

type Task = {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  assignee?: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Design System Overhaul",
        description: "Rebuild the entire component library with new tokens and variants.",
        tags: [
          { label: "Design", color: "indigo" },
          { label: "Priority", color: "rose" },
        ],
        assignee: "AK",
      },
      {
        id: "2",
        title: "API Rate Limiting",
        description: "Implement throttling middleware for all public endpoints.",
        tags: [{ label: "Backend", color: "emerald" }],
        assignee: "MJ",
      },
      {
        id: "3",
        title: "Onboarding Flow",
        description: "Create a step-by-step wizard for new users.",
        tags: [
          { label: "UX", color: "amber" },
          { label: "Feature", color: "sky" },
        ],
        assignee: "RL",
      },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Real-time Notifications",
        description: "WebSocket-based live notification system with sound alerts.",
        tags: [
          { label: "Feature", color: "sky" },
          { label: "Backend", color: "emerald" },
        ],
        assignee: "SC",
      },
      {
        id: "5",
        title: "Dark Mode Polish",
        description: "Fine-tune contrast ratios and glow effects across all surfaces.",
        tags: [{ label: "Design", color: "indigo" }],
        assignee: "AK",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "6",
        title: "Auth Integration",
        description: "OAuth 2.0 with Google and GitHub providers fully working.",
        tags: [
          { label: "Backend", color: "emerald" },
          { label: "Security", color: "rose" },
        ],
        assignee: "MJ",
      },
      {
        id: "7",
        title: "Landing Page",
        description: "Hero section with animated gradients and CTA buttons.",
        tags: [{ label: "Design", color: "indigo" }],
        assignee: "RL",
      },
    ],
  },
];

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

function TaskTag({ tag }: { tag: Tag }) {
  const styles = TAG_STYLES[tag.color] || TAG_STYLES.indigo;
  return (
    <>
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${styles.light} dark:hidden`}>
        {tag.label}
      </span>
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold hidden dark:inline-flex ${styles.dark}`}>
        {tag.label}
      </span>
    </>
  );
}

function TaskCard({ task }: { task: Task }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
      className="
        rounded-[3rem] p-6 cursor-pointer select-none
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-2xl
        ring-1 ring-foreground/[0.06]
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.04)]
        dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.05)]
        transition-shadow duration-500
        hover:shadow-[0_24px_80px_-15px_rgba(0,0,0,0.12),0_12px_32px_-8px_rgba(0,0,0,0.06)]
        dark:hover:shadow-[0_24px_80px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(99,102,241,0.1)]
      "
    >
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {task.tags.map((tag) => (
          <TaskTag key={tag.label} tag={tag} />
        ))}
      </div>

      {/* Title */}
      <h3 className="font-bold tracking-tighter text-foreground text-sm mb-1.5">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {task.description}
      </p>

      {/* Footer */}
      {task.assignee && (
        <div className="flex items-center justify-between">
          <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {task.assignee}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function KanbanBoard() {
  const [columns] = useState(COLUMNS);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h1
        variants={columnVariants}
        className="text-xl font-black tracking-tighter text-foreground mb-8"
      >
        Project Board
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <motion.div key={col.id} variants={columnVariants} className="flex flex-col gap-4">
            {/* Column header */}
            <div className="flex items-center gap-3 mb-1 px-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {col.title}
              </h2>
              <div
                className="
                  w-6 h-6 rounded-full flex items-center justify-center
                  text-[10px] font-bold text-muted-foreground
                  bg-foreground/[0.04] dark:bg-white/[0.06]
                  backdrop-blur-xl ring-1 ring-foreground/[0.06]
                "
              >
                {col.tasks.length}
              </div>
            </div>

            {/* Task cards */}
            <div className="flex flex-col gap-4">
              {col.tasks.map((task) => (
                <motion.div key={task.id} variants={cardVariants}>
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
