import { useRef } from "react";
import {
  Circle, Bug, BookOpen, Layers, Clock, type LucideIcon,
} from "lucide-react";
import { useModal } from "../../context/ModalProvider";
import { DND_CARD_ATTR, type DraggableProps } from "../../hooks/useDragAndDrop";
import { T, PRIORITY_COLORS } from "../ui/DesignTokens";
import { timeAgo } from "../../utils/date.utils";
import type { Ticket, TicketType } from "../../types";

const TYPE_ICONS: Record<TicketType, LucideIcon> = {
  task: Circle,
  bug: Bug,
  story: BookOpen,
  subtask: Layers,
};

interface BoardCardProps {
  ticket: Ticket;
  draggable: DraggableProps;
}

// Distinguishes a click from a drag via a ref so the detail panel
// never opens at the end of a drag gesture.
export function BoardCard({ ticket, draggable }: BoardCardProps) {
  const { open } = useModal();
  const didDrag = useRef(false);
  const TypeIcon = TYPE_ICONS[ticket.type] ?? Circle;
  const prioColor = PRIORITY_COLORS[ticket.priority] ?? T.textMuted;

  return (
    <div
      draggable
      // Lets the column measure this card to compute drop positions
      {...{ [DND_CARD_ATTR]: ticket.id }}
      onMouseDown={() => { didDrag.current = false; }}
      onDragStart={e => {
        didDrag.current = true;
        draggable.onDragStart(e);
      }}
      onDragEnd={e => {
        draggable.onDragEnd(e);
        setTimeout(() => { didDrag.current = false; }, 50);
      }}
      onClick={() => {
        if (!didDrag.current) open("detail", { ticketId: ticket.id });
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
      style={{
        background: T.bg,
        border: draggable.isDropTarget
          ? `1.5px dashed ${T.borderFocus}`
          : `1px solid ${T.border}`,
        borderRadius: T.radius,
        padding: "10px 12px",
        cursor: draggable.isDragging ? "grabbing" : "grab",
        opacity: draggable.isDragging ? 0.3 : 1,
        transition: "opacity 0.15s, box-shadow 0.15s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 8 }}>
        <TypeIcon size={12} style={{ color: T.textMuted, flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
          {ticket.title}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>
            {ticket.key}
          </span>
          <span
            title={ticket.priority}
            style={{ width: 7, height: 7, borderRadius: "50%", background: prioColor }}
          />
        </div>
        <span style={{
          fontSize: 11, color: T.textMuted,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <Clock size={10} />
          {timeAgo(ticket.updatedAt)}
        </span>
      </div>
    </div>
  );
}