import { useCallback } from "react";
import { useStore } from "../store/StoreProvider";
import { MigrationService } from "../services/migration.service";
import { dateStamp } from "../utils/date.utils";
import type { AppState } from "../types";

export type ImportResult = { ok: true } | { ok: false; error: string };

const REQUIRED_OBJECTS = [
  "projects", "tickets", "statusConfigs",
  "epics", "sprints", "labels", "ui",
] as const;

function looksLikeAppState(v: unknown): v is AppState {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  if (typeof s.version !== "number") return false;
  if (typeof s.activeProjectId !== "string") return false;
  if (!REQUIRED_OBJECTS.every(k => s[k] && typeof s[k] === "object")) return false;
  return s.activeProjectId in (s.projects as Record<string, unknown>);
}

export function usePersistence() {
  const { state, dispatch } = useStore();

  const exportJson = useCallback((): void => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solo-pm-${dateStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state]);

  // Replaces ALL current data. Callers must confirm with the user first.
  const importJson = useCallback(
    async (file: File): Promise<ImportResult> => {
      try {
        const parsed: unknown = JSON.parse(await file.text());
        if (!looksLikeAppState(parsed)) {
          return { ok: false, error: "This file isn't a valid Solo PM export." };
        }
        dispatch({ type: "HYDRATE", payload: MigrationService.migrate(parsed) });
        return { ok: true };
      } catch {
        return { ok: false, error: "Couldn't read the file as JSON." };
      }
    },
    [dispatch]
  );

  return { exportJson, importJson, schemaVersion: state.version };
}