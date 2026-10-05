import { LayoutDashboard, List } from "lucide-react";
import { T } from "../ui/DesignTokens";

interface TopBarProps {
  activeView: string;
  onNav:      (view: string) => void;
}

const VIEW_LABELS: Record<string, string> = {
  board:    "Kanban Board",
  backlog:  "Backlog",
  settings: "Settings",
};

const VIEW_TOGGLE = [
  { id: "board",   icon: LayoutDashboard, label: "Board" },
  { id: "backlog", icon: List,            label: "List"  },
];

export function TopBar({ activeView, onNav }: TopBarProps) {
  return (
    <header style={{
      height:       50,
      flexShrink:   0,
      borderBottom: `0.5px solid var(--color-border-tertiary)`,
      background:   T.bg,
      display:      "flex",
      alignItems:   "center",
      justifyContent: "space-between",
      padding:      "0 20px",
    }}>
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: "var(--color-text-secondary)",
      }}>
        {VIEW_LABELS[activeView] ?? activeView}
      </span>

      {activeView !== "settings" && (
        <ViewToggle activeView={activeView} onNav={onNav} />
      )}
    </header>
  );
}

function ViewToggle({
  activeView, onNav,
}: { activeView: string; onNav: (v: string) => void }) {
  return (
    <div style={{
      display:      "flex",
      background:   "var(--color-background-secondary)",
      borderRadius: 7,
      padding:      3,
      gap:          2,
      border:       "0.5px solid var(--color-border-tertiary)",
    }}>
      {VIEW_TOGGLE.map(({ id, icon: Icon, label }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          5,
              fontSize:     12,
              padding:      "4px 10px",
              borderRadius: 6,
              border:       "none",
              cursor:       "pointer",
              background:   active ? T.bg  : "transparent",
              color:        active ? T.text : "var(--color-text-tertiary)",
              fontWeight:   active ? 500   : 400,
              boxShadow:    active
                ? "0 0 0 0.5px var(--color-border-tertiary)"
                : "none",
              transition:   "all 0.15s",
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}