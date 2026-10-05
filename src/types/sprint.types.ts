// types/sprint.types.ts
export type SprintStatus = "planned" | "active" | "completed";

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  status: SprintStatus;
  goal: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}