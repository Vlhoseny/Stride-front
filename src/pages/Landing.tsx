import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    BarChart3,
    Users,
    FolderKanban,
    Sparkles,
    Shield,
    Zap,
    Sun,
    Moon,
    Palette,
    GripVertical,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

/* ─── Feature data ─────────────────────────────────── */
const features = [
    {
        icon: FolderKanban,
        title: "Smart Projects",
        desc: "Organise everything into focused weekly sprints with an intuitive task board.",
        color: "from-indigo-500/20 to-violet-500/20",
    },
    {
        icon: GripVertical,
        title: "Drag & Drop",
        desc: "Reorder tasks, shift priorities, and plan your day with fluid drag-and-drop.",
        color: "from-rose-500/20 to-pink-500/20",
    },
    {
        icon: BarChart3,
        title: "Live Analytics",
        desc: "Real-time completion rates, streaks, and progress rings at a glance.",
        color: "from-emerald-500/20 to-teal-500/20",
    },
    {
        icon: Users,
        title: "Team Sync",
        desc: "Invite members, assign roles, and keep everyone on the same page.",
        color: "from-sky-500/20 to-cyan-500/20",
    },
    {
        icon: Palette,
        title: "Personalised",
        desc: "Six accent themes, dark/light mode, and glassmorphism you can make yours.",
        color: "from-amber-500/20 to-orange-500/20",
    },
    {
        icon: Shield,
        title: "Role-Based Access",
        desc: "Owners, editors, viewers — granular control over who can do what.",
        color: "from-violet-500/20 to-purple-500/20",
    },
];

/* ─── Stats data ───────────────────────────────────── */
const stats: { value: string; numericPart?: number; suffix?: string; prefix?: string; label: string }[] = [
    { value: "60fps", numericPart: 60, suffix: "fps", label: "Smooth Animations" },
    { value: "6", numericPart: 6, suffix: "", label: "Accent Themes" },
    { value: "∞", label: "Projects & Tasks" },
    { value: "<1s", numericPart: 1, prefix: "<", suffix: "s", label: "Page Load" },
];

/* ─── Animated number counter ──────────────────────── */
function AnimatedStat({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView || stat.numericPart === undefined) return;
        const target = stat.numericPart;
        const duration = 1200;
        const startTime = performance.now();
        function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }, [isInView, stat.numericPart]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 24 }}
            className="relative group text-center p-6 rounded-3xl
        bg-white/50 dark:bg-white/[0.03]
        backdrop-blur-xl
        border border-black/[0.05] dark:border-white/[0.07]
        hover:border-primary/20 dark:hover:border-primary/30
        transition-colors duration-500"
        >
            <div className="absolute inset-0 rounded-3xl bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative">
                <div className="text-4xl md:text-5xl font-black tracking-tighter text-primary leading-none mb-2 font-['JetBrains_Mono',monospace]">
                    {stat.numericPart !== undefined ? (
                        <>
                            {stat.prefix ?? ""}
                            {display}
                            {stat.suffix ?? ""}
                        </>
                    ) : (
                        <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                            {stat.value}
                        </span>
                    )}
                </div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    {stat.label}
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Feature card ─────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 180, damping: 22 }}
            className="group relative p-7 rounded-[1.75rem]
        bg-white/50 dark:bg-white/[0.03]
        backdrop-blur-xl
        border border-black/[0.04] dark:border-white/[0.07]
        shadow-[0_2px_24px_rgba(0,0,0,0.03)] dark:shadow-none
        hover:shadow-[0_12px_40px_rgba(99,102,241,0.08)] dark:hover:shadow-[0_12px_40px_rgba(99,102,241,0.12)]
        hover:border-primary/15 dark:hover:border-primary/25
        transition-all duration-500"
        >
            <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
            >
                <feature.icon className="w-5 h-5 text-foreground/70" />
            </div>
            <h3 className="text-[17px] font-bold text-foreground mb-1.5 tracking-tight">{feature.title}</h3>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">{feature.desc}</p>
        </motion.div>
    );
}

/* ─── Floating logo with 3D tilt ───────────────────── */
function HeroLogo() {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = ((e.clientY - cy) / rect.height) * -12;
        const y = ((e.clientX - cx) / rect.width) * 12;
        setRotate({ x, y });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={() => setRotate({ x: 0, y: 0 })}
            initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 140, damping: 18 }}
            className="relative mx-auto w-32 h-32 md:w-40 md:h-40 mb-10"
            style={{ perspective: 800 }}
        >
            <motion.div
                animate={{ rotateX: rotate.x, rotateY: rotate.y }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Glow ring */}
                <motion.div
                    animate={{
                        boxShadow: [
                            "0 0 30px 8px rgba(99,102,241,0.12), 0 0 60px 16px rgba(139,92,246,0.06)",
                            "0 0 50px 12px rgba(99,102,241,0.2), 0 0 100px 24px rgba(139,92,246,0.1)",
                            "0 0 30px 8px rgba(99,102,241,0.12), 0 0 60px 16px rgba(139,92,246,0.06)",
                        ],
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-[2.25rem]"
                />
                {/* Glass container */}
                <div
                    className="absolute inset-0 rounded-[2.25rem]
            bg-gradient-to-br from-white/60 via-white/30 to-primary/10
            dark:from-white/[0.08] dark:via-white/[0.03] dark:to-primary/10
            backdrop-blur-2xl ring-1 ring-white/30 dark:ring-white/10 overflow-hidden"
                >
                    <img
                        src="/stride-logo.webp"
                        alt="STRIDE"
                        className="w-full h-full object-contain p-3 drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════
   Landing Page
   ═══════════════════════════════════════════════════════ */
export default function Landing() {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* ── Mesh BG ── */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.03]" />
                <motion.div
                    className="absolute w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[140px] will-change-transform"
                    animate={{ x: [0, 100, -60, 0], y: [0, -80, 50, 0] }}
                    transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
                    style={{ top: "-15%", left: "-10%" }}
                />
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full bg-violet-500/[0.05] blur-[120px] will-change-transform"
                    animate={{ x: [0, -80, 40, 0], y: [0, 60, -50, 0] }}
                    transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
                    style={{ bottom: "0%", right: "-5%" }}
                />
                <motion.div
                    className="absolute w-[350px] h-[350px] rounded-full bg-sky-400/[0.04] blur-[100px] will-change-transform"
                    animate={{ x: [0, 50, -30, 0], y: [0, -30, 60, 0] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
                    style={{ top: "45%", left: "55%" }}
                />
            </div>

            {/* ── Navbar ── */}
            <nav className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 py-3">
                <div
                    className="max-w-5xl mx-auto flex items-center justify-between
            px-4 sm:px-5 py-2.5 rounded-2xl
            bg-white/65 dark:bg-white/[0.04]
            backdrop-blur-2xl
            border border-black/[0.05] dark:border-white/[0.08]
            shadow-[0_2px_20px_rgba(0,0,0,0.04)]"
                >
                    <div className="flex items-center gap-2">
                        <img src="/stride-logo.webp" alt="STRIDE" className="w-8 h-8 object-contain" />
                        <span className="text-base font-black tracking-tighter font-['JetBrains_Mono',monospace]">
                            STRIDE
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-[15px] h-[15px]" />
                            ) : (
                                <Moon className="w-[15px] h-[15px]" />
                            )}
                        </button>
                        <button
                            onClick={() => navigate("/auth")}
                            className="px-4 py-1.5 rounded-xl text-sm font-semibold
                bg-foreground text-background
                hover:opacity-90 active:scale-[0.97]
                transition-all duration-200"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative pt-28 pb-12 md:pt-40 md:pb-20 px-4">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-3xl mx-auto text-center">
                    {/* Pill badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full mb-8
              bg-primary/10 border border-primary/15 text-primary text-[11px] font-semibold tracking-wide uppercase"
                    >
                        <Sparkles className="w-3 h-3" />
                        Project Management, Reimagined
                    </motion.div>

                    <HeroLogo />

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black tracking-[-0.045em] leading-[0.92] mb-5"
                    >
                        <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
                            Plan Smarter.
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-violet-500 to-sky-400 bg-clip-text text-transparent">
                            Move Faster.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-9 leading-relaxed"
                    >
                        The modern workspace for teams who value clarity, speed, and beautiful design.
                        Organise, track, and deliver — all in one place.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    >
                        <button
                            onClick={() => navigate("/auth")}
                            className="group flex items-center gap-2 px-7 py-3 rounded-2xl text-[15px] font-semibold
                bg-primary text-primary-foreground
                hover:brightness-110 active:scale-[0.97]
                transition-all duration-200
                shadow-[0_6px_24px_rgba(99,102,241,0.3)]"
                        >
                            Get Started — Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </button>
                        <a
                            href="#features"
                            className="px-7 py-3 rounded-2xl text-[15px] font-semibold
                text-foreground/70 hover:text-foreground
                bg-white/40 dark:bg-white/[0.05]
                border border-black/[0.06] dark:border-white/[0.08]
                hover:bg-white/60 dark:hover:bg-white/[0.08]
                transition-all duration-200"
                        >
                            Explore Features
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Stats ── */}
            <section className="px-4 pb-16 md:pb-24">
                <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {stats.map((s, i) => (
                        <AnimatedStat key={s.label} stat={s} index={i} />
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="px-4 pb-20 md:pb-32">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-3xl md:text-[2.75rem] font-black tracking-tight mb-3">
                            Everything you need
                        </h2>
                        <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                            Powerful features in a pixel-perfect interface your team will love.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-5">
                        {features.map((f, i) => (
                            <FeatureCard key={f.title} feature={f} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why STRIDE ── */}
            <section className="px-4 pb-20 md:pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto p-8 md:p-12 rounded-[2rem]
            bg-white/45 dark:bg-white/[0.025]
            backdrop-blur-2xl
            border border-black/[0.04] dark:border-white/[0.06]
            shadow-[0_12px_48px_rgba(0,0,0,0.03)]"
                >
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                        Why teams choose STRIDE
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3.5">
                        {[
                            "Weekly sprint planning with daily focus view",
                            "Fluid drag-and-drop task management",
                            "Real-time analytics & progress rings",
                            "Dark/light mode with 6 accent themes",
                            "Team collaboration with role-based access",
                            "One-click email invite system",
                            "Glassmorphism UI with buttery 60fps animations",
                            "Mobile-first responsive design",
                        ].map((item) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-2.5"
                            >
                                <CheckCircle2 className="w-[18px] h-[18px] text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-[13.5px] text-foreground/75 leading-snug">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── Final CTA ── */}
            <section className="px-4 pb-20 md:pb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto text-center py-14 md:py-20 px-6 rounded-[2.5rem] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-violet-500/[0.04] to-sky-400/[0.08] rounded-[2.5rem]" />
                    <div className="absolute inset-0 border border-primary/10 rounded-[2.5rem]" />

                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="relative w-16 h-16 mx-auto mb-6"
                    >
                        <img
                            src="/stride-logo.webp"
                            alt=""
                            className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
                        />
                    </motion.div>

                    <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3">
                        Ready to take the leap?
                    </h2>
                    <p className="relative text-muted-foreground text-sm sm:text-base mb-7 max-w-sm mx-auto">
                        Join STRIDE today and transform how your team plans, tracks, and ships.
                    </p>
                    <button
                        onClick={() => navigate("/auth")}
                        className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold
              bg-primary text-primary-foreground
              hover:brightness-110 active:scale-[0.97]
              transition-all duration-200
              shadow-[0_6px_24px_rgba(99,102,241,0.35)]"
                    >
                        Start for Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer className="px-4 pb-8 pt-4 border-t border-black/[0.03] dark:border-white/[0.04]">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-[11px] text-muted-foreground/50">
                    <div className="flex items-center gap-1.5">
                        <img src="/stride-logo.webp" alt="" className="w-4 h-4 object-contain opacity-50" />
                        <span className="font-semibold tracking-tight">STRIDE</span>
                    </div>
                    <p>© {new Date().getFullYear()} STRIDE. Crafted with care.</p>
                </div>
            </footer>
        </div>
    );
}
