import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, FolderKanban, Users, BarChart3, Settings } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const navItems = [
  { title: "Projects", icon: FolderKanban, path: "/" },
  { title: "Team", icon: Users, path: "/team" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
];

interface DashboardSidebarProps {
  onOpenSettings?: () => void;
}

export function DashboardSidebar({ onOpenSettings }: DashboardSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      className="fixed left-4 top-4 bottom-4 z-50 glass rounded-3xl flex flex-col py-6 overflow-hidden"
      initial={false}
      animate={{ width: expanded ? 256 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center px-5 mb-10">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-neon">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <motion.span
          className="ml-3 text-lg font-black tracking-tighter text-foreground whitespace-nowrap overflow-hidden"
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Dashboard
        </motion.span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.title}
              to={item.path}
              className={`
                relative flex items-center h-11 rounded-2xl px-3 transition-premium
                ${isActive
                  ? "text-primary shadow-neon"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-2xl bg-primary/10 shadow-inner-glow"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
              <motion.span
                className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.title}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      {onOpenSettings && (
        <div className="px-3 pb-2">
          <button
            onClick={onOpenSettings}
            className="
              relative flex items-center h-11 w-full rounded-2xl px-3 transition-premium
              text-muted-foreground hover:text-foreground
            "
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <motion.span
              className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
              animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Settings
            </motion.span>
          </button>
        </div>
      )}
    </motion.aside>
  );
}
