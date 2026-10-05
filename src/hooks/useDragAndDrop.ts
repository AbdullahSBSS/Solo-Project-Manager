import { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useTickets } from "./useTickets";

export interface DragState {
  ticketId: string;
  srcStatusId: string;
  overStatusId: string;
  overTicketId: string | null;   // land directly above this ticket; null = end of column
}

export interface DraggableProps {
  draggable: true;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  isDragging: boolean;
  isDropTarget: boolean;         // the dragged ticket will land directly above this card
}

export interface DroppableProps {
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  // Rendering hints — destructure these out before spreading onto the DOM.
  isOver: boolean;
  insertAtEnd: boolean;          // the dragged ticket will land at the bottom
}

export interface UseDragAndDropReturn {
  dragState: DragState | null;
  isDragging: boolean;
  getDraggableProps: (ticketId: string, statusId: string) => DraggableProps;
  getDroppableProps: (statusId: string) => DroppableProps;
  cancelDrag: () => void;
}

// Contract with BoardCard: every card carries this attribute so the column
// can measure card positions. See findInsertBeforeId.
export const DND_CARD_ATTR = "data-ticket-id";

const DND_KEY = "solo_pm/ticket_id";

// Decides where a dragged ticket lands, from the cursor's Y position.
// Walks the column's cards in DOM order (= column order) and returns the first
// card whose vertical midpoint is below the cursor. No such card means the
// cursor is past every midpoint: end of column (null). This one rule covers
// the top/bottom half of a card, the gaps between cards, and the empty space
// below the last card.
function findInsertBeforeId(
  column: HTMLElement,
  clientY: number,
  draggedId: string
): string | null {
  const cards = Array.from(
    column.querySelectorAll<HTMLElement>(`[${DND_CARD_ATTR}]`)
  );
  for (const card of cards) {
    const id = card.getAttribute(DND_CARD_ATTR);
    if (!id || id === draggedId) continue;
    const { top, height } = card.getBoundingClientRect();
    if (clientY < top + height / 2) return id;
  }
  return null;
}

export function useDragAndDrop(): UseDragAndDropReturn {
  const { moveTicket } = useTickets();

  const [dragState, setDragState] = useState<DragState | null>(null);

  // The ref mirrors the state so event handlers never read a stale closure;
  // React renders from the state.
  const dragRef = useRef<DragState | null>(null);
  const sync = useCallback((next: DragState | null) => {
    dragRef.current = next;
    setDragState(next);
  }, []);

  const cancelDrag = useCallback(() => sync(null), [sync]);

  const getDraggableProps = useCallback(
    (ticketId: string, statusId: string): DraggableProps => {
      const handleDragStart = (e: DragEvent) => {
        e.dataTransfer.setData(DND_KEY, ticketId);
        e.dataTransfer.effectAllowed = "move";
        // Let the browser snapshot the ghost image before the card dims
        requestAnimationFrame(() => {
          sync({
            ticketId,
            srcStatusId: statusId,
            overStatusId: statusId,
            overTicketId: null,
          });
        });
      };

      // dragend fires even when the drop was cancelled — always clean up.
      const handleDragEnd = () => sync(null);

      const current = dragRef.current;
      const isDragging = current?.ticketId === ticketId;
      const isDropTarget = !isDragging && current?.overTicketId === ticketId;

      return {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        isDragging,
        isDropTarget,
      };
    },
    [sync]
  );

  const getDroppableProps = useCallback(
    (statusId: string): DroppableProps => {
      // Cards no longer handle dragover. Their events bubble up to here,
      // so one handler computes the insertion point wherever the cursor is.
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const current = dragRef.current;
        if (!current) return;

        const overTicketId = findInsertBeforeId(
          e.currentTarget as HTMLElement,
          e.clientY,
          current.ticketId
        );

        // Only update when something changed, to avoid a re-render per mouse move
        if (
          current.overStatusId !== statusId ||
          current.overTicketId !== overTicketId
        ) {
          sync({ ...current, overStatusId: statusId, overTicketId });
        }
      };

      const handleDragLeave = (e: DragEvent) => {
        // Ignore "leaves" caused by moving between children of the column
        const col = e.currentTarget as HTMLElement;
        if (col.contains(e.relatedTarget as Node | null)) return;

        const current = dragRef.current;
        if (current && current.overStatusId === statusId) {
          sync({ ...current, overStatusId: current.srcStatusId, overTicketId: null });
        }
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData(DND_KEY);

        if (!ticketId || !dragRef.current) {
          sync(null);
          return;
        }

        // Recompute at drop time from the actual cursor position rather than
        // trusting the last dragover. Whether this changes anything (including
        // a drop back into the same spot) is decided by the reducer, which also
        // stamps updatedAt.
        moveTicket({
          ticketId,
          targetStatusId: statusId,
          insertBeforeId: findInsertBeforeId(
            e.currentTarget as HTMLElement,
            e.clientY,
            ticketId
          ),
        });
        sync(null);
      };

      const current = dragRef.current;
      const isOver = current?.overStatusId === statusId;

      return {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        isOver,
        insertAtEnd: isOver && current?.overTicketId === null,
      };
    },
    [moveTicket, sync]
  );

  return {
    dragState,
    isDragging: !!dragState,
    getDraggableProps,
    getDroppableProps,
    cancelDrag,
  };
}