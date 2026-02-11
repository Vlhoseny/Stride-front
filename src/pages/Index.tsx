import ChronosTimeline from "@/components/ChronosTimeline";
import ProgressBentoCard from "@/components/ProgressBentoCard";
import KanbanBoard from "@/components/KanbanBoard";

const Index = () => (
  <div className="flex flex-col gap-8">
    {/* Bento Grid Top Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ChronosTimeline />
      </div>
      <div>
        <ProgressBentoCard />
      </div>
    </div>

    {/* Kanban Board */}
    <KanbanBoard />
  </div>
);

export default Index;
