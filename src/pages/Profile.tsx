import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Briefcase,
    FileText,
    Camera,
    LogOut,
    Check,
    Pencil,
    Shield,
    Crown,
    Palette,
    Rocket,
    Sparkles,
    Layers,
} from "lucide-react";
import { useAuth, type User as UserType } from "@/components/AuthContext";
import { useProjectData } from "@/components/ProjectDataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ── Project data (mirrors ProjectDashboard) ────────────
type ProjectRole = "owner" | "admin" | "member";

interface UserProject {
    id: string;
    name: string;
    icon: React.ElementType;
    progress: number;
    role: ProjectRole;
    color: string;
}

function getUserProjects(email: string): UserProject[] {
    // Match user to projects based on seed data
    const allProjects: UserProject[] = [
        { id: "proj-1", name: "Design System v3", icon: Palette, progress: 72, role: "owner", color: "indigo" },
        { id: "proj-2", name: "API Gateway", icon: Shield, progress: 45, role: "member", color: "rose" },
        { id: "proj-3", name: "Mobile App", icon: Rocket, progress: 88, role: "admin", color: "emerald" },
        { id: "proj-4", name: "AI Assistant", icon: Sparkles, progress: 30, role: "member", color: "amber" },
        { id: "proj-5", name: "Platform Infra", icon: Layers, progress: 60, role: "admin", color: "sky" },
    ];
    // Assign 3-4 projects to the user
    return allProjects.slice(0, 4);
}

const ROLE_CONFIG: Record<ProjectRole, { label: string; icon: React.ElementType; accent: string; bg: string }> = {
    owner: { label: "Owner", icon: Crown, accent: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 ring-amber-400/30" },
    admin: { label: "Admin", icon: Shield, accent: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10 ring-indigo-400/30" },
    member: { label: "Member", icon: User, accent: "text-muted-foreground", bg: "bg-foreground/[0.04] ring-foreground/10" },
};

// ── Progress Ring ──────────────────────────────────────
function MiniProgressRing({ progress, size = 44, strokeWidth = 3.5 }: { progress: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
                    className="text-foreground/[0.06] dark:text-white/[0.08]" />
                <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#profileGrad)" strokeWidth={strokeWidth}
                    strokeLinecap="round" strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
                <defs>
                    <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(239, 84%, 67%)" />
                        <stop offset="100%" stopColor="hsl(270, 84%, 67%)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold font-mono text-foreground">{progress}%</span>
            </div>
        </div>
    );
}

// ── Editable Field ─────────────────────────────────────
function EditableField({
    label,
    value,
    icon: Icon,
    onSave,
    placeholder,
    multiline,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    onSave: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const save = () => {
        const value = draft.trim();
        if (!value && label === "Full Name") {
            toast.error("Name cannot be empty");
            return;
        }
        onSave(value);
        setEditing(false);
        toast.success(`${label} updated`);
    };

    return (
        <div className="
      flex items-start gap-4 px-5 py-4 rounded-2xl
      bg-foreground/[0.02] dark:bg-white/[0.03]
      ring-1 ring-black/[0.03] dark:ring-white/[0.06]
      backdrop-blur-xl transition-all duration-300
      hover:ring-primary/10
    ">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
                {editing ? (
                    <div className="flex gap-2">
                        {multiline ? (
                            <textarea
                                autoFocus
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === "Escape") setEditing(false); }}
                                rows={3}
                                placeholder={placeholder}
                                className="
                  flex-1 px-3 py-2 rounded-xl text-sm
                  bg-foreground/[0.04] dark:bg-white/[0.06]
                  text-foreground placeholder:text-muted-foreground/40
                  ring-1 ring-primary/20 outline-none resize-none
                  transition-all duration-200
                "
                            />
                        ) : (
                            <input
                                autoFocus
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
                                placeholder={placeholder}
                                className="
                  flex-1 px-3 py-2 rounded-xl text-sm
                  bg-foreground/[0.04] dark:bg-white/[0.06]
                  text-foreground placeholder:text-muted-foreground/40
                  ring-1 ring-primary/20 outline-none
                  transition-all duration-200
                "
                            />
                        )}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={save}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                            <Check className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
                        <p className={`text-sm ${value ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
                            {value || placeholder || "Not set"}
                        </p>
                        <Pencil className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Avatar Upload ──────────────────────────────────────
function AvatarSection({ user, onUpdateAvatar }: { user: UserType; onUpdateAvatar: (url: string) => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const initials = user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onUpdateAvatar(reader.result);
                toast.success("Avatar updated");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="
            w-28 h-28 rounded-[2rem] overflow-hidden
            bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600
            shadow-[0_0_30px_rgba(99,102,241,0.3)]
            dark:shadow-[0_0_40px_rgba(99,102,241,0.4)]
            flex items-center justify-center
            ring-4 ring-background
          "
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black text-white tracking-tighter">{initials}</span>
                    )}
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileRef.current?.click()}
                    className="
            absolute -bottom-1 -right-1 w-9 h-9 rounded-full
            bg-white dark:bg-neutral-900
            ring-2 ring-background
            shadow-[0_4px_16px_rgba(0,0,0,0.12)]
            dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]
            flex items-center justify-center
            text-muted-foreground hover:text-primary
            transition-colors duration-200
          "
                >
                    <Camera className="w-4 h-4" />
                </motion.button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black tracking-tighter text-foreground">{user.fullName}</h2>
                {user.jobTitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{user.jobTitle}</p>
                )}
                <p className="text-xs text-muted-foreground/50 font-mono mt-1">{user.email}</p>
            </div>
        </div>
    );
}

// ── Project Card ───────────────────────────────────────
function ProjectRoleCard({ project }: { project: UserProject }) {
    const Icon = project.icon;
    const rc = ROLE_CONFIG[project.role];
    const RoleIcon = rc.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="
        rounded-[2rem] p-5 cursor-default
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
        shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06),0_6px_20px_-6px_rgba(0,0,0,0.03)]
        dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5),0_0_24px_rgba(99,102,241,0.04)]
        transition-shadow duration-500
        flex items-center gap-4
      "
        >
            <div className="w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0
        shadow-[0_0_16px_rgba(99,102,241,0.12)] dark:shadow-[0_0_16px_rgba(99,102,241,0.2)]">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold tracking-tight text-foreground truncate">{project.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ring-1 ${rc.bg} ${rc.accent}`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {rc.label}
                    </span>
                </div>
            </div>
            <MiniProgressRing progress={project.progress} />
        </motion.div>
    );
}

// ── Stats Row ──────────────────────────────────────────
function StatsRow({ projects }: { projects: UserProject[] }) {
    const totalTasks = 25;
    const completedTasks = 18;
    const avgProgress = projects.length
        ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)
        : 0;

    const stats = [
        { label: "Projects", value: projects.length, sublabel: "active" },
        { label: "Avg Progress", value: `${avgProgress}%`, sublabel: "across all" },
        { label: "Tasks Done", value: `${completedTasks}/${totalTasks}`, sublabel: "this sprint" },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="
            rounded-2xl p-4 text-center
            bg-foreground/[0.02] dark:bg-white/[0.03]
            ring-1 ring-black/[0.03] dark:ring-white/[0.06]
            backdrop-blur-xl
          "
                >
                    <p className="text-2xl font-black tracking-tighter text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
            ))}
        </div>
    );
}

// ── Main Profile Page ──────────────────────────────────
export default function ProfilePage() {
    const { user, updateProfile, logout } = useAuth();
    const { resetProjects } = useProjectData();
    const navigate = useNavigate();

    if (!user) return null;

    const projects = getUserProjects(user.email);

    const handleLogout = () => {
        resetProjects();
        logout();
        navigate("/auth");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="
          rounded-[2.5rem] p-8
          bg-white/60 dark:bg-white/[0.04]
          backdrop-blur-[40px] border-[0.5px] border-black/5 dark:border-white/20
          shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_8px_24px_-8px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.4)]
          dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)]
        "
            >
                <AvatarSection user={user} onUpdateAvatar={(url) => updateProfile({ avatarUrl: url })} />
            </motion.div>

            {/* Stats */}
            <StatsRow projects={projects} />

            {/* Editable fields */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
            >
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
                    Profile Details
                </h3>
                <EditableField label="Full Name" value={user.fullName} icon={User} placeholder="Your name"
                    onSave={(v) => updateProfile({ fullName: v })} />
                <EditableField label="Job Title" value={user.jobTitle || ""} icon={Briefcase} placeholder="e.g. Frontend Developer"
                    onSave={(v) => updateProfile({ jobTitle: v })} />
                <EditableField label="Bio" value={user.bio || ""} icon={FileText} placeholder="Tell us about yourself..." multiline
                    onSave={(v) => updateProfile({ bio: v })} />
                {/* Email is the account identifier — show read-only */}
                <div className="
                  flex items-start gap-4 px-5 py-4 rounded-2xl
                  bg-foreground/[0.02] dark:bg-white/[0.03]
                  ring-1 ring-black/[0.03] dark:ring-white/[0.06]
                  backdrop-blur-xl
                ">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">Email</p>
                        <p className="text-sm text-foreground">{user.email}</p>
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5">Account email cannot be changed</p>
                    </div>
                </div>
            </motion.div>

            {/* Projects & Roles */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
            >
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
                    Assigned Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projects.map((p, i) => (
                        <motion.div key={p.id} transition={{ delay: 0.3 + i * 0.06 }}>
                            <ProjectRoleCard project={p} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Logout */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pb-8"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="
            w-full py-3.5 rounded-2xl text-sm font-semibold
            bg-destructive/[0.06] dark:bg-destructive/[0.08]
            text-destructive hover:bg-destructive/[0.12]
            ring-1 ring-destructive/10
            transition-all duration-300
            flex items-center justify-center gap-2
          "
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
