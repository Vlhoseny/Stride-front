import { useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

export default function ChronosTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getWeekNumber(new Date()), []);

  const scrollToCurrentWeek = useCallback(() => {
    if (!scrollRef.current) return;
    const pill = scrollRef.current.querySelector(`[data-week="${currentWeek}"]`) as HTMLElement | null;
    if (pill) {
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentWeek]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Chronos Timeline
        </h2>
        <motion.button
          onClick={scrollToCurrentWeek}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold
            bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground
            backdrop-blur-lg ring-1 ring-white/10
            shadow-[0_4px_16px_rgba(99,102,241,0.15)]
            hover:shadow-[0_4px_24px_rgba(99,102,241,0.3)]
            transition-shadow duration-300
          "
        >
          <CalendarDays className="w-3 h-3" />
          Today
        </motion.button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {Array.from({ length: 52 }, (_, i) => {
          const week = i + 1;
          const isActive = week === currentWeek;

          return (
            <motion.div
              key={week}
              data-week={week}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.3 }}
              className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                text-sm font-medium cursor-pointer select-none
                ring-1 ring-white/10
                transition-all duration-300
                ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 text-white font-bold shadow-[0_0_30px_rgba(99,102,241,0.5),0_0_60px_rgba(99,102,241,0.2)] scale-110"
                    : "bg-white/20 dark:bg-white/10 backdrop-blur-lg text-slate-600 dark:text-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-white/30 dark:hover:bg-white/15"
                }
              `}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {week}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
