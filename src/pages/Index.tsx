import ChronosTimeline from "@/components/ChronosTimeline";
import ProgressBentoCard from "@/components/ProgressBentoCard";
import DailyFocusedView from "@/components/DailyFocusedView";

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

    {/* Daily Focused View */}
    <DailyFocusedView />
  </div>
);

export default Index;
