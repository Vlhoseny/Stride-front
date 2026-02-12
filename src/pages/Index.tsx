import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProjectDashboard from "@/components/ProjectDashboard";
import ChronosTimeline from "@/components/ChronosTimeline";
import ProgressBentoCard from "@/components/ProgressBentoCard";
import DailyFocusedView from "@/components/DailyFocusedView";
import ProjectNotes from "@/components/ProjectNotes";
import ProjectSettingsOverlay, { type ProjectSettings } from "@/components/ProjectSettings";
import { useSettingsContext } from "@/components/SettingsContext";
import { useProjectData } from "@/components/ProjectDataContext";

// ── Default per-project settings ───────────────────────
function buildDefaultSettings(projectId: string, name: string, iconName: string): ProjectSettings {
  const tagSets: Record<string, ProjectSettings["tags"]> = {
    "proj-1": [
      { id: "t1", label: "Design", color: "indigo" },
      { id: "t2", label: "Priority", color: "rose" },
      { id: "t3", label: "UX", color: "amber" },
    ],
    "proj-2": [
      { id: "t4", label: "Backend", color: "emerald" },
      { id: "t5", label: "Security", color: "rose" },
      { id: "t6", label: "Feature", color: "sky" },
    ],
    "proj-3": [
      { id: "t7", label: "Mobile", color: "sky" },
      { id: "t8", label: "Offline", color: "amber" },
    ],
  };

  const memberSets: Record<string, ProjectSettings["members"]> = {
    "proj-1": [
      { id: "m1", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "owner" },
      { id: "m2", initials: "MJ", name: "Maya Jones", color: "bg-violet-500", role: "admin" },
      { id: "m3", initials: "RL", name: "Ryan Lee", color: "bg-sky-500", role: "member" },
    ],
    "proj-2": [
      { id: "m4", initials: "SC", name: "Sam Chen", color: "bg-emerald-500", role: "owner" },
      { id: "m5", initials: "MJ", name: "Maya Jones", color: "bg-violet-500", role: "member" },
    ],
    "proj-3": [
      { id: "m6", initials: "RL", name: "Ryan Lee", color: "bg-sky-500", role: "owner" },
      { id: "m7", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "admin" },
      { id: "m8", initials: "TW", name: "Taylor Wu", color: "bg-amber-500", role: "member" },
      { id: "m9", initials: "SC", name: "Sam Chen", color: "bg-emerald-500", role: "member" },
    ],
  };

  return {
    projectId,
    name,
    iconName,
    accentColor: "indigo",
    tags: tagSets[projectId] || [{ id: "td1", label: "General", color: "indigo" }],
    members: memberSets[projectId] || [
      { id: "md1", initials: "AK", name: "Alex Kim", color: "bg-indigo-500", role: "owner" },
    ],
  };
}

const PROJECT_NAMES: Record<string, { name: string; icon: string }> = {
  "proj-1": { name: "Design System v3", icon: "Palette" },
  "proj-2": { name: "API Gateway", icon: "Shield" },
  "proj-3": { name: "Mobile App", icon: "Rocket" },
  "proj-4": { name: "AI Assistant", icon: "Sparkles" },
  "proj-5": { name: "Platform Infra", icon: "Layers" },
};

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settingsRequested, clearSettingsRequest } = useSettingsContext();
  const { getProject } = useProjectData();

  // Open settings when sidebar gear is clicked
  useEffect(() => {
    if (settingsRequested && selectedProject) {
      setSettingsOpen(true);
      clearSettingsRequest();
    } else if (settingsRequested) {
      clearSettingsRequest();
    }
  }, [settingsRequested, selectedProject, clearSettingsRequest]);

  // Per-project settings store
  const [allSettings, setAllSettings] = useState<Record<string, ProjectSettings>>({});

  const getSettings = useCallback(
    (projectId: string): ProjectSettings => {
      if (allSettings[projectId]) return allSettings[projectId];
      const proj = getProject(projectId);
      const info = proj
        ? { name: proj.name, icon: proj.iconName }
        : (PROJECT_NAMES[projectId] || { name: "Project", icon: "Layers" });
      return buildDefaultSettings(projectId, info.name, info.icon);
    },
    [allSettings, getProject]
  );

  const updateSettings = useCallback(
    (s: ProjectSettings) => {
      setAllSettings((prev) => ({ ...prev, [s.projectId]: s }));
    },
    []
  );

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectDashboard onSelectProject={setSelectedProject} />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            className="flex flex-col gap-8"
          >
            {/* Back button + Settings */}
            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedProject(null)}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  text-xs font-semibold text-muted-foreground
                  bg-foreground/[0.03] dark:bg-white/[0.04]
                  backdrop-blur-xl ring-1 ring-white/10
                  hover:text-foreground
                  transition-colors duration-200
                "
              >
                ← All Projects
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSettingsOpen(true)}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  text-xs font-semibold text-muted-foreground
                  bg-foreground/[0.03] dark:bg-white/[0.04]
                  backdrop-blur-xl ring-1 ring-white/10
                  hover:text-foreground
                  transition-colors duration-200
                  ml-auto
                "
              >
                ⚙ Settings
              </motion.button>
            </div>

            {/* Bento Grid Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ChronosTimeline />
              </div>
              <div>
                <ProgressBentoCard />
              </div>
            </div>

            {/* Daily Focused View */}
            <DailyFocusedView />

            {/* Project Notes */}
            <ProjectNotes projectId={selectedProject} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Settings Overlay */}
      {selectedProject && (
        <ProjectSettingsOverlay
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={getSettings(selectedProject)}
          onUpdateSettings={updateSettings}
        />
      )}
    </LayoutGroup>
  );
};

export default Index;
