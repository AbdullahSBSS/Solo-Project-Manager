export type StatusCategory = "todo" | "in_progress" | "done";

export interface StatusConfig {
  id: string;
  name: string;
  color: string;
  category: StatusCategory;
  order: number;
  projectId: string;
}

export interface ProjectSettings {
  defaultStatusId: string | null;
}

export interface Project {
  id: string;
  key: string;                       // immutable after creation
  name: string;
  description: string;
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}