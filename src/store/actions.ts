import type { AppState, Project, Ticket, ViewId } from "../types";

export const A = {
  HYDRATE:            "HYDRATE",
  ADD_TICKET:         "ADD_TICKET",
  UPDATE_TICKET:      "UPDATE_TICKET",
  DELETE_TICKET:      "DELETE_TICKET",
  MOVE_TICKET:        "MOVE_TICKET",
  UPDATE_PROJECT:     "UPDATE_PROJECT",
  RESET_PROJECT_DATA: "RESET_PROJECT_DATA",
  SET_VIEW:           "SET_VIEW",
} as const;

type HydrateAction = {
  type: typeof A.HYDRATE;
  payload: AppState;
};

// Callers never set identity, ordering, or timestamps.
// The reducer stamps id, key, order, createdAt, updatedAt.
type AddTicketAction = {
  type: typeof A.ADD_TICKET;
  payload: Omit<Ticket, "id" | "key" | "order" | "createdAt" | "updatedAt">;
};

// statusId and order are excluded on purpose: a ticket's column and position
// change only through MOVE_TICKET, which reindexes both columns.
type UpdateTicketAction = {
  type: typeof A.UPDATE_TICKET;
  payload: {
    id: string;
    patch: Partial<
      Omit<
        Ticket,
        "id" | "key" | "projectId" | "statusId" | "order" | "createdAt" | "updatedAt"
      >
    >;
  };
};

type DeleteTicketAction = {
  type: typeof A.DELETE_TICKET;
  payload: string; // ticketId
};

type MoveTicketAction = {
  type: typeof A.MOVE_TICKET;
  payload: {
    ticketId: string;
    targetStatusId: string;
    insertBeforeId: string | null; // null = end of the target column
  };
};

type UpdateProjectAction = {
  type: typeof A.UPDATE_PROJECT;
  payload: Partial<Omit<Project, "id" | "key" | "createdAt" | "updatedAt">>;
};

type ResetProjectDataAction = {
  type: typeof A.RESET_PROJECT_DATA;
  payload: string; // projectId
};

type SetViewAction = {
  type: typeof A.SET_VIEW;
  payload: ViewId;
};

// The reducer's switch is exhaustive against this union.
export type AppAction =
  | HydrateAction
  | AddTicketAction
  | UpdateTicketAction
  | DeleteTicketAction
  | MoveTicketAction
  | UpdateProjectAction
  | ResetProjectDataAction
  | SetViewAction;