import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, Paintbrush, FolderKanban } from "lucide-react";
import { useTheme, type AccentColor } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import { useNotifications, NotificationFlyout } from "./NotificationSystem";
import { useProjectData } from "./ProjectDataContext";
import { Link, useNavigate } from "react-router-dom";

const ACCENT_OPTIONS: { name: AccentColor; swatch: string }[] = [
  { name: "indigo", swatch: "bg-indigo-500" },
  { name: "rose", swatch: "bg-rose-500" },
  { name: "emerald", swatch: "bg-emerald-500" },
  { name: "amber", swatch: "bg-amber-500" },
  { name: "sky", swatch: "bg-sky-500" },
  { name: "violet", swatch: "bg-violet-500" },
];

export function DashboardHeader() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { projects } = useProjectData();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const initials = user?.fullName?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "??";
  const activeProjectCount = projects.filter((p) => p.status !== "completed").length;

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, projects]);

  const showSearch = searchFocused && searchQuery.trim().length > 0;

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 gap-3">
      {/* Workspace */}
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-black tracking-tighter text-foreground truncate">
          {user?.fullName ? `${user.fullName.split(" ")[0]}'s Workspace` : "STRIDE"}
        </h1>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          {activeProjectCount} active project{activeProjectCount !== 1 && "s"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Search — hidden on small mobile */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="h-9 w-40 md:w-56 rounded-2xl glass pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:shadow-neon transition-premium"
            aria-label="Search projects"
          />
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-12 left-0 right-0 z-50 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-[48px] border border-black/5 dark:border-white/10 shadow-elevated overflow-hidden"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">No projects found</div>
                ) : (
                  searchResults.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => { e.preventDefault(); setSearchQuery(""); setSearchFocused(false); navigate("/dashboard"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/[0.04] dark:hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <FolderKanban className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accent color picker */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setAccentOpen((v) => !v)}
            className="w-9 h-9 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-premium"
            aria-label="Change accent color"
          >
            <Paintbrush className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {accentOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40"
                  onClick={() => setAccentOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="
                    absolute right-0 top-12 z-50 p-3 rounded-2xl
                    bg-white/80 dark:bg-black/80
                    backdrop-blur-[60px] border border-black/5 dark:border-white/10
                    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]
                    dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]
                  "
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 px-1">Accent</p>
                  <div className="flex gap-2">
                    {ACCENT_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => { setAccent(c.name); setAccentOpen(false); }}
                        className={`w-7 h-7 rounded-full ${c.swatch} transition-all ${accent === c.name ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "opacity-60 hover:opacity-100"}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-premium"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-premium"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-neon"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          <NotificationFlyout open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Profile Avatar */}
        <Link to="/profile">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="
              w-9 h-9 rounded-full overflow-hidden cursor-pointer
              bg-gradient-to-br from-primary via-primary/80 to-primary
              flex items-center justify-center
              ring-2 ring-background
              shadow-neon
            "
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-white">{initials}</span>
            )}
          </motion.div>
        </Link>
      </div>
    </header>
  );
}
