export const TICKET_TYPES = ["task", "bug", "story", "subtask"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  key: string;                       // "SPM-001"
  projectId: string;
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  statusId: string;                  // → StatusConfig.id
  epicId: string | null;             // → Epic.id
  sprintId: string | null;           // → Sprint.id
  parentId: string | null;           // → Ticket.id (subtasks)
  labelIds: string[];                // → Label.id[]
  order: number;                     // position within its column
  dueDate: string | null;
  estimate: number | null;
  attachments: Attachment[];
  comments: Comment[];
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;                 // stamped by the reducer only
}

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
}