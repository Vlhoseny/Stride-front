import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Users,
    User,
    Palette,
    Layers,
    Rocket,
    Sparkles,
    Shield,
    Zap,
    Globe,
    Code,
    Database,
    Terminal,
    Star,
    Heart,
    Plus,
    Trash2,
    Crown,
    ShieldCheck,
    Pencil,
    Eye,
    Briefcase,
    GraduationCap,
    Coffee,
    Gamepad2,
    Music,
    Camera,
    BookOpen,
    Plane,
    Trophy,
    Lightbulb,
    PenTool,
    Gem,
} from "lucide-react";
import { useProjectData, type ProjectRole, type ProjectMode } from "./ProjectDataContext";
import { useAuth } from "./AuthContext";
import { sanitizeInput } from "@/lib/sanitize";

// ── Icon map ───────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    Palette, Layers, Rocket, Sparkles, Shield, Zap, Globe,
    Code, Database, Terminal, Star, Heart, Briefcase,
    GraduationCap, Coffee, Gamepad2, Music, Camera,
    BookOpen, Plane, Trophy, Lightbulb, PenTool, Gem,
};
const ICON_LIST = Object.entries(ICON_MAP);

const ACCENT_COLORS = [
    { name: "indigo", swatch: "bg-indigo-500" },
    { name: "violet", swatch: "bg-violet-500" },
    { name: "rose", swatch: "bg-rose-500" },
    { name: "emerald", swatch: "bg-emerald-500" },
    { name: "amber", swatch: "bg-amber-500" },
    { name: "sky", swatch: "bg-sky-500" },
];

const ROLE_META: Record<ProjectRole, { label: string; icon: React.ElementType; desc: string }> = {
    owner: { label: "Owner", icon: Crown, desc: "Full control" },
    admin: { label: "Admin", icon: ShieldCheck, desc: "Manage members & settings" },
    editor: { label: "Editor", icon: Pencil, desc: "Edit tasks & notes" },
    viewer: { label: "Viewer", icon: Eye, desc: "Read-only access" },
};

interface NewMember {
    email: string;
    role: ProjectRole;
}

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
    const { addProject, sendInvite, projects } = useProjectData();
    const { user } = useAuth();

    // ── Project limit enforcement ──────────────────────
    const MAX_TOTAL_PROJECTS = 4;
    const totalProjectCount = projects.length;
    const globalLimitReached = totalProjectCount >= MAX_TOTAL_PROJECTS;

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [iconName, setIconName] = useState("Rocket");
    const [color, setColor] = useState("indigo");
    const [mode, setMode] = useState<ProjectMode>("team");
    const [estimatedDays, setEstimatedDays] = useState(30);
    const [teamMembers, setTeamMembers] = useState<NewMember[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState<ProjectRole>("editor");

    const reset = () => {
        setName(""); setDescription(""); setIconName("Rocket"); setColor("indigo");
        setMode("team"); setEstimatedDays(30); setTeamMembers([]); setNewMemberEmail(""); setNewMemberRole("editor");
    };

    const addTeamMember = () => {
        const email = newMemberEmail.trim().toLowerCase();
        if (!email || !email.includes("@")) return;
        if (teamMembers.some((tm) => tm.email === email)) return;
        setTeamMembers((p) => [...p, { email, role: newMemberRole }]);
        setNewMemberEmail("");
        setNewMemberRole("editor");
    };

    const removeTeamMember = (i: number) => setTeamMembers((p) => p.filter((_, idx) => idx !== i));

    const getInitials = (n: string) => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const handleCreate = () => {
        const safeName = sanitizeInput(name);
        if (!safeName) return;
        const safeDesc = sanitizeInput(description);
        const ownerInitials = user?.fullName ? getInitials(user.fullName) : "ME";
        const ownerName = user?.fullName || "Me";
        const ownerEmail = user?.email || "me@example.com";

        const members = [
            { id: `m-${Date.now()}`, initials: ownerInitials, name: ownerName, email: ownerEmail, color: "bg-indigo-500", role: "owner" as ProjectRole },
        ];

        const proj = addProject({
            name: safeName,
            description: safeDesc,
            iconName,
            progress: 0,
            status: "on-track",
            color,
            mode,
            members,
            tags: [],
            estimatedDays,
        });

        // Send invites for team members
        if (mode === "team") {
            teamMembers.forEach((tm) => {
                sendInvite(proj.id, tm.email, tm.role, ownerName);
            });
        }

        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="
              relative w-full max-w-lg max-h-[85vh] overflow-y-auto
              rounded-[2rem] p-8
              bg-white/80 dark:bg-slate-900/80
              backdrop-blur-[60px] border border-black/5 dark:border-white/10
              shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]
              dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]
            "
                    >
                        {/* Close */}
                        <button onClick={onClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-black tracking-tighter text-foreground mb-6">New Project</h2>

                        {/* Name */}
                        <label className="block mb-4">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Project Name</span>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Awesome Project"
                                className="mt-1.5 w-full h-10 rounded-xl glass px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:shadow-neon transition-premium"
                            />
                        </label>

                        {/* Description */}
                        <label className="block mb-4">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this project about?"
                                rows={2}
                                className="mt-1.5 w-full rounded-xl glass px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:shadow-neon transition-premium resize-none"
                            />
                        </label>

                        {/* Icon picker */}
                        <div className="mb-4">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Icon</span>
                            <div className="grid grid-cols-5 gap-2 mt-1.5 max-h-[200px] overflow-y-auto pr-1">
                                {ICON_LIST.map(([iName, Icon]) => (
                                    <button
                                        key={iName}
                                        onClick={() => setIconName(iName)}
                                        className={`
                      w-9 h-9 rounded-xl flex items-center justify-center transition-premium
                      ${iconName === iName
                                                ? "bg-primary/15 text-primary shadow-neon ring-1 ring-primary/30"
                                                : "glass text-muted-foreground hover:text-foreground"
                                            }
                    `}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div className="mb-5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Accent Color</span>
                            <div className="flex gap-2 mt-1.5">
                                {ACCENT_COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setColor(c.name)}
                                        className={`w-7 h-7 rounded-full ${c.swatch} transition-all ${color === c.name ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "opacity-60 hover:opacity-100"}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mode toggle */}
                        <div className="mb-5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Project Mode</span>
                            <div className="flex gap-3">
                                {(["solo", "team"] as const).map((m) => {
                                    const active = mode === m;
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={`
                        flex-1 flex items-center gap-3 p-4 rounded-2xl transition-premium
                        ${active
                                                    ? "bg-primary/10 ring-1 ring-primary/30 shadow-neon"
                                                    : "glass hover:bg-foreground/[0.03]"
                                                }
                      `}
                                        >
                                            {m === "solo" ? <User className="w-5 h-5 text-muted-foreground" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                                            <div className="text-left">
                                                <p className={`text-sm font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {m === "solo" ? "Solo" : "Team"}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {m === "solo" ? "Just you, full speed" : "Collaborate with roles"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Estimated days */}
                        <label className="block mb-5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Estimated Duration (days)</span>
                            <input
                                type="number"
                                min={1}
                                value={estimatedDays}
                                onChange={(e) => setEstimatedDays(Math.max(1, +e.target.value))}
                                className="mt-1.5 w-24 h-10 rounded-xl glass px-4 text-sm text-foreground outline-none focus:shadow-neon transition-premium"
                            />
                        </label>

                        {/* Team members (only for team mode) */}
                        <AnimatePresence>
                            {mode === "team" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="overflow-hidden mb-5"
                                >
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Team Members</span>

                                    {/* Added members */}
                                    <div className="space-y-2 mb-3">
                                        {teamMembers.map((tm, i) => {
                                            const RIcon = ROLE_META[tm.role].icon;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-xl glass"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary">
                                                        @
                                                    </div>
                                                    <span className="flex-1 text-xs font-medium text-foreground truncate">{tm.email}</span>
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <RIcon className="w-3 h-3" /> {ROLE_META[tm.role].label}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">Pending</span>
                                                    <button onClick={() => removeTeamMember(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Add member row */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <input
                                                value={newMemberEmail}
                                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                                                placeholder="member@email.com"
                                                type="email"
                                                className="w-full h-9 rounded-xl glass px-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:shadow-neon transition-premium"
                                            />
                                        </div>
                                        <select
                                            value={newMemberRole}
                                            onChange={(e) => setNewMemberRole(e.target.value as ProjectRole)}
                                            className="h-9 rounded-xl glass px-3 text-xs text-foreground outline-none cursor-pointer appearance-none bg-transparent"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="editor">Editor</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                        <button onClick={addTeamMember} className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Role legend */}
                                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                                        {(Object.entries(ROLE_META) as [ProjectRole, typeof ROLE_META.owner][]).map(([key, meta]) => {
                                            const RIcon = meta.icon;
                                            return (
                                                <div key={key} className="flex items-center gap-1.5 text-[9px] text-muted-foreground/70">
                                                    <RIcon className="w-3 h-3" />
                                                    <span className="font-semibold">{meta.label}:</span>
                                                    <span>{meta.desc}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Limit Warning */}
                        <AnimatePresence>
                            {globalLimitReached && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="overflow-hidden"
                                >
                                    <div className="
                                        flex items-center gap-3 p-4 rounded-2xl
                                        bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10
                                        ring-1 ring-amber-500/20 dark:ring-amber-400/20
                                        mb-4
                                    ">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Limit Reached</p>
                                            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                                                You have reached the maximum of {MAX_TOTAL_PROJECTS} projects (Solo + Team combined). Delete an existing project to create a new one.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 h-11 rounded-2xl glass text-sm font-semibold text-muted-foreground hover:text-foreground transition-premium">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name.trim() || globalLimitReached}
                                className="flex-1 h-11 rounded-2xl btn-silk text-sm disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {globalLimitReached ? "Limit Reached" : "Create Project"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
