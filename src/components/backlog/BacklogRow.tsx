import { T, PRIORITY_COLORS } from "../ui/DesignTokens";
import { TicketBadge } from "../ticket/TicketBadge";
import { useProject } from "../../hooks/useProject";
import { timeAgo } from "../../utils/date.utils";
import type { Ticket } from "../../types";

interface BacklogRowProps {
  ticket: Ticket;
  grid: string;      // grid-template-columns, passed from the parent
  isLast: boolean;   // suppresses the bottom border on the last row
  onClick: () => void;
}

// Pure renderer. Resolves status via a read-only hook call.
export function BacklogRow({ ticket, grid, isLast, onClick }: BacklogRowProps) {
  const { getStatus } = useProject();
  const status = getStatus(ticket.statusId);
  const prioColor = PRIORITY_COLORS[ticket.priority] ?? T.textMuted;

  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = T.bgSub; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      style={{
        display: "grid", gridTemplateColumns: grid, padding: "10px 16px",
        borderBottom: isLast ? "none" : `0.5px solid ${T.border}`,
        alignItems: "center", cursor: "pointer", transition: "background 0.1s",
      }}
    >
      <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>
        {ticket.key}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <TicketBadge type={ticket.type} />
        <span style={{
          fontSize: 13, fontWeight: 500,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {ticket.title}
        </span>
        {/* Epic tag slots in here when epics ship */}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {status && (
          <>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: status.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: T.textSub }}>{status.name}</span>
          </>
        )}
      </div>

      <span style={{ fontSize: 12, color: prioColor, fontWeight: 500 }}>
        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
      </span>

      <span style={{ fontSize: 11, color: T.textMuted }}>
        {timeAgo(ticket.updatedAt)}
      </span>
    </div>
  );
}