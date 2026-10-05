// Small inline indicator used in BacklogRow
// and anywhere a ticket's type needs to be
// represented in a confined space.
import { Circle, Bug, BookOpen, Layers } from "lucide-react";
import { T } from "../ui/DesignTokens";

const TYPE_META: Record<string, {
  icon:  React.ElementType;
  color: string;
  label: string;
}> = {
  task:    { icon: Circle,   color: "#378ADD", label: "Task"    },
  bug:     { icon: Bug,      color: "#DC2626", label: "Bug"     },
  story:   { icon: BookOpen, color: "#7C3AED", label: "Story"   },
  subtask: { icon: Layers,   color: "#D97706", label: "Subtask" },
};

interface TicketBadgeProps {
  type:      string;
  showLabel?: boolean;
}

export function TicketBadge({ type, showLabel = false }: TicketBadgeProps) {
  const meta  = TYPE_META[type] ?? TYPE_META.task;
  const Icon  = meta.icon;

  return (
    <span style={{
      display:     "inline-flex",
      alignItems:  "center",
      gap:         4,
      fontSize:    12,
      color:       meta.color,
    }}>
      <Icon size={13} />
      {showLabel && (
        <span style={{ color: T.textSub }}>{meta.label}</span>
      )}
    </span>
  );
}