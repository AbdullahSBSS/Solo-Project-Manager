// utils/filter.utils.ts
import type { Priority, Ticket } from "../types";

export interface TicketFilters {
  statusId?: string;
  priority?: Priority | "all";
  type?: Ticket["type"] | "all";
  search?: string;
  sprintId?: string | null;
  epicId?: string | null;
}

export function matchesFilters(t: Ticket, f: TicketFilters): boolean {
  if (f.statusId && t.statusId !== f.statusId) return false;
  if (f.priority && f.priority !== "all" && t.priority !== f.priority) return false;
  if (f.type && f.type !== "all" && t.type !== f.type) return false;
  if (f.sprintId !== undefined && t.sprintId !== f.sprintId) return false;
  if (f.epicId !== undefined && t.epicId !== f.epicId) return false;

  const q = f.search?.trim().toLowerCase();
  if (q) {
    const hit =
      t.title.toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    if (!hit) return false;
  }
  return true;
}

export function applyFilters(tickets: Ticket[], f: TicketFilters = {}): Ticket[] {
  return tickets.filter(t => matchesFilters(t, f));
}

// ── Sorting ────────────────────────────────────
export type SortKey = "key" | "priority" | "updated";
export type SortDir = "asc" | "desc";
export interface SortState {
  key: SortKey;
  dir: SortDir;
}

// Higher rank = more important, so "desc" puts Critical first.
const PRIORITY_RANK: Record<Priority, number> = {
  low: 0, medium: 1, high: 2, critical: 3,
};

export function ticketNumber(key: string): number {
  const n = parseInt(key.split("-")[1] ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

export function sortTickets(tickets: Ticket[], { key, dir }: SortState): Ticket[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...tickets].sort((a, b) => {
    switch (key) {
      case "key":
        return sign * (ticketNumber(a.key) - ticketNumber(b.key));
      case "priority":
        return sign * (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
      case "updated":
        return sign * (Date.parse(a.updatedAt) - Date.parse(b.updatedAt));
    }
  });
}