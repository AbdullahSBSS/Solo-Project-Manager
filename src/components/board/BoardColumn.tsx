import { Plus, Inbox } from "lucide-react";
import { BoardCard } from "./BoardCard";
import type { StatusConfig, Ticket } from "../../types";
import type { DraggableProps, DroppableProps } from "../../hooks/useDragAndDrop";

interface BoardColumnProps {
  config: StatusConfig;
  tickets: Ticket[];
  count: number;
  droppable: DroppableProps;
  getDraggableProps: (ticketId: string, statusId: string) => DraggableProps;
  onAddTicket: () => void;
}

export function BoardColumn({
  config, tickets, count, droppable, getDraggableProps, onAddTicket,
}: BoardColumnProps) {
  // isOver / insertAtEnd are rendering hints, not DOM attributes —
  // keep them off the <div>.
  const { isOver, insertAtEnd, ...dropHandlers } = droppable;

  return (
    <div
      {...dropHandlers}
      style={{
        minWidth: 255, width: 255, flexShrink: 0,
        background: "var(--color-background-secondary)",
        borderRadius: 10, padding: "12px 10px",
        display: "flex", flexDirection: "column", gap: 6,
        border: isOver
          ? `1.5px solid ${config.color}`
          : "0.5px solid var(--color-border-tertiary)",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 4px", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: config.color,
          }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{config.name}</span>
          <span style={{
            fontSize: 11, borderRadius: 999, padding: "1px 6px",
            background: "var(--color-background-primary)",
            color: "var(--color-text-tertiary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}>
            {count}
          </span>
        </div>
        <button
          onClick={onAddTicket}
          aria-label={`Add ticket to ${config.name}`}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
            color: "var(--color-text-tertiary)", display: "flex",
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyColumn />
      ) : (
        <>
          {tickets.map(t => (
            <BoardCard
              key={t.id}
              ticket={t}
              draggable={getDraggableProps(t.id, t.statusId)}
            />
          ))}
          {/* Shows where the ticket will land when dropped at the bottom.
              The column highlight alone doesn't say which position. */}
          {isOver && insertAtEnd && (
            <div
              aria-hidden="true"
              style={{
                height: 2, margin: "0 2px", borderRadius: 1,
                background: config.color,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function EmptyColumn() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 5, padding: "28px 0", color: "var(--color-text-tertiary)",
    }}>
      <Inbox size={22} strokeWidth={1.2} />
      <span style={{ fontSize: 11 }}>No tickets</span>
    </div>
  );
}