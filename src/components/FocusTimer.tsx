import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X, Timer } from "lucide-react";

// ── Types ──────────────────────────────────────────────
type TimerStatus = "idle" | "running" | "paused";

const DEFAULT_DURATION = 25 * 60; // 25 minutes in seconds

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Focus Timer Widget ─────────────────────────────────
export default function FocusTimer({
  taskTitle,
  onClose,
}: {
  taskTitle: string;
  onClose: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Tick logic — separate from controls so it adapts to status changes cleanly
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer complete
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setStatus("idle");
            // Notify (works in both browser and desktop wrappers)
            try {
              if (Notification.permission === "granted") {
                new Notification("Focus session complete! 🎉", {
                  body: `Great work on "${taskTitle}"`,
                });
              }
            } catch {
              /* notifications not available */
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, taskTitle]);

  const play = useCallback(() => {
    // Request notification permission on first play
    try {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch {
      /* not available */
    }
    if (timeLeft === 0) setTimeLeft(DEFAULT_DURATION);
    setStatus("running");
  }, [timeLeft]);

  const pause = useCallback(() => setStatus("paused"), []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTimeLeft(DEFAULT_DURATION);
  }, []);

  // Derive progress (0→1)
  const progress = 1 - timeLeft / DEFAULT_DURATION;
  const circumference = 2 * Math.PI * 54; // r=54
  const strokeDashoffset = circumference * (1 - progress);

  // Derive ring color based on time remaining
  const ringColor =
    timeLeft > 5 * 60
      ? "stroke-primary"
      : timeLeft > 60
        ? "stroke-amber-500"
        : "stroke-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      drag
      dragMomentum={false}
      className="
        fixed bottom-6 right-6 z-[80]
        w-[220px]
        rounded-3xl overflow-hidden
        bg-white/70 dark:bg-[#0a0a14]/70
        backdrop-blur-[60px]
        border-[0.5px] border-white/30 dark:border-white/[0.08]
        shadow-[0_20px_80px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.05)]
        dark:shadow-[0_20px_80px_-12px_rgba(0,0,0,0.6),0_0_60px_rgba(99,102,241,0.06)]
        cursor-grab active:cursor-grabbing
        select-none
      "
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3 h-3 text-primary/60" />
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
            Focus
          </span>
        </div>
        <button
          onClick={onClose}
          className="
            w-5 h-5 rounded-full flex items-center justify-center
            text-muted-foreground/40 hover:text-foreground
            hover:bg-foreground/[0.06]
            transition-colors duration-150
          "
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Circular timer ── */}
      <div className="flex flex-col items-center px-4 pb-2 pt-1">
        <div className="relative w-[128px] h-[128px] flex items-center justify-center">
          {/* Background ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="4"
              className="stroke-foreground/[0.06] dark:stroke-white/[0.06]"
            />
            {/* Progress ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className={`${ringColor} transition-colors duration-500`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>

          {/* Time display */}
          <div className="flex flex-col items-center z-10">
            <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums font-mono">
              {formatTime(timeLeft)}
            </span>
            {status === "running" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[8px] font-semibold text-primary/60 uppercase tracking-[0.15em] mt-0.5"
              >
                focusing
              </motion.span>
            )}
            {status === "paused" && (
              <span className="text-[8px] font-semibold text-amber-500/70 uppercase tracking-[0.15em] mt-0.5">
                paused
              </span>
            )}
            {status === "idle" && timeLeft === 0 && (
              <span className="text-[8px] font-semibold text-emerald-500/70 uppercase tracking-[0.15em] mt-0.5">
                done!
              </span>
            )}
          </div>
        </div>

        {/* Task title */}
        <p className="text-[10px] text-muted-foreground/50 text-center truncate max-w-full mt-1 px-2">
          {taskTitle}
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-3 px-4 pb-4 pt-1">
        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          disabled={status === "idle" && timeLeft === DEFAULT_DURATION}
          className="
            w-9 h-9 rounded-full flex items-center justify-center
            bg-foreground/[0.04] dark:bg-white/[0.04]
            text-muted-foreground hover:text-foreground
            disabled:opacity-30 disabled:pointer-events-none
            transition-all duration-200
          "
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>

        {/* Play / Pause */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={status === "running" ? pause : play}
          className="
            w-12 h-12 rounded-full flex items-center justify-center
            btn-silk
            shadow-[0_0_20px_rgba(99,102,241,0.25)]
          "
          title={status === "running" ? "Pause" : "Play"}
        >
          {status === "running" ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </motion.button>

        {/* Spacer to keep centered */}
        <div className="w-9 h-9" />
      </div>
    </motion.div>
  );
}
