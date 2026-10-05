import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useTickets } from "../../hooks/useTickets";
import { useModal } from "../../context/ModalProvider";
import { Button } from "../ui/Button";
import { BacklogRow } from "./BacklogRow";
import { T } from "../ui/DesignTokens";
import {
  sortTickets,
  type SortKey,
  type SortState,
  type TicketFilters,
} from "../../utils/filter.utils";

// Drives both the header and each row's grid from one source of truth.
interface ColumnDef {
  key: string;
  label: string;
  width: string;
}

const COLUMNS: ColumnDef[] = [
  { key: "key",      label: "Key",      width: "72px"  },
  { key: "title",    label: "Title",    width: "1fr"   },
  { key: "status",   label: "Status",   width: "110px" },
  { key: "priority", label: "Priority", width: "90px"  },
  { key: "updated",  label: "Updated",  width: "100px" },
];

const GRID = COLUMNS.map(c => c.width).join(" ");
const SORTABLE: SortKey[] = ["key", "priority", "updated"];

// Owns search + sort state; data and writes come from hooks.
export function BacklogView() {
  const { filtered } = useTickets();
  const { open } = useModal();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "updated", dir: "desc" });

  const filters: TicketFilters = { search };
  const tickets = sortTickets(filtered(filters), sort);

  const toggleSort = (key: SortKey) => {
    setSort(s =>
      s.key === key
        ? { key, dir: s.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Backlog</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <SearchInput value={search} onChange={setSearch} />
          <Button
            variant="primary"
            icon={<Plus size={13} />}
            onClick={() => open("create", { defaultStatusId: "sc-todo" })}
          >
            Add Ticket
          </Button>
        </div>
      </div>

      <div style={{
        background: T.bg, border: `0.5px solid ${T.border}`,
        borderRadius: 10, overflow: "hidden", flex: 1,
        display: "flex", flexDirection: "column",
      }}>
        <BacklogHeader sort={sort} onSort={toggleSort} />

        {tickets.length === 0 ? (
          <EmptyBacklog hasSearch={!!search.trim()} />
        ) : (
          <div style={{ overflowY: "auto", flex: 1 }}>
            {tickets.map((t, i) => (
              <BacklogRow
                key={t.id}
                ticket={t}
                grid={GRID}
                isLast={i === tickets.length - 1}
                onClick={() => open("detail", { ticketId: t.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <Search size={13} style={{
        position: "absolute", left: 8, color: T.textMuted, pointerEvents: "none",
      }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search tickets…"
        style={{
          width: 200, padding: "6px 10px 6px 28px", fontSize: 12,
          border: `1px solid ${T.border}`, borderRadius: 20,
          background: T.bg, color: T.text, outline: "none", fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function BacklogHeader({
  sort, onSort,
}: { sort: SortState; onSort: (k: SortKey) => void }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: GRID, padding: "9px 16px",
      borderBottom: `1px solid ${T.border}`, background: T.bgSub, flexShrink: 0,
    }}>
      {COLUMNS.map(col => {
        const isSortable = SORTABLE.includes(col.key as SortKey);
        const isActive = sort.key === col.key;
        return (
          <span
            key={col.key}
            onClick={() => isSortable && onSort(col.key as SortKey)}
            style={{
              fontSize: 11, fontWeight: 500,
              color: isActive ? T.text : T.textMuted,
              textTransform: "uppercase", letterSpacing: "0.05em",
              cursor: isSortable ? "pointer" : "default",
              userSelect: "none",
              display: "flex", alignItems: "center", gap: 3,
            }}
          >
            {col.label}
            {isActive && (
              <span style={{ fontSize: 9 }}>{sort.dir === "desc" ? "↓" : "↑"}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function EmptyBacklog({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 8, padding: "56px 16px", color: T.textMuted,
    }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.textSub }}>
        {hasSearch ? "No matching tickets" : "Backlog is empty"}
      </p>
      {!hasSearch && (
        <p style={{ margin: 0, fontSize: 12 }}>
          Create your first ticket to get started
        </p>
      )}
    </div>
  );
}