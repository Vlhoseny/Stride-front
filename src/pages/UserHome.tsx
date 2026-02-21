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
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useProjectData } from "@/components/ProjectDataContext";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";

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
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="
        group relative text-left p-6 rounded-[1.5rem] overflow-hidden
        bg-white/[0.55] dark:bg-white/[0.025]
        backdrop-blur-xl
        border border-black/[0.06] dark:border-white/[0.06]
        shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
        transition-shadow duration-300 w-full
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
        backdrop-blur-xl
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

/* ═══════════════════════════════════════════════════════
   UserHome — The Command Center
   ═══════════════════════════════════════════════════════ */
export default function UserHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects } = useProjectData();
    const { theme, toggleTheme } = useTheme();

    const firstName = user?.fullName?.split(" ")[0] || "there";
    const activeCount = projects.filter((p) => p.status !== "completed").length;
    const completedCount = projects.filter((p) => p.status === "completed").length;

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
              bg-background/70 backdrop-blur-xl
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
                    <div className="grid sm:grid-cols-2 gap-4">
                        <QuickAction
                            icon={FolderKanban}
                            gradient="from-indigo-500 to-violet-600"
                            title="Go to Project Dashboard"
                            description="View all your projects, sprints, and task boards in one place."
                            onClick={() => navigate("/dashboard")}
                            delay={0.05}
                        />
                        <QuickAction
                            icon={Plus}
                            gradient="from-emerald-500 to-teal-600"
                            title="Create New Project"
                            description="Start a fresh project with tasks, timelines, and team members."
                            onClick={() => navigate("/dashboard?action=create")}
                            delay={0.1}
                        />
                    </div>
                </motion.section>

                {/* Widget Area */}
                <motion.section {...stagger} initial="initial" animate="animate">
                    <motion.p
                        {...fadeUp}
                        className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-4"
                    >
                        Overview
                    </motion.p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {/* Stats widget */}
                        <WidgetCard
                            icon={BarChart3}
                            gradient="from-sky-500 to-blue-600"
                            title="Projects"
                            delay={0.15}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-muted-foreground">
                                        Active
                                    </span>
                                    <span className="text-lg font-bold text-foreground">
                                        {activeCount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-muted-foreground">
                                        Completed
                                    </span>
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {completedCount}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width:
                                                activeCount + completedCount > 0
                                                    ? `${(completedCount / (activeCount + completedCount)) * 100}%`
                                                    : "0%",
                                        }}
                                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </WidgetCard>

                        {/* Tasks Due Soon widget (placeholder) */}
                        <WidgetCard
                            icon={CalendarClock}
                            gradient="from-amber-500 to-orange-600"
                            title="Tasks Due Soon"
                            delay={0.2}
                        >
                            <div className="space-y-2.5">
                                {["Finalise design specs", "Review pull requests", "Team standup prep"].map(
                                    (task, i) => (
                                        <div
                                            key={task}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/60 dark:bg-white/[0.03] border border-border/40"
                                        >
                                            <div
                                                className={`w-1.5 h-1.5 rounded-full ${i === 0
                                                        ? "bg-rose-500"
                                                        : i === 1
                                                            ? "bg-amber-500"
                                                            : "bg-emerald-500"
                                                    }`}
                                            />
                                            <span className="text-[12px] text-foreground/70 truncate">
                                                {task}
                                            </span>
                                        </div>
                                    )
                                )}
                                <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
                                    Placeholder — will populate from real tasks
                                </p>
                            </div>
                        </WidgetCard>

                        {/* Productivity widget (placeholder) */}
                        <WidgetCard
                            icon={Sparkles}
                            gradient="from-violet-500 to-purple-600"
                            title="Productivity"
                            delay={0.25}
                        >
                            <div className="space-y-3">
                                {[
                                    { label: "This week", pct: 72, color: "bg-primary" },
                                    { label: "Focus sessions", pct: 85, color: "bg-violet-500" },
                                    { label: "On-time rate", pct: 91, color: "bg-emerald-500" },
                                ].map((bar) => (
                                    <div key={bar.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] text-muted-foreground">
                                                {bar.label}
                                            </span>
                                            <span className="text-[11px] font-semibold text-foreground/60">
                                                {bar.pct}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${bar.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${bar.pct}%` }}
                                                transition={{
                                                    delay: 0.5,
                                                    duration: 0.8,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
                                    Placeholder — will integrate with analytics
                                </p>
                            </div>
                        </WidgetCard>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
