import { useState } from "react";
import { Plus } from "lucide-react";
import { useProject } from "../../hooks/useProject";
import { useTickets } from "../../hooks/useTickets";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useModal } from "../../context/ModalProvider";
import { BoardColumn } from "./BoardColumn";
import { FilterBar } from "./FilterBar";
import { Button } from "../ui/Button";
import { T } from "../ui/DesignTokens";
import type { TicketFilters } from "../../utils/filter.utils";

// Coordinator only: owns filter state, nothing else.
export function BoardView() {
  const { statusConfigs } = useProject();
  const { byStatus, countByStatus } = useTickets();
  const dnd = useDragAndDrop();
  const { open } = useModal();

  const [filters, setFilters] = useState<TicketFilters>({
    priority: "all",
    type: "all",
    search: "",
  });

  const isFiltering =
    filters.priority !== "all" ||
    filters.type !== "all" ||
    !!filters.search?.trim();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}
      onDragEnd={dnd.cancelDrag}
    >
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Kanban Board</h2>
        <Button
          variant="primary"
          icon={<Plus size={13} />}
          onClick={() => open("create", { defaultStatusId: "sc-todo" })}
        >
          Add Ticket
        </Button>
      </div>

      <div style={{ flexShrink: 0 }}>
        <FilterBar filters={filters} onChange={setFilters} />
        {isFiltering && (
          <p style={{ margin: "6px 2px 0", fontSize: 11, color: T.textMuted }}>
            Filtered view — some tickets may be hidden.
          </p>
        )}
      </div>

      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 8, flex: 1, alignItems: "flex-start",
      }}>
        {statusConfigs.map(cfg => (
          <BoardColumn
            key={cfg.id}
            config={cfg}
            tickets={byStatus(cfg.id, filters)}
            count={countByStatus[cfg.id] ?? 0}
            droppable={dnd.getDroppableProps(cfg.id)}
            getDraggableProps={dnd.getDraggableProps}
            onAddTicket={() => open("create", { defaultStatusId: cfg.id })}
          />
        ))}
      </div>
    </div>
  );
}