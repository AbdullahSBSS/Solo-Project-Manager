// types/epic.types.ts
export interface Epic {
  id: string;
  title: string;
  description: string;
  color: string;
  projectId: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}