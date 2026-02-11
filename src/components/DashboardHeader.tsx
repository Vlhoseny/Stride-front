import { motion } from "framer-motion";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();

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
        <button className="relative w-9 h-9 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-premium">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-neon" />
        </button>
      </div>
    </header>
  );
}
