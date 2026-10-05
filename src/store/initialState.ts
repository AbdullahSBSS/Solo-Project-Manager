import type { AppState, StatusConfig } from "../types";
import { MigrationService } from "../services/migration.service";
import { now } from "../utils/id.utils";

export const DEFAULT_PROJECT_ID = "proj-1";

export function createInitialState(): AppState {
  const ts = now();
  const projectId = DEFAULT_PROJECT_ID;

  const statuses: StatusConfig[] = [
    { id: "sc-todo",     name: "To Do",       color: "#888780", category: "todo",        order: 0, projectId },
    { id: "sc-progress", name: "In Progress", color: "#378ADD", category: "in_progress", order: 1, projectId },
    { id: "sc-review",   name: "In Review",   color: "#EF9F27", category: "in_progress", order: 2, projectId },
    { id: "sc-done",     name: "Done",        color: "#639922", category: "done",        order: 3, projectId },
  ];

  return {
    version: MigrationService.getCurrentVersion(),
    projects: {
      [projectId]: {
        id: projectId,
        key: "SPM",
        name: "My Project",
        description: "",
        settings: { defaultStatusId: "sc-todo" },
        createdAt: ts,
        updatedAt: ts,
      },
    },
    tickets: {},
    statusConfigs: Object.fromEntries(statuses.map(s => [s.id, s])),
    epics: {},
    sprints: {},
    labels: {},
    activeProjectId: projectId,
    ui: { activeView: "board" },
  };
}