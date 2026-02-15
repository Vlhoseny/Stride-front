// ── useTasks hook ──────────────────────────────────────
// Clean Architecture: Isolates task persistence from the UI.
// Components call this hook instead of ProjectService directly.

import { useState, useEffect, useCallback, useRef } from "react";
import { ProjectService } from "@/api/projectService";
import type { Task, DayColumn } from "@/types";

// ── Week builder (pure function, no side-effects) ──────
function getMondayOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
}

function buildEmptyWeek(): DayColumn[] {
    const monday = getMondayOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return { date, tasks: [] };
    });
}

// ── Sync read from localStorage (for instant first render) ──
function loadSync(projectId: string): DayColumn[] | null {
    try {
        const raw = localStorage.getItem("stride_tasks_" + projectId);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed.map((col: any) => ({
            ...col,
            date: new Date(col.date),
            tasks: Array.isArray(col.tasks) ? col.tasks : [],
        }));
    } catch {
        return null;
    }
}

// ── Persist (fire-and-forget through service layer) ────
function persist(projectId: string, columns: DayColumn[]) {
    ProjectService.saveTasks(projectId, columns).catch(() => {
        /* silent — quota exceeded or service error */
    });
}

/**
 * Hook that owns the task-board state for a given project.
 * Reads from the service layer on mount / project switch
 * and writes back whenever columns change.
 *
 * Returns the same shape DailyFocusedView previously managed inline.
 */
export function useTasks(
    projectId: string | undefined,
    seedWeek: () => DayColumn[],
) {
    const [columns, setColumns] = useState<DayColumn[]>(() => {
        if (projectId) {
            const saved = loadSync(projectId);
            if (saved) return saved;
        }
        return seedWeek();
    });

    // Track the projectId that seeded current state
    const activeProjectRef = useRef(projectId);

    // Persist whenever columns change
    useEffect(() => {
        if (projectId) persist(projectId, columns);
    }, [projectId, columns]);

    // Reset columns when switching projects
    useEffect(() => {
        if (!projectId) return;
        if (projectId === activeProjectRef.current) return; // already loaded
        activeProjectRef.current = projectId;
        const saved = loadSync(projectId);
        setColumns(saved ?? seedWeek());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    return { columns, setColumns } as const;
}
