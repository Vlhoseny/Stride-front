import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Check,
  Pencil,
  Crown,
  ShieldCheck,
  User,
  Palette,
  Layers,
  Rocket,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Code,
  Database,
  Terminal,
  Music,
  Camera,
  BookOpen,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type ProjectTag = { id: string; label: string; color: string };
type ProjectMember = {
  id: string;
  initials: string;
  name: string;
  color: string;
  role: "owner" | "admin" | "member";
};

export type ProjectSettings = {
  projectId: string;
  name: string;
  iconName: string;
  accentColor: string;
  tags: ProjectTag[];
  members: ProjectMember[];
};

interface ProjectSettingsOverlayProps {
  open: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  onUpdateSettings: (settings: ProjectSettings) => void;
}

// ── Constants ──────────────────────────────────────────
const TAG_COLORS = [
  { name: "indigo", gradient: "from-indigo-400 to-violet-400" },
  { name: "rose", gradient: "from-rose-400 to-pink-400" },
  { name: "emerald", gradient: "from-emerald-400 to-teal-400" },
  { name: "amber", gradient: "from-amber-400 to-yellow-400" },
  { name: "sky", gradient: "from-sky-400 to-cyan-400" },
  { name: "fuchsia", gradient: "from-fuchsia-400 to-purple-400" },
  { name: "orange", gradient: "from-orange-400 to-red-400" },
  { name: "lime", gradient: "from-lime-400 to-green-400" },
];

const ACCENT_COLORS = [
  { name: "indigo", hsl: "239 84% 67%", swatch: "bg-indigo-500" },
  { name: "violet", hsl: "263 70% 58%", swatch: "bg-violet-500" },
  { name: "rose", hsl: "350 89% 60%", swatch: "bg-rose-500" },
  { name: "emerald", hsl: "160 84% 39%", swatch: "bg-emerald-500" },
  { name: "amber", hsl: "38 92% 50%", swatch: "bg-amber-500" },
  { name: "sky", hsl: "199 89% 48%", swatch: "bg-sky-500" },
  { name: "fuchsia", hsl: "292 84% 61%", swatch: "bg-fuchsia-500" },
  { name: "orange", hsl: "25 95% 53%", swatch: "bg-orange-500" },
];

const ICON_OPTIONS: { name: string; icon: React.ElementType }[] = [
  { name: "Palette", icon: Palette },
  { name: "Layers", icon: Layers },
  { name: "Rocket", icon: Rocket },
  { name: "Sparkles", icon: Sparkles },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Globe", icon: Globe },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Cloud", icon: Cloud },
  { name: "Code", icon: Code },
  { name: "Database", icon: Database },
  { name: "Terminal", icon: Terminal },
  { name: "Music", icon: Music },
  { name: "Camera", icon: Camera },
  { name: "BookOpen", icon: BookOpen },
];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; accent: string }> = {
  owner: { label: "Owner", icon: Crown, accent: "text-amber-500" },
  admin: { label: "Admin", icon: ShieldCheck, accent: "text-indigo-500" },
  member: { label: "Member", icon: User, accent: "text-muted-foreground" },
};

type SettingsTab = "general" | "tags" | "members";

// ── Tag Manager ────────────────────────────────────────
function TagManager({
  tags,
  onChange,
}: {
  tags: ProjectTag[];
  onChange: (tags: ProjectTag[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("indigo");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const addTag = () => {
    if (!newLabel.trim()) return;
    onChange([
      ...tags,
      { id: `tag-${Date.now()}`, label: newLabel.trim(), color: newColor },
    ]);
    setNewLabel("");
  };

  const removeTag = (id: string) => onChange(tags.filter((t) => t.id !== id));

  const startEdit = (tag: ProjectTag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
  };

  const saveEdit = (id: string) => {
    onChange(tags.map((t) => (t.id === id ? { ...t, label: editLabel.trim() || t.label } : t)));
    setEditingId(null);
  };

  const updateColor = (id: string, color: string) => {
    onChange(tags.map((t) => (t.id === id ? { ...t, color } : t)));
  };

  const gradient = (color: string) =>
    TAG_COLORS.find((c) => c.name === color)?.gradient || TAG_COLORS[0].gradient;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Project Tags
      </h3>
      <p className="text-[10px] text-muted-foreground/60">
        Tags are unique to this project and won't affect other projects.
      </p>

      {/* Existing tags */}
      <div className="space-y-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="
                flex items-center gap-3 px-4 py-3 rounded-2xl
                bg-foreground/[0.02] dark:bg-white/[0.03]
                ring-1 ring-white/10 backdrop-blur-xl
              "
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient(tag.color)} shrink-0`} />

              {editingId === tag.id ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={() => saveEdit(tag.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(tag.id); }}
                  className="
                    flex-1 text-xs bg-transparent outline-none
                    text-foreground border-b border-primary/30
                  "
                />
              ) : (
                <span className="flex-1 text-xs font-medium text-foreground">{tag.label}</span>
              )}

              {/* Color picker dots */}
              <div className="flex gap-1">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => updateColor(tag.id, c.name)}
                    className={`
                      w-3 h-3 rounded-full bg-gradient-to-r ${c.gradient}
                      transition-all duration-200
                      ${tag.color === c.name ? "ring-2 ring-primary scale-125" : "opacity-40 hover:opacity-80"}
                    `}
                  />
                ))}
              </div>

              <button onClick={() => startEdit(tag)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => removeTag(tag.id)} className="text-destructive/60 hover:text-destructive transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add new tag */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-1.5">
          {TAG_COLORS.slice(0, 5).map((c) => (
            <button
              key={c.name}
              onClick={() => setNewColor(c.name)}
              className={`
                w-4 h-4 rounded-full bg-gradient-to-r ${c.gradient}
                transition-all duration-200
                ${newColor === c.name ? "ring-2 ring-primary scale-125" : "opacity-40 hover:opacity-80"}
              `}
            />
          ))}
        </div>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
          placeholder="New tag name…"
          className="
            flex-1 px-3 py-2 rounded-xl text-xs
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
          onClick={addTag}
          className="
            w-8 h-8 rounded-full flex items-center justify-center
            bg-primary/10 text-primary hover:bg-primary/20
            transition-colors duration-200
          "
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

// ── Member Management ──────────────────────────────────
function MemberManager({
  members,
  onChange,
}: {
  members: ProjectMember[];
  onChange: (members: ProjectMember[]) => void;
}) {
  const [newName, setNewName] = useState("");

  const addMember = () => {
    if (!newName.trim()) return;
    const initials = newName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colors = ["bg-indigo-500", "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-fuchsia-500"];
    onChange([
      ...members,
      {
        id: `member-${Date.now()}`,
        initials,
        name: newName.trim(),
        color: colors[members.length % colors.length],
        role: "member",
      },
    ]);
    setNewName("");
  };

  const removeMember = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (m?.role === "owner") return;
    onChange(members.filter((x) => x.id !== id));
  };

  const changeRole = (id: string, role: "admin" | "member") => {
    const m = members.find((x) => x.id === id);
    if (m?.role === "owner") return;
    onChange(members.map((x) => (x.id === id ? { ...x, role } : x)));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Project Members
      </h3>
      <p className="text-[10px] text-muted-foreground/60">
        Members added here are specific to this project only.
      </p>

      {/* Members list */}
      <div className="space-y-2">
        <AnimatePresence>
          {members.map((member) => {
            const rc = ROLE_CONFIG[member.role];
            const RoleIcon = rc.icon;
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="
                  flex items-center gap-3 px-4 py-3 rounded-2xl
                  bg-foreground/[0.02] dark:bg-white/[0.03]
                  ring-1 ring-white/10 backdrop-blur-xl
                "
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-[10px] font-bold text-white ${member.color}
                  ring-2 ring-white/80 dark:ring-black/60
                  shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                `}>
                  {member.initials}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-foreground block">{member.name}</span>
                  <span className={`text-[9px] font-semibold flex items-center gap-1 ${rc.accent}`}>
                    <RoleIcon className="w-2.5 h-2.5" />
                    {rc.label}
                  </span>
                </div>

                {member.role !== "owner" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeRole(member.id, member.role === "admin" ? "member" : "admin")}
                      className="
                        px-2 py-1 rounded-lg text-[9px] font-semibold
                        bg-foreground/[0.04] dark:bg-white/[0.06]
                        text-muted-foreground hover:text-foreground
                        transition-colors duration-150
                      "
                    >
                      {member.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-destructive/60 hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add member */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addMember(); }}
          placeholder="Full name…"
          className="
            flex-1 px-3 py-2 rounded-xl text-xs
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
          onClick={addMember}
          className="
            px-3 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-semibold
            bg-primary/10 text-primary hover:bg-primary/20
            transition-colors duration-200
          "
        >
          <Plus className="w-3 h-3" />
          Invite
        </motion.button>
      </div>
    </div>
  );
}

// ── General Settings ───────────────────────────────────
function GeneralSettings({
  settings,
  onChange,
}: {
  settings: ProjectSettings;
  onChange: (updates: Partial<ProjectSettings>) => void;
}) {
  const currentIcon = ICON_OPTIONS.find((i) => i.name === settings.iconName) || ICON_OPTIONS[0];
  const CurrentIconComp = currentIcon.icon;

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Project Name
        </h3>
        <input
          value={settings.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="
            w-full px-4 py-3 rounded-2xl text-sm font-semibold
            bg-foreground/[0.02] dark:bg-white/[0.03]
            ring-1 ring-white/10 backdrop-blur-xl
            text-foreground outline-none focus:ring-primary/20
            transition-all duration-200
          "
        />
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Project Icon
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-primary/10 dark:bg-primary/15
            shadow-[0_0_20px_rgba(99,102,241,0.15)]
          ">
            <CurrentIconComp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">{currentIcon.name}</span>
        </div>
        <div className="grid grid-cols-9 gap-2">
          {ICON_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isActive = settings.iconName === opt.name;
            return (
              <motion.button
                key={opt.name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange({ iconName: opt.name })}
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  ${isActive
                    ? "bg-primary/15 ring-1 ring-primary/40 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    : "bg-foreground/[0.03] dark:bg-white/[0.04] text-muted-foreground hover:text-foreground ring-1 ring-white/10"
                  }
                `}
              >
                <IconComp className="w-4 h-4" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Accent Color
        </h3>
        <div className="flex gap-3">
          {ACCENT_COLORS.map((c) => {
            const isActive = settings.accentColor === c.name;
            return (
              <motion.button
                key={c.name}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange({ accentColor: c.name })}
                className={`
                  w-8 h-8 rounded-full ${c.swatch}
                  transition-all duration-200
                  ${isActive
                    ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110 shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                    : "opacity-50 hover:opacity-80"
                  }
                `}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Overlay ──────────────────────────────
export default function ProjectSettingsOverlay({
  open,
  onClose,
  settings,
  onUpdateSettings,
}: ProjectSettingsOverlayProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const handleUpdateGeneral = useCallback(
    (updates: Partial<ProjectSettings>) => {
      onUpdateSettings({ ...settings, ...updates });
    },
    [settings, onUpdateSettings]
  );

  const handleUpdateTags = useCallback(
    (tags: ProjectTag[]) => {
      onUpdateSettings({ ...settings, tags });
    },
    [settings, onUpdateSettings]
  );

  const handleUpdateMembers = useCallback(
    (members: ProjectMember[]) => {
      onUpdateSettings({ ...settings, members });
    },
    [settings, onUpdateSettings]
  );

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "tags", label: "Tags" },
    { key: "members", label: "Members" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Overlay Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="
              fixed inset-8 z-[80] flex flex-col
              rounded-[2.5rem] overflow-hidden
              bg-white/70 dark:bg-black/70
              backdrop-blur-[64px]
              ring-1 ring-white/20 dark:ring-white/10
              shadow-[0_32px_100px_-20px_rgba(0,0,0,0.2),0_16px_48px_-12px_rgba(0,0,0,0.1)]
              dark:shadow-[0_32px_100px_-20px_rgba(0,0,0,0.7),0_16px_48px_-12px_rgba(0,0,0,0.5)]
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
              <div>
                <h1 className="text-xl font-black tracking-tighter text-foreground">
                  Project Settings
                </h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {settings.name}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="
                  w-10 h-10 rounded-full flex items-center justify-center
                  bg-foreground/[0.04] dark:bg-white/[0.06]
                  hover:bg-foreground/[0.08] dark:hover:bg-white/[0.1]
                  text-muted-foreground
                  transition-colors duration-200
                "
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-8 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-4 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200
                    ${activeTab === tab.key
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="settingsTab"
                      className="absolute inset-0 rounded-xl bg-primary/[0.08] ring-1 ring-primary/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence mode="wait">
                {activeTab === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GeneralSettings settings={settings} onChange={handleUpdateGeneral} />
                  </motion.div>
                )}
                {activeTab === "tags" && (
                  <motion.div
                    key="tags"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TagManager tags={settings.tags} onChange={handleUpdateTags} />
                  </motion.div>
                )}
                {activeTab === "members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MemberManager members={settings.members} onChange={handleUpdateMembers} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
