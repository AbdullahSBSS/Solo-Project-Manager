import type { AppState } from "../types";
import type { AppAction } from "./actions";
import { KeyGeneratorService } from "../services/keyGenerator.service";
import { uid, now } from "../utils/id.utils";

// Compile-time exhaustiveness check for the switch below.
function assertNever(_action: never): void {
  /* unreachable */
}

// THE INVARIANT: updatedAt is stamped here and only here,
// and only when something actually changed.
export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case "HYDRATE":
      return action.payload;

    case "ADD_TICKET": {
      const id  = uid();
      const key = KeyGeneratorService.generate(state);
      const ts  = now();

      // max + 1 (not count) so a deleted ticket can never cause an order collision
      const orders = Object.values(state.tickets)
        .filter(t => t.statusId === action.payload.statusId)
        .map(t => t.order);
      const order = orders.length ? Math.max(...orders) + 1 : 0;

      return {
        ...state,
        tickets: {
          ...state.tickets,
          [id]: { ...action.payload, id, key, order, createdAt: ts, updatedAt: ts },
        },
      };
    }

    case "UPDATE_TICKET": {
      const { id, patch } = action.payload;
      const existing = state.tickets[id];
      if (!existing) return state;

      return {
        ...state,
        tickets: {
          ...state.tickets,
          [id]: { ...existing, ...patch, updatedAt: now() },
        },
      };
    }

    case "DELETE_TICKET": {
      const next = { ...state.tickets };
      delete next[action.payload];
      return { ...state, tickets: next };
    }

    case "MOVE_TICKET": {
      const { ticketId, targetStatusId, insertBeforeId } = action.payload;
      const ticket = state.tickets[ticketId];
      if (!ticket) return state;
      if (insertBeforeId === ticketId) return state; // dropped onto itself

      const srcId = ticket.statusId;

      const targetItems = Object.values(state.tickets)
        .filter(t => t.statusId === targetStatusId && t.id !== ticketId)
        .sort((a, b) => a.order - b.order);

      const insertAt = insertBeforeId
        ? targetItems.findIndex(t => t.id === insertBeforeId)
        : -1;
      const at = insertAt === -1 ? targetItems.length : insertAt;

      // Same column and same resulting sequence means nothing moved.
      // Return the state untouched so updatedAt is not bumped for a no-op drop.
      if (srcId === targetStatusId) {
        const before = Object.values(state.tickets)
          .filter(t => t.statusId === srcId)
          .sort((a, b) => a.order - b.order)
          .map(t => t.id);
        const after = [
          ...targetItems.slice(0, at).map(t => t.id),
          ticketId,
          ...targetItems.slice(at).map(t => t.id),
        ];
        if (
          before.length === after.length &&
          before.every((id, i) => id === after[i])
        ) {
          return state;
        }
      }

      const ts = now();

      // Only the moved ticket is stamped; neighbours are merely reindexed.
      const newTarget = [
        ...targetItems.slice(0, at),
        { ...ticket, statusId: targetStatusId, updatedAt: ts },
        ...targetItems.slice(at),
      ].map((t, i) => ({ ...t, order: i }));

      // Close the gap in the source column when the ticket changed columns
      const newSrc = srcId !== targetStatusId
        ? Object.values(state.tickets)
            .filter(t => t.statusId === srcId && t.id !== ticketId)
            .sort((a, b) => a.order - b.order)
            .map((t, i) => ({ ...t, order: i }))
        : [];

      const updated = { ...state.tickets };
      [...newTarget, ...newSrc].forEach(t => { updated[t.id] = t; });

      return { ...state, tickets: updated };
    }

    case "UPDATE_PROJECT": {
      const current = state.projects[state.activeProjectId];
      if (!current) return state;

      return {
        ...state,
        projects: {
          ...state.projects,
          [state.activeProjectId]: {
            ...current,
            ...action.payload,
            updatedAt: now(),
          },
        },
      };
    }

    case "RESET_PROJECT_DATA": {
      const pid = action.payload;
      const withoutProject = <T extends { projectId: string }>(
        rec: Record<string, T>
      ): Record<string, T> =>
        Object.fromEntries(
          Object.entries(rec).filter(([, v]) => v.projectId !== pid)
        );

      return {
        ...state,
        tickets: withoutProject(state.tickets),
        sprints: withoutProject(state.sprints),
        epics:   withoutProject(state.epics),
        labels:  withoutProject(state.labels),
      };
    }

    case "SET_VIEW":
      return { ...state, ui: { ...state.ui, activeView: action.payload } };

    default:
      assertNever(action);
      return state;
  }
}