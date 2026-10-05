import { Plus, Play, CheckCircle2,
         Calendar, Flag }      from "lucide-react";
import { useProject }          from "../../hooks/useProject";
import { useTickets }          from "../../hooks/useTickets";
import { Button }              from "../ui/Button";
import { T }                   from "../ui/DesignTokens";
import type { Sprint }         from "../../types";

// ─────────────────────────────────────────
// SprintPanel is the single component that
// handles all sprint-related rendering:
//
//   - Active sprint header + progress bar
//   - Sprint ticket list
//   - Planned sprints (collapsed)
//   - Empty state when no sprints exist
//
// All data comes from useProject / useTickets.
// All writes will go through useModal (Phase D).
// ─────────────────────────────────────────
export function SprintPanel() {
  const { sprints, activeSprint } = useProject();
  const { filtered }              = useTickets();

  if (sprints.length === 0) {
    return <EmptySprints />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Active sprint */}
      {activeSprint ? (
        <ActiveSprintCard
          sprint={activeSprint}
          tickets={filtered({ sprintId: activeSprint.id })}
        />
      ) : (
        <NoActiveSprint />
      )}

      {/* Planned sprints */}
      {sprints
        .filter(s => s.status === "planned")
        .map(s => (
          <PlannedSprintCard
            key={s.id}
            sprint={s}
            ticketCount={filtered({ sprintId: s.id }).length}
          />
        ))
      }

      {/* Completed sprints (collapsed by default) */}
      {sprints
        .filter(s => s.status === "completed")
        .map(s => (
          <CompletedSprintCard key={s.id} sprint={s} />
        ))
      }
    </div>
  );
}

// ── Sub-components ─────────────────────────────

function ActiveSprintCard({
  sprint, tickets,
}: { sprint: Sprint; tickets: any[] }) {
  const done  = tickets.filter(t => t.statusId === "sc-done").length;
  const total = tickets.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 10, overflow: "hidden",
    }}>
      {/* Sprint header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: `1px solid ${T.border}`,
        background: T.bgSub,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Play size={13} color="#378ADD" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {sprint.name}
          </span>
          <span style={{
            fontSize: 11, padding: "1px 7px", borderRadius: 999,
            background: "#E6F1FB", color: "#185FA5",
            border: "1px solid #B3D4F5",
          }}>
            Active
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SprintDateRange
            start={sprint.startDate}
            end={sprint.endDate}
          />
          {/* Phase D: Complete Sprint button */}
          <Button variant="secondary" size="sm"
            icon={<CheckCircle2 size={12} />}>
            Complete sprint
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "10px 16px 0",
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {done} of {total} tickets done
          </span>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {pct}%
          </span>
        </div>
        <ProgressBar pct={pct} />
      </div>

      {/* Sprint goal */}
      {sprint.goal && (
        <div style={{ padding: "10px 16px",
          borderBottom: `1px solid ${T.border}` }}>
          <p style={{ margin: 0, fontSize: 12, color: T.textSub,
            display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Flag size={12} style={{ flexShrink: 0, marginTop: 1,
              color: T.textMuted }} />
            {sprint.goal}
          </p>
        </div>
      )}

      {/* Ticket list */}
      <SprintTicketList tickets={tickets} />
    </div>
  );
}

function PlannedSprintCard({
  sprint, ticketCount,
}: { sprint: Sprint; ticketCount: number }) {
  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 16px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Calendar size={13} color={T.textMuted} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>{sprint.name}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>
          {ticketCount} ticket{ticketCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SprintDateRange start={sprint.startDate} end={sprint.endDate} />
        {/* Phase D: Start Sprint button */}
        <Button variant="secondary" size="sm"
          icon={<Play size={12} />}>
          Start sprint
        </Button>
      </div>
    </div>
  );
}

function CompletedSprintCard({ sprint }: { sprint: Sprint }) {
  return (
    <div style={{
      background: T.bgSub, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "10px 16px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", opacity: 0.7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircle2 size={13} color={T.textMuted} />
        <span style={{ fontSize: 13, color: T.textSub }}>{sprint.name}</span>
      </div>
      <SprintDateRange start={sprint.startDate} end={sprint.endDate} />
    </div>
  );
}

function SprintTicketList({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <div style={{ padding: "20px 16px", textAlign: "center",
        color: T.textMuted, fontSize: 12 }}>
        No tickets in this sprint yet.
      </div>
    );
  }
  return (
    <div>
      {tickets.map((t, i) => (
        <div key={t.id} style={{
          display:    "flex",
          alignItems: "center",
          gap:        10,
          padding:    "9px 16px",
          borderTop:  i > 0 ? `0.5px solid ${T.border}` : "none",
          fontSize:   13,
        }}>
          <span style={{ fontFamily: "monospace", fontSize: 11,
            color: T.textMuted, flexShrink: 0 }}>
            {t.key}
          </span>
          <span style={{ flex: 1, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t.title}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{
      height: 5, background: T.border,
      borderRadius: 999, overflow: "hidden", marginBottom: 10,
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: pct === 100 ? "#639922" : "#378ADD",
        borderRadius: 999,
        transition: "width 0.4s ease",
      }}/>
    </div>
  );
}

function SprintDateRange({
  start, end,
}: { start: string | null; end: string | null }) {
  if (!start && !end) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short",
    });
  return (
    <span style={{ fontSize: 11, color: T.textMuted,
      display: "flex", alignItems: "center", gap: 4 }}>
      <Calendar size={10} />
      {start ? fmt(start) : "—"}
      {" → "}
      {end ? fmt(end) : "—"}
    </span>
  );
}

function EmptySprints() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 10,
      padding: "56px 16px",
      color: T.textMuted,
    }}>
      <Calendar size={32} strokeWidth={1.2} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500,
        color: T.textSub }}>
        No sprints yet
      </p>
      <p style={{ margin: 0, fontSize: 12 }}>
        Create a sprint to start planning work
      </p>
      <Button variant="primary" size="sm"
        icon={<Plus size={12} />}
        style={{ marginTop: 4 }}>
        Create sprint
      </Button>
    </div>
  );
}

function NoActiveSprint() {
  return (
    <div style={{
      background: T.bgSub, border: `1px dashed ${T.border}`,
      borderRadius: 10, padding: "16px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 13, color: T.textMuted }}>
        No active sprint. Start one to track progress.
      </span>
    </div>
  );
}