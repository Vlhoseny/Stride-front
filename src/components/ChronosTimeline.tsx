import { useRef, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { CalendarDays } from "lucide-react";

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

/* ── Drag-to-scroll hook for desktop mouse users ──── */
function useDragScroll(ref: React.RefObject<HTMLElement>) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    scrollStart.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, [ref]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 3) hasMoved.current = true;
    ref.current.scrollLeft = scrollStart.current - dx;
  }, [ref]);

  const onMouseUpOrLeave = useCallback(() => {
    if (!ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.removeProperty("user-select");
  }, [ref]);

  /** Suppress click if pointer moved during drag. */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return { onMouseDown, onMouseMove, onMouseUp: onMouseUpOrLeave, onMouseLeave: onMouseUpOrLeave, onClickCapture };
}

export default function ChronosTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getWeekNumber(new Date()), []);
  const [activeWeek, setActiveWeek] = useState(currentWeek);
  const stripX = useMotionValue(0);
  const stripSpring = useSpring(stripX, { stiffness: 600, damping: 20 });
  const drag = useDragScroll(scrollRef as React.RefObject<HTMLElement>);

  const scrollToCurrentWeek = useCallback(() => {
    setActiveWeek(currentWeek);
    if (!scrollRef.current) return;
    const pill = scrollRef.current.querySelector(`[data-week="${currentWeek}"]`) as HTMLElement | null;
    if (pill) {
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentWeek]);

  const handleWeekClick = useCallback((week: number) => {
    setActiveWeek(week);
    // Trigger a spring bounce on the strip
    stripX.set(week > activeWeek ? -6 : 6);
    setTimeout(() => stripX.set(0), 50);
  }, [activeWeek, stripX]);

  const formattedWeek = String(activeWeek).padStart(2, "0");

  return (
    <div className="flex flex-col gap-4">
      {/* Header with dynamic week label */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Chronos
          </h2>
          <div className="overflow-hidden h-7 flex items-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={activeWeek}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-lg font-black tracking-tighter text-foreground font-mono inline-block"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                WEEK {formattedWeek}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

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

      {/* Timeline strip */}
      <motion.div
        ref={scrollRef}
        data-chronos-strip
        style={{ x: stripSpring, scrollbarWidth: "none", cursor: "grab" } as React.CSSProperties & { x: typeof stripSpring }}
        className="flex gap-1 overflow-x-auto py-4 -my-3"
        onMouseDown={drag.onMouseDown}
        onMouseMove={drag.onMouseMove}
        onMouseUp={drag.onMouseUp}
        onMouseLeave={drag.onMouseLeave}
        onClickCapture={drag.onClickCapture}
      >
        <style>{`[data-chronos-strip]::-webkit-scrollbar { display: none; }`}</style>
        {Array.from({ length: 52 }, (_, i) => {
          const week = i + 1;
          const isActive = week === activeWeek;

          return (
            <motion.div
              key={week}
              data-week={week}
              onClick={() => handleWeekClick(week)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.006, duration: 0.25 }}
              className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer select-none"
            >
              {/* Glow layer + solid pill for active week */}
              {isActive && (
                <>
                  {/* Soft radial glow — absolutely positioned, blurred, scales beyond pill */}
                  <motion.div
                    layoutId="chronos-glow"
                    className="absolute inset-0 bg-primary rounded-full blur-[14px] opacity-60 scale-[1.3] -z-10 transition-colors duration-300"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                  {/* Solid active pill */}
                  <motion.div
                    layoutId="chronos-active"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                </>
              )}

              {/* Inactive background */}
              {!isActive && (
                <div className="absolute inset-0 rounded-full bg-foreground/[0.03] dark:bg-white/[0.05] ring-1 ring-foreground/[0.04] dark:ring-white/[0.06]" />
              )}

              <span
                className={`relative z-10 text-[10px] font-mono font-semibold ${isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {week}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
