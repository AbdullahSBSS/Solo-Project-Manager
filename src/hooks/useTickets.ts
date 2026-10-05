import { useCallback, useMemo } from "react";
import { useStore } from "../store/StoreProvider";
import { KeyGeneratorService } from "../services/keyGenerator.service";
import { applyFilters, type TicketFilters } from "../utils/filter.utils";
import type { Priority, Ticket, TicketType } from "../types";

export type { TicketFilters };

export interface UseTicketsReturn {
  // Reads
  all: Ticket[];
  byStatus: (statusId: string, filters?: TicketFilters) => Ticket[];
  filtered: (filters: TicketFilters) => Ticket[];
  byId: (id: string) => Ticket | undefined;
  nextKey: string;
  countByStatus: Record<string, number>;

  // Writes
  createTicket: (input: CreateTicketInput) => void;
  updateTicket: (id: string, patch: UpdateTicketInput) => void;
  deleteTicket: (id: string) => void;
  moveTicket: (move: MoveTicketInput) => void;
}

// id, key, order, createdAt, updatedAt are never passed in.
export type CreateTicketInput = {
  title: string;
  type: TicketType;
  priority: Priority;
  statusId: string;
  description?: string;
  epicId?: string | null;
  sprintId?: string | null;
  labelIds?: string[];
  estimate?: number | null;
  dueDate?: string | null;
};

// Column and position are intentionally not editable here.
// Changing a ticket's status is a move: use moveTicket.
export type UpdateTicketInput = Partial<
  Omit<
    Ticket,
    "id" | "key" | "projectId" | "statusId" | "order" | "createdAt" | "updatedAt"
  >
>;

export type MoveTicketInput = {
  ticketId: string;
  targetStatusId: string;
  insertBeforeId?: string | null; // omitted/null = end of the target column
};

export function useTickets(): UseTicketsReturn {
  const { state, dispatch } = useStore();
  const projectId = state.activeProjectId;

  // Single base collection — every selector filters from this.
  const all = useMemo<Ticket[]>(
    () => Object.values(state.tickets).filter(t => t.projectId === projectId),
    [state.tickets, projectId]
  );

  const countByStatus = useMemo<Record<string, number>>(
    () =>
      all.reduce<Record<string, number>>((acc, t) => {
        acc[t.statusId] = (acc[t.statusId] ?? 0) + 1;
        return acc;
      }, {}),
    [all]
  );

  const nextKey = useMemo(() => KeyGeneratorService.preview(state), [state]);

  // Within a column: drag-and-drop order
  const byStatus = useCallback(
    (statusId: string, filters: TicketFilters = {}): Ticket[] =>
      applyFilters(all.filter(t => t.statusId === statusId), filters)
        .sort((a, b) => a.order - b.order),
    [all]
  );

  // Across the list: most recently updated first
  const filtered = useCallback(
    (filters: TicketFilters): Ticket[] =>
      applyFilters(all, filters).sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      ),
    [all]
  );

  const byId = useCallback(
    (id: string): Ticket | undefined => state.tickets[id],
    [state.tickets]
  );

  const createTicket = useCallback(
    (input: CreateTicketInput): void => {
      dispatch({
        type: "ADD_TICKET",
        payload: {
          ...input,
          projectId,
          description: input.description ?? "",
          epicId:      input.epicId      ?? null,
          sprintId:    input.sprintId    ?? null,
          labelIds:    input.labelIds    ?? [],
          estimate:    input.estimate    ?? null,
          dueDate:     input.dueDate     ?? null,
          parentId:    null,
          attachments: [],
          comments:    [],
          customFields: {},
        },
      });
    },
    [dispatch, projectId]
  );

  const updateTicket = useCallback(
    (id: string, patch: UpdateTicketInput): void => {
      dispatch({ type: "UPDATE_TICKET", payload: { id, patch } });
    },
    [dispatch]
  );

  const deleteTicket = useCallback(
    (id: string): void => {
      dispatch({ type: "DELETE_TICKET", payload: id });
    },
    [dispatch]
  );

  const moveTicket = useCallback(
    (move: MoveTicketInput): void => {
      dispatch({
        type: "MOVE_TICKET",
        payload: {
          ticketId: move.ticketId,
          targetStatusId: move.targetStatusId,
          insertBeforeId: move.insertBeforeId ?? null,
        },
      });
    },
    [dispatch]
  );

  return {
    all, byStatus, filtered, byId, nextKey, countByStatus,
    createTicket, updateTicket, deleteTicket, moveTicket,
  };
}