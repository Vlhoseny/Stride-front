import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useTheme } from "./ThemeProvider";
import { useSettingsContext } from "./SettingsContext";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const { openSettings } = useSettingsContext();

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "mesh-gradient-dark" : "mesh-gradient-light"
        }`}
    >
      <DashboardSidebar onOpenSettings={openSettings} />
      {/* md: has sidebar (pl-20), mobile: no sidebar, has bottom nav (pb-16) */}
      <div className="md:pl-20 pb-16 md:pb-0">
        <DashboardHeader />
        <main className="px-4 pb-6 md:px-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
