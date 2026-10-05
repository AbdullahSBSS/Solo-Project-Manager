import { useCallback, useMemo } from "react";
import { useStore } from "../store/StoreProvider";
import type { Epic, Label, Project, Sprint, StatusConfig } from "../types";

export interface UseProjectReturn {
  // Identity
  project: Project;
  projectId: string;

  // Board structure — sorted by StatusConfig.order
  statusConfigs: StatusConfig[];
  getStatus: (statusId: string) => StatusConfig | undefined;

  // Labels / Sprints / Epics — empty until those features land
  labels: Label[];
  getLabel: (labelId: string) => Label | undefined;
  sprints: Sprint[];
  activeSprint: Sprint | undefined;
  getSprint: (sprintId: string) => Sprint | undefined;
  epics: Epic[];
  getEpic: (epicId: string) => Epic | undefined;

  // Writes
  updateProject: (patch: UpdateProjectInput) => void;
  resetProject: () => void;
}

// The project key is intentionally excluded: changing it would
// invalidate every existing ticket key (SPM-001 → ???-001).
export type UpdateProjectInput = Partial<
  Omit<Project, "id" | "key" | "createdAt" | "updatedAt">
>;

export function useProject(): UseProjectReturn {
  const { state, dispatch } = useStore();
  const projectId = state.activeProjectId;
  const project = state.projects[projectId];

  if (!project) {
    throw new Error(
      `[useProject] no project found for activeProjectId: "${projectId}".`
    );
  }

  const statusConfigs = useMemo<StatusConfig[]>(
    () =>
      Object.values(state.statusConfigs)
        .filter(s => s.projectId === projectId)
        .sort((a, b) => a.order - b.order),
    [state.statusConfigs, projectId]
  );

  const getStatus = useCallback(
    (statusId: string) => state.statusConfigs[statusId],
    [state.statusConfigs]
  );

  const labels = useMemo<Label[]>(
    () =>
      Object.values(state.labels)
        .filter(l => l.projectId === projectId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [state.labels, projectId]
  );

  const getLabel = useCallback(
    (labelId: string) => state.labels[labelId],
    [state.labels]
  );

  const sprints = useMemo<Sprint[]>(
    () =>
      Object.values(state.sprints)
        .filter(s => s.projectId === projectId)
        .sort((a, b) => {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return Date.parse(a.startDate) - Date.parse(b.startDate);
        }),
    [state.sprints, projectId]
  );

  const activeSprint = useMemo<Sprint | undefined>(
    () => sprints.find(s => s.status === "active"),
    [sprints]
  );

  const getSprint = useCallback(
    (sprintId: string) => state.sprints[sprintId],
    [state.sprints]
  );

  const epics = useMemo<Epic[]>(
    () =>
      Object.values(state.epics)
        .filter(e => e.projectId === projectId)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [state.epics, projectId]
  );

  const getEpic = useCallback(
    (epicId: string) => state.epics[epicId],
    [state.epics]
  );

  const updateProject = useCallback(
    (patch: UpdateProjectInput): void => {
      dispatch({ type: "UPDATE_PROJECT", payload: patch });
    },
    [dispatch]
  );

  // Clears tickets, sprints, epics and labels; keeps the project and its columns.
  const resetProject = useCallback((): void => {
    dispatch({ type: "RESET_PROJECT_DATA", payload: projectId });
  }, [dispatch, projectId]);

  return {
    project, projectId,
    statusConfigs, getStatus,
    labels, getLabel,
    sprints, activeSprint, getSprint,
    epics, getEpic,
    updateProject, resetProject,
  };
}