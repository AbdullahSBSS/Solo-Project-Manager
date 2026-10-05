// types/state.types.ts  (new — AppState needs a home that isn't index.ts)
import type { Project, StatusConfig } from "./project.types";
import type { Ticket, Label } from "./ticket.types";
import type { Sprint } from "./sprint.types";
import type { Epic } from "./epic.types";
import type { UIState } from "./ui.types";

export interface AppState {
  version: number;                   // schema version, drives migrations
  projects: Record<string, Project>;
  tickets: Record<string, Ticket>;
  statusConfigs: Record<string, StatusConfig>;
  epics: Record<string, Epic>;
  sprints: Record<string, Sprint>;
  labels: Record<string, Label>;
  activeProjectId: string;
  ui: UIState;
}