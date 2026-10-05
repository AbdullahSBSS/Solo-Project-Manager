import { Layers } from "lucide-react";
import { useProject } from "../../hooks/useProject";
import { useTickets } from "../../hooks/useTickets";
import { T } from "../ui/DesignTokens";
import type { Epic } from "../../types";

// Three rendering modes share one data contract and colour logic:
//   inline   — compact pill (BacklogRow, TicketDetailPanel)
//   card     — full card with progress (EpicList)
//   selector — dropdown option (create/edit forms)
// Split into EpicTag / EpicCard / EpicSelector if this grows past ~150 lines.
type EpicTagVariant = "inline" | "card" | "selector";

interface EpicTagProps {
  epicId: string;
  variant?: EpicTagVariant;
  onClick?: () => void;
}

export function EpicTag({ epicId, variant = "inline", onClick }: EpicTagProps) {
  const { getEpic } = useProject();
  const epic = getEpic(epicId);

  // Deleted or unknown epic: render nothing so callers never need to guard.
  if (!epic) return null;

  if (variant === "inline")   return <EpicInline epic={epic} onClick={onClick} />;
  if (variant === "card")     return <EpicCard epic={epic} onClick={onClick} />;
  if (variant === "selector") return <EpicSelectorItem epic={epic} />;
  return null;
}

function EpicInline({ epic, onClick }: { epic: Epic; onClick?: () => void }) {
  return (
    <span
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      title={epic.title}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 500, padding: "1px 7px", borderRadius: 999,
        background: `${epic.color}18`, color: epic.color,
        border: `1px solid ${epic.color}44`,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap", maxWidth: 120,
        overflow: "hidden", textOverflow: "ellipsis",
      }}
    >
      <Layers size={10} style={{ flexShrink: 0 }} />
      {epic.title}
    </span>
  );
}

function EpicCard({ epic, onClick }: { epic: Epic; onClick?: () => void }) {
  const { filtered } = useTickets();
  const tickets = filtered({ epicId: epic.id });
  const done = tickets.filter(t => t.statusId === "sc-done").length;
  const pct = tickets.length > 0 ? Math.round((done / tickets.length) * 100) : 0;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
      style={{
        background: T.bg, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${epic.color}`, borderRadius: 8,
        padding: "14px 16px", cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Layers size={13} color={epic.color} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{epic.title}</span>
        </div>
        <span style={{ fontSize: 11, color: T.textMuted }}>
          {done}/{tickets.length} done
        </span>
      </div>

      <div style={{ height: 4, background: T.border, borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: epic.color,
          borderRadius: 999, transition: "width 0.4s ease",
        }} />
      </div>

      {(epic.startDate || epic.endDate) && (
        <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
          {epic.startDate ? fmt(epic.startDate) : "—"}
          {" → "}
          {epic.endDate ? fmt(epic.endDate) : "Ongoing"}
        </div>
      )}
    </div>
  );
}

function EpicSelectorItem({ epic }: { epic: Epic }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: epic.color, flexShrink: 0,
      }} />
      <span style={{ fontSize: 13 }}>{epic.title}</span>
    </div>
  );
}

// Renders all epics for the active project (future EpicsPage).
export function EpicList() {
  const { epics } = useProject();

  if (epics.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 10, padding: "56px 16px", color: T.textMuted,
      }}>
        <Layers size={32} strokeWidth={1.2} />
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.textSub }}>
          No epics yet
        </p>
        <p style={{ margin: 0, fontSize: 12 }}>
          Group related tickets into epics to track larger goals
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {epics.map(epic => (
        <EpicTag key={epic.id} epicId={epic.id} variant="card" />
      ))}
    </div>
  );
}