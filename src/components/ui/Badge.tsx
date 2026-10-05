import { PRIORITY_COLORS, T } from "./DesignTokens";

type BadgeVariant = "status" | "priority" | "type" | "neutral";

interface BadgeProps {
  label:    string;
  color?:   string;   // overrides variant colour
  variant?: BadgeVariant;
  dot?:     boolean;  // show colour dot instead of background tint
}

export function Badge({ label, color, dot = false }: BadgeProps) {
  const c = color ?? T.textMuted;

  return (
    <span style={{
      display:        "inline-flex",
      alignItems:     "center",
      gap:            5,
      fontSize:       11,
      fontWeight:     500,
      padding:        "2px 8px",
      borderRadius:   999,
      background:     dot ? "transparent" : `${c}18`,
      color:          dot ? T.textSub    : c,
      border:         `1px solid ${c}33`,
      whiteSpace:     "nowrap",
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: c,
          flexShrink: 0,
        }}/>
      )}
      {label}
    </span>
  );
}

// Convenience wrappers — no prop drilling needed at call sites
export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      color={PRIORITY_COLORS[priority]}
      dot
    />
  );
}

export function StatusBadge({ name, color }: { name: string; color: string }) {
  return <Badge label={name} color={color}/>;
}