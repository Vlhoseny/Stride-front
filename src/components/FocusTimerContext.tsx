import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Types ──────────────────────────────────────────────
interface FocusTimerContextType {
    isOpen: boolean;
    taskTitle: string;
    openTimer: (title: string) => void;
    closeTimer: () => void;
}

const FocusTimerContext = createContext<FocusTimerContextType>({
    isOpen: false,
    taskTitle: "",
    openTimer: () => { },
    closeTimer: () => { },
});

// ── Provider ───────────────────────────────────────────
export function FocusTimerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");

    const openTimer = useCallback((title: string) => {
        setTaskTitle(title);
        setIsOpen(true);
    }, []);

    const closeTimer = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <FocusTimerContext.Provider value={{ isOpen, taskTitle, openTimer, closeTimer }}>
            {children}
        </FocusTimerContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────
export function useFocusTimer() {
    return useContext(FocusTimerContext);
}
