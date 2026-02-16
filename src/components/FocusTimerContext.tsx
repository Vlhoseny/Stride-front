import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";

// ── Types ──────────────────────────────────────────────
export type TimerMode = "focus" | "short-break" | "long-break";
export type TimerStatus = "idle" | "running" | "paused";

export const MODE_DURATIONS: Record<TimerMode, number> = {
    focus: 25 * 60,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
};

export const MODE_LABELS: Record<TimerMode, string> = {
    focus: "Focus",
    "short-break": "Short Break",
    "long-break": "Long Break",
};

interface FocusTimerState {
    isOpen: boolean;
    minimized: boolean;
    taskTitle: string;
    mode: TimerMode;
    status: TimerStatus;
    timeLeft: number;
    /** Unix ms when timer was last started/resumed — for drift-proof restore */
    startedAt: number | null;
}

interface FocusTimerContextType extends FocusTimerState {
    openTimer: (title: string) => void;
    closeTimer: () => void;
    minimize: () => void;
    restore: () => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
    setMode: (m: TimerMode) => void;
}

const STORAGE_KEY = "stride_focus_timer";

// ── Persistence helpers ────────────────────────────────
function loadState(): Partial<FocusTimerState> | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveState(s: FocusTimerState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch { /* quota */ }
}

// ── Audio ding (Web Audio API) ─────────────────────────
export function playDing() {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(830, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
    } catch { /* web audio not available */ }
}

// ── Defaults ───────────────────────────────────────────
const DEFAULT_STATE: FocusTimerState = {
    isOpen: false,
    minimized: false,
    taskTitle: "",
    mode: "focus",
    status: "idle",
    timeLeft: MODE_DURATIONS.focus,
    startedAt: null,
};

const FocusTimerContext = createContext<FocusTimerContextType>({
    ...DEFAULT_STATE,
    openTimer: () => { },
    closeTimer: () => { },
    minimize: () => { },
    restore: () => { },
    play: () => { },
    pause: () => { },
    reset: () => { },
    setMode: () => { },
});

// ── Provider ───────────────────────────────────────────
export function FocusTimerProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FocusTimerState>(() => {
        const saved = loadState();
        if (!saved) return DEFAULT_STATE;

        const mode = saved.mode ?? "focus";
        let timeLeft = saved.timeLeft ?? MODE_DURATIONS[mode];

        // Reconstruct elapsed time if running when page closed
        if (saved.status === "running" && saved.startedAt) {
            const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
            timeLeft = Math.max(0, timeLeft - elapsed);
        }

        return {
            isOpen: saved.isOpen ?? false,
            minimized: saved.minimized ?? false,
            taskTitle: saved.taskTitle ?? "",
            mode,
            status: timeLeft <= 0 ? "idle" : (saved.status ?? "idle"),
            timeLeft: timeLeft <= 0 ? MODE_DURATIONS[mode] : timeLeft,
            startedAt: saved.status === "running" && timeLeft > 0 ? Date.now() : null,
        };
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Persist on every state change
    useEffect(() => { saveState(state); }, [state]);

    // Tick logic
    useEffect(() => {
        if (state.status === "running") {
            intervalRef.current = setInterval(() => {
                setState((prev) => {
                    if (prev.timeLeft <= 1) {
                        playDing();
                        try {
                            if (Notification.permission === "granted") {
                                new Notification("Timer complete! 🎉", {
                                    body: prev.mode === "focus"
                                        ? `Great focus on "${prev.taskTitle}". Time for a break!`
                                        : "Break's over — ready to focus again?",
                                });
                            }
                        } catch { /* */ }
                        return { ...prev, status: "idle", timeLeft: 0, startedAt: null };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        };
    }, [state.status]);

    // ── Actions ────────────────────────────────────────
    const openTimer = useCallback((title: string) => {
        setState((prev) => ({
            ...prev,
            isOpen: true,
            minimized: false,
            taskTitle: title,
            ...(prev.status === "idle" ? { timeLeft: MODE_DURATIONS[prev.mode], startedAt: null } : {}),
        }));
    }, []);

    const closeTimer = useCallback(() => {
        setState((prev) => ({
            ...prev, isOpen: false, minimized: false, status: "idle",
            timeLeft: MODE_DURATIONS[prev.mode], startedAt: null,
        }));
    }, []);

    const minimize = useCallback(() => setState((p) => ({ ...p, minimized: true })), []);
    const restore = useCallback(() => setState((p) => ({ ...p, minimized: false })), []);

    const play = useCallback(() => {
        try { if (Notification.permission === "default") Notification.requestPermission(); } catch { /**/ }
        setState((prev) => ({
            ...prev,
            status: "running",
            startedAt: Date.now(),
            timeLeft: prev.timeLeft === 0 ? MODE_DURATIONS[prev.mode] : prev.timeLeft,
        }));
    }, []);

    const pause = useCallback(() => setState((p) => ({ ...p, status: "paused", startedAt: null })), []);

    const reset = useCallback(() => {
        setState((p) => ({ ...p, status: "idle", timeLeft: MODE_DURATIONS[p.mode], startedAt: null }));
    }, []);

    const setModeAction = useCallback((m: TimerMode) => {
        setState((p) => ({ ...p, mode: m, status: "idle", timeLeft: MODE_DURATIONS[m], startedAt: null }));
    }, []);

    const value = useMemo<FocusTimerContextType>(() => ({
        ...state, openTimer, closeTimer, minimize, restore, play, pause, reset, setMode: setModeAction,
    }), [state, openTimer, closeTimer, minimize, restore, play, pause, reset, setModeAction]);

    return (
        <FocusTimerContext.Provider value={value}>
            {children}
        </FocusTimerContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────
export function useFocusTimer() {
    return useContext(FocusTimerContext);
}
