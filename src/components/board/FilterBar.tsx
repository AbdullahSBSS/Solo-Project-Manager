import { Search } from "lucide-react";
import { PRIORITIES, TICKET_TYPES } from "../../types";
import { T } from "../ui/DesignTokens";
import type { TicketFilters } from "../../utils/filter.utils";

interface FilterBarProps {
  filters: TicketFilters;
  onChange: (next: TicketFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const patch = (p: Partial<TicketFilters>) => onChange({ ...filters, ...p });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Search size={13} style={{
          position: "absolute", left: 8, color: T.textMuted, pointerEvents: "none",
        }} />
        <input
          value={filters.search ?? ""}
          onChange={e => patch({ search: e.target.value })}
          placeholder="Search…"
          style={{
            width: 170, padding: "6px 10px 6px 28px", fontSize: 12,
            border: `1px solid ${T.border}`, borderRadius: 20,
            background: T.bg, color: T.text, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>
      <ChipGroup
        label="Priority"
        options={PRIORITIES}
        value={filters.priority ?? "all"}
        onSelect={priority => patch({ priority })}
      />
      <ChipGroup
        label="Type"
        options={TICKET_TYPES}
        value={filters.type ?? "all"}
        onSelect={type => patch({ type })}
      />
    </div>
  );
}

function ChipGroup<V extends string>({
  label, options, value, onSelect,
}: {
  label: string;
  options: readonly V[];
  value: V | "all";
  onSelect: (v: V | "all") => void;
}) {
  const all: (V | "all")[] = ["all", ...options];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 11, color: T.textMuted, marginRight: 2 }}>{label}:</span>
      {all.map(o => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onSelect(o)}
            style={{
              fontSize: 12, padding: "4px 10px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${active ? T.blue : T.border}`,
              background: active ? T.blueLight : "transparent",
              color: active ? T.blue : T.textSub,
              fontWeight: active ? 500 : 400,
              fontFamily: "inherit",
            }}
          >
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        );
      })}
    </div>
  );
}