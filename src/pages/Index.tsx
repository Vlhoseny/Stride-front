import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProjectDashboard from "@/components/ProjectDashboard";
import ChronosTimeline from "@/components/ChronosTimeline";
import ProgressBentoCard from "@/components/ProgressBentoCard";
import DailyFocusedView from "@/components/DailyFocusedView";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

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
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedProject(null)}
              className="
                self-start flex items-center gap-2 px-4 py-2 rounded-full
                text-xs font-semibold text-muted-foreground
                bg-foreground/[0.03] dark:bg-white/[0.04]
                backdrop-blur-xl ring-1 ring-white/10
                hover:text-foreground
                transition-colors duration-200
              "
            >
              ← All Projects
            </motion.button>

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
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

export default Index;
