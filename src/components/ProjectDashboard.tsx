import { useState, useCallback } from "react";
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
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type ProjectStatus = "on-track" | "delayed" | "completed";

type Project = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  status: ProjectStatus;
  color: string;
  members: { initials: string; color: string }[];
};

// ── Seed Data ──────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Design System v3",
    description: "Rebuilding component library with new silk tokens and glass surfaces.",
    icon: Palette,
    progress: 72,
    status: "on-track",
    color: "indigo",
    members: [
      { initials: "AK", color: "bg-indigo-500" },
      { initials: "MJ", color: "bg-violet-500" },
      { initials: "RL", color: "bg-sky-500" },
    ],
  },
  {
    id: "proj-2",
    name: "API Gateway",
    description: "Rate limiting, auth middleware, and WebSocket proxy layer.",
    icon: Shield,
    progress: 45,
    status: "delayed",
    color: "rose",
    members: [
      { initials: "SC", color: "bg-emerald-500" },
      { initials: "MJ", color: "bg-violet-500" },
    ],
  },
  {
    id: "proj-3",
    name: "Mobile App",
    description: "React Native client with offline-first architecture.",
    icon: Rocket,
    progress: 88,
    status: "on-track",
    color: "emerald",
    members: [
      { initials: "RL", color: "bg-sky-500" },
      { initials: "AK", color: "bg-indigo-500" },
      { initials: "TW", color: "bg-amber-500" },
      { initials: "SC", color: "bg-emerald-500" },
    ],
  },
  {
    id: "proj-4",
    name: "AI Assistant",
    description: "LLM-powered copilot for task management and scheduling.",
    icon: Sparkles,
    progress: 30,
    status: "on-track",
    color: "amber",
    members: [
      { initials: "TW", color: "bg-amber-500" },
    ],
  },
  {
    id: "proj-5",
    name: "Platform Infra",
    description: "Kubernetes migration, CI/CD pipelines, and monitoring.",
    icon: Layers,
    progress: 60,
    status: "delayed",
    color: "sky",
    members: [
      { initials: "SC", color: "bg-emerald-500" },
      { initials: "MJ", color: "bg-violet-500" },
      { initials: "AK", color: "bg-indigo-500" },
    ],
  },
];

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
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(239, 84%, 67%)" />
            <stop offset="100%" stopColor="hsl(270, 84%, 67%)" />
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
function StackedAvatars({ members }: { members: Project["members"] }) {
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
}: {
  project: Project;
  onSelect: (id: string) => void;
}) {
  const Icon = project.icon;

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
        backdrop-blur-2xl ring-1 ring-white/10
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_8px_24px_-8px_rgba(0,0,0,0.03)]
        dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.04)]
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]
        dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]
        transition-shadow duration-500
        flex flex-col gap-5
      "
    >
      {/* Top: Icon + Status */}
      <div className="flex items-start justify-between">
        <div className="
          w-12 h-12 rounded-2xl flex items-center justify-center
          bg-primary/10 dark:bg-primary/15
          shadow-[0_0_20px_rgba(99,102,241,0.15)]
          dark:shadow-[0_0_20px_rgba(99,102,241,0.25)]
        ">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <StatusTag status={project.status} />
      </div>

      {/* Title + Description */}
      <div className="flex-1">
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          {project.name}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
function CreateProjectCard() {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="
        rounded-[2.5rem] p-6 cursor-pointer select-none
        flex flex-col items-center justify-center gap-4
        min-h-[260px]
        border-2 border-dashed border-foreground/[0.08] dark:border-white/[0.08]
        bg-foreground/[0.01] dark:bg-white/[0.01]
        backdrop-blur-xl
        hover:border-primary/30 dark:hover:border-primary/40
        group transition-all duration-500
      "
    >
      <motion.div
        className="
          w-16 h-16 rounded-full flex items-center justify-center
          bg-foreground/[0.03] dark:bg-white/[0.04]
          group-hover:bg-primary/10 dark:group-hover:bg-primary/15
          group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]
          dark:group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
          transition-all duration-500
        "
      >
        <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-sm font-bold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          New Project
        </h3>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          Start from scratch
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────
interface ProjectDashboardProps {
  onSelectProject: (id: string) => void;
}

export default function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-foreground">
          Projects
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a project to open your workspace
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
          />
        ))}
        <CreateProjectCard />
      </div>
    </motion.div>
  );
}
