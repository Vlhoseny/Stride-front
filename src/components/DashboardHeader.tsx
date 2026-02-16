import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, Paintbrush, EyeOff } from "lucide-react";
import { useTheme, type AccentColor } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import { useNotifications, NotificationFlyout } from "./NotificationSystem";
import { useProjectData } from "./ProjectDataContext";
import { useCommandPalette } from "./CommandPalette";
import { useStealth } from "./StealthMode";
import { useOS } from "@/hooks/use-os";
import { Link } from "react-router-dom";

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
  const { openPalette } = useCommandPalette();
  const { isStealthMode, toggleStealth } = useStealth();
  const { shortcut } = useOS();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);

  // Close accent picker / notifications on Escape
  useEffect(() => {
    if (!accentOpen && !notifOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccentOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [accentOpen, notifOpen]);

  const initials = user?.fullName?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "??";
  const activeProjectCount = projects.filter((p) => p.status !== "completed").length;

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 gap-3">
      {/* Workspace */}
      <div className="min-w-0">
        <h1 className="stealth-blur text-base md:text-lg font-black tracking-tighter text-foreground truncate">
          {user?.fullName ? `${user.fullName.split(" ")[0]}'s Workspace` : "STRIDE"}
        </h1>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          {activeProjectCount} active project{activeProjectCount !== 1 && "s"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Stealth mode badge */}
        <AnimatePresence>
          {isStealthMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleStealth}
              id="onboarding-stealth-badge"
              className="h-9 px-2.5 rounded-2xl flex items-center gap-1.5 bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold transition-premium"
              title="Stealth Mode active — click to disable"
            >
              <EyeOff className="w-3 h-3" />
              <span className="hidden sm:inline">Stealth</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Command palette trigger — replaces old search */}
        <motion.button
          id="onboarding-command-palette"
          whileTap={{ scale: 0.9 }}
          onClick={openPalette}
          className="h-9 px-3 rounded-2xl glass flex items-center gap-2 text-muted-foreground hover:text-foreground transition-premium"
          aria-label="Open command palette"
          title={`Command Palette (${shortcut("K")})`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs text-muted-foreground/50">Search…</span>
          <kbd className="hidden md:inline text-[10px] font-mono font-semibold text-muted-foreground/40 bg-foreground/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-foreground/[0.06] dark:border-white/[0.06]">{shortcut("K")}</kbd>
        </motion.button>

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
                        className={`w-7 h-7 rounded-full ${c.swatch} transition-all active:scale-[0.88] ${accent === c.name ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "opacity-60 hover:opacity-100"}`}
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
