import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import { useNotifications, NotificationFlyout } from "./NotificationSystem";
import { Link } from "react-router-dom";

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.fullName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <header className="h-16 flex items-center justify-between px-8">
      {/* Workspace */}
      <div>
        <h1 className="text-lg font-black tracking-tighter text-foreground">Web Portfolio</h1>
        <p className="text-xs text-muted-foreground">3 active projects</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-2xl glass pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:shadow-neon transition-premium"
          />
        </div>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-premium"
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
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]"
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
              bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600
              flex items-center justify-center
              ring-2 ring-background
              shadow-[0_0_12px_rgba(99,102,241,0.25)]
              dark:shadow-[0_0_12px_rgba(99,102,241,0.4)]
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
