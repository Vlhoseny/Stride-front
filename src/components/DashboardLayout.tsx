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
      className={`min-h-screen ${
        theme === "dark" ? "mesh-gradient-dark" : "mesh-gradient-light"
      }`}
    >
      <DashboardSidebar onOpenSettings={openSettings} />
      <div className="pl-20">
        <DashboardHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
