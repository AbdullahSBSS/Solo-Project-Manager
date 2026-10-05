import { useEffect, useState, type ReactNode } from "react";
import { X, Clock, Trash2, AlertTriangle } from "lucide-react";
import { useTickets, type UpdateTicketInput } from "../../hooks/useTickets";
import { useProject } from "../../hooks/useProject";
import { StyledTextarea } from "../ui/StyledTextarea";
import { StyledSelect } from "../ui/StyledSelect";
import { TicketBadge } from "./TicketBadge";
import { Button } from "../ui/Button";
import { T, PRIORITY_COLORS } from "../ui/DesignTokens";
import { timeAgo } from "../../utils/date.utils";
import { PRIORITIES, TICKET_TYPES } from "../../types";
import type { Priority, TicketType } from "../../types";

interface TicketDetailPanelProps {
  ticketId: string;
  close: () => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function TicketDetailPanel({ ticketId, close }: TicketDetailPanelProps) {
  const { byId, updateTicket, moveTicket, deleteTicket } = useTickets();
  const { statusConfigs, getStatus } = useProject();

  const ticket = byId(ticketId);
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [desc, setDesc] = useState(ticket?.description ?? "");
  const [confirm, setConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDesc(ticket.description);
    }
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture-phase Escape: dismiss the delete confirmation first,
  // and only then the panel. Stops the provider's global handler.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      if (confirm) setConfirm(false);
      else close();
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [confirm, close]);

  if (!ticket) return null;

  const status = getStatus(ticket.statusId);
  const patch = (p: UpdateTicketInput) => updateTicket(ticketId, p);

  // A status change is a move: it lands at the bottom of the target column
  // and both columns are reindexed. updateTicket cannot change statusId.
  const changeStatus = (targetStatusId: string) => {
    if (targetStatusId === ticket.statusId) return;
    moveTicket({ ticketId, targetStatusId });
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 301,
        width: "100%", maxWidth: 600,
        display: "flex", flexDirection: "column",
        background: T.bg, borderLeft: `1px solid ${T.border}`,
        boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
        transform: mounted ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
        background: T.bgSub, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TicketBadge type={ticket.type} />
          <span style={{ fontSize: 12, fontFamily: "monospace", color: T.textMuted }}>
            {ticket.key}
          </span>
          {status && (
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 999,
              background: `${status.color}18`, color: status.color,
              border: `1px solid ${status.color}44`,
            }}>
              {status.name}
            </span>
          )}
        </div>
        <button
          onClick={close}
          aria-label="Close"
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, borderRadius: 6, display: "flex", color: T.textMuted,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main: title + description */}
        <div style={{
          flex: 1, padding: "20px 24px", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <StyledTextarea
            label="Title"
            value={title}
            rows={2}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => title.trim() && patch({ title: title.trim() })}
            style={{ fontSize: 15, fontWeight: 500, resize: "none" }}
          />
          <StyledTextarea
            label="Description"
            value={desc}
            rows={7}
            placeholder="Add a description…"
            onChange={e => setDesc(e.target.value)}
            onBlur={() => patch({ description: desc })}
          />
          <div style={{
            display: "flex", gap: 16, paddingTop: 4,
            borderTop: `1px solid ${T.border}`,
          }}>
            {([["Created", ticket.createdAt], ["Updated", ticket.updatedAt]] as const)
              .map(([label, iso]) => (
                <span key={label} style={{
                  fontSize: 11, color: T.textMuted,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Clock size={10} /> {label}: {timeAgo(iso)}
                </span>
              ))}
          </div>
        </div>

        {/* Sidebar: metadata */}
        <div style={{
          width: 188, flexShrink: 0, padding: "20px 16px",
          borderLeft: `1px solid ${T.border}`, overflowY: "auto",
          background: T.bgSub, display: "flex", flexDirection: "column",
        }}>
          <MetaField label="Status">
            <StyledSelect
              value={ticket.statusId}
              onChange={e => changeStatus(e.target.value)}
              style={{ fontSize: 12 }}
            >
              {statusConfigs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </StyledSelect>
          </MetaField>

          <MetaField label="Priority">
            <StyledSelect
              value={ticket.priority}
              onChange={e => patch({ priority: e.target.value as Priority })}
              style={{ fontSize: 12, color: PRIORITY_COLORS[ticket.priority] }}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{cap(p)}</option>
              ))}
            </StyledSelect>
          </MetaField>

          <MetaField label="Type">
            <StyledSelect
              value={ticket.type}
              onChange={e => patch({ type: e.target.value as TicketType })}
              style={{ fontSize: 12 }}
            >
              {TICKET_TYPES.map(t => (
                <option key={t} value={t}>{cap(t)}</option>
              ))}
            </StyledSelect>
          </MetaField>

          <MetaField label="Sprint"><Stub label="No sprint yet" /></MetaField>
          <MetaField label="Epic"><Stub label="No epic yet" /></MetaField>

          {/* Delete, pinned to the bottom */}
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            {!confirm ? (
              <Button
                variant="danger"
                icon={<Trash2 size={12} />}
                style={{ width: "100%" }}
                onClick={() => setConfirm(true)}
              >
                Delete ticket
              </Button>
            ) : (
              <div style={{
                background: T.dangerLight, border: "1px solid #FCA5A5",
                borderRadius: T.radius, padding: 12,
              }}>
                <p style={{
                  margin: "0 0 8px", fontSize: 12, color: T.danger,
                  display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
                }}>
                  <AlertTriangle size={12} /> Are you sure?
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1, justifyContent: "center", background: T.danger }}
                    onClick={() => { deleteTicket(ticketId); close(); }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        margin: "0 0 5px", fontSize: 11, fontWeight: 600, color: T.textMuted,
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Stub({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 12, color: T.textMuted, padding: "7px 10px",
      borderRadius: T.radius, border: `1px dashed ${T.border}`,
    }}>
      {label}
    </div>
  );
}