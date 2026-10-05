// utils/date.utils.ts
export function timeAgo(iso: string, nowMs: number = Date.now()): string {
  const mins = Math.floor((nowMs - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatShortDate(iso: string | null, fallback = "—"): string {
  if (!iso) return fallback;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function dateStamp(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);   // YYYY-MM-DD
}