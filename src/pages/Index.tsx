import { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  FolderKanban,
  CalendarDays,
} from "lucide-react";

const TOTAL_WEEKS = 15;
const CURRENT_WEEK = 7;

const stats = [
  { label: "Total Projects", value: "12", change: "+2", icon: FolderKanban },
  { label: "Team Members", value: "8", change: "+1", icon: Users },
  { label: "Growth", value: "24%", change: "+4.5%", icon: TrendingUp },
];

const projects = [
  { name: "Brand Redesign", status: "In Progress", progress: 72 },
  { name: "Mobile App v2", status: "Review", progress: 90 },
  { name: "API Integration", status: "Planning", progress: 15 },
  { name: "Dashboard UI", status: "In Progress", progress: 58 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const Index = () => {
  const [activeWeek, setActiveWeek] = useState(CURRENT_WEEK);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(
    () => Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1),
    []
  );

  const jumpToToday = useCallback(() => {
    setActiveWeek(CURRENT_WEEK);
    const el = scrollRef.current;
    if (!el) return;
    const pill = el.children[CURRENT_WEEK - 1] as HTMLElement | undefined;
    if (pill) {
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  const overallProgress = 72;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* ── Week selector header ── */}
      <motion.div variants={item} className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-black tracking-tighter text-foreground">
          Timeline
        </h1>
        <motion.button
          onClick={jumpToToday}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="px-3 py-1 text-xs font-semibold rounded-full glass ring-1 ring-foreground/[0.06] text-primary hover:shadow-neon transition-premium"
        >
          <CalendarDays className="w-3 h-3 inline-block mr-1 -mt-px" />
          Today
        </motion.button>
      </motion.div>

      {/* ── Weekly strip ── */}
      <motion.div
        variants={item}
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {weeks.map((week) => {
          const isActive = week === activeWeek;
          return (
            <motion.button
              key={week}
              onClick={() => setActiveWeek(week)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                relative flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold
                ring-1 transition-premium select-none
                ${
                  isActive
                    ? "ring-primary/30 text-primary-foreground"
                    : "ring-foreground/[0.06] glass text-muted-foreground hover:text-foreground"
                }
              `}
              style={{ fontFamily: "'Geist Mono', 'SF Mono', monospace" }}
            >
              {/* Active glow background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="weekGlow"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(239 84% 67%), hsl(250 84% 55%), hsl(239 84% 67%))",
                      boxShadow:
                        "0 0 30px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2), inset 0 1px 1px rgba(255,255,255,0.15)",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10">W{String(week).padStart(2, "0")}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Progress Card — spans 1 col, taller */}
        <motion.div
          variants={item}
          className="md:row-span-2 rounded-3xl glass-card p-6 flex flex-col justify-between ring-1 ring-foreground/[0.06]"
          style={{
            boxShadow:
              "var(--shadow-card), var(--shadow-inner-glow), inset 0 0 60px rgba(99,102,241,0.04)",
          }}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
            <p className="text-xs text-muted-foreground">
              Week {activeWeek} of {TOTAL_WEEKS}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-36 h-36">
              {/* Outer ring background */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-foreground/[0.06]"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="url(#progressGrad)"
                  strokeDasharray={2 * Math.PI * 52}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 52 * (1 - overallProgress / 100),
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(99,102,241,0.4))",
                  }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(239 84% 67%)" />
                    <stop offset="100%" stopColor="hsl(260 84% 60%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tracking-tighter text-foreground">
                  {overallProgress}%
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary shadow-neon" />
            On track for deadline
          </div>
        </motion.div>

        {/* Stat cards */}
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="rounded-3xl glass-card p-6 ring-1 ring-foreground/[0.06]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner-glow">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary flex items-center gap-0.5">
                {stat.change} <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-2xl font-black tracking-tighter text-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Projects list ── */}
      <motion.div
        variants={item}
        className="rounded-3xl glass-card p-6 ring-1 ring-foreground/[0.06]"
      >
        <h2 className="text-base font-bold tracking-tight text-foreground mb-5">
          Active Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {project.name}
                </p>
                <p className="text-xs text-muted-foreground">{project.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 rounded-full bg-foreground/5 overflow-hidden shadow-inner-glow">
                  <motion.div
                    className="h-full rounded-full bg-primary shadow-neon"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1] as const,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {project.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Index;
