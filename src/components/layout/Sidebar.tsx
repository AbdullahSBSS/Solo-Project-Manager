import { ChevronLeft, ChevronDown, Zap,
         LayoutDashboard, List, Settings } from "lucide-react";
import { useProject } from "../../hooks/useProject";

interface SidebarProps {
  activeView: string;
  onNav:      (view: string) => void;
  collapsed:  boolean;
  onToggle:   () => void;
}

interface NavItem {
  id:    string;
  label: string;
  icon:  React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "board",   label: "Board",   icon: LayoutDashboard },
  { id: "backlog", label: "Backlog", icon: List },
];

export function Sidebar({
  activeView, onNav, collapsed, onToggle,
}: SidebarProps) {
  const { project } = useProject();

  return (
    <aside style={{
      width:      collapsed ? 52 : 216,
      transition: "width 0.25s ease",
      background: "#1a1a2e",
      display:    "flex",
      flexDirection: "column",
      height:     "100%",
      flexShrink: 0,
      overflow:   "hidden",
    }}>
      {/* Brand */}
      <BrandBar collapsed={collapsed} onToggle={onToggle} />

      {/* Project selector */}
      {!collapsed && (
        <ProjectSelector name={project.name} keyPrefix={project.key} />
      )}

      {/* Primary nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex",
        flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeView === item.id}
            collapsed={collapsed}
            onNav={onNav}
          />
        ))}
      </nav>

      {/* Settings — pinned to bottom */}
      <div style={{
        padding:     "8px 8px 12px",
        borderTop:   "0.5px solid rgba(255,255,255,0.08)",
      }}>
        <NavButton
          item={{ id: "settings", label: "Settings", icon: Settings }}
          active={activeView === "settings"}
          collapsed={collapsed}
          onNav={onNav}
        />
      </div>
    </aside>
  );
}

// ── Sub-components ─────────────────────────────

function BrandBar({
  collapsed, onToggle
}: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: collapsed ? "center" : "space-between",
      padding:        "13px 12px",
      borderBottom:   "0.5px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "#185FA5",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Zap size={14} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e8e8f0" }}>
            Solo PM
          </span>
        )}
      </div>
      <button
        onClick={onToggle}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.3)", padding: 2,
          display: "flex", marginLeft: collapsed ? 0 : "auto",
        }}
      >
        <ChevronLeft
          size={14}
          style={{
            transform:  collapsed ? "rotate(180deg)" : "none",
            transition: "transform 0.25s",
          }}
        />
      </button>
    </div>
  );
}

function ProjectSelector({
  name, keyPrefix
}: { name: string; keyPrefix: string }) {
  return (
    <div style={{ padding: "10px 10px 0" }}>
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          8,
        padding:      "7px 10px",
        borderRadius: 6,
        background:   "rgba(255,255,255,0.06)",
        cursor:       "pointer",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5,
          background: "#533AB7", flexShrink: 0,
          display: "flex", alignItems: "center",
          justifyContent: "center",
          fontSize: 10, color: "#EEEDFE", fontWeight: 500,
        }}>
          {keyPrefix[0]}
        </div>
        <span style={{
          fontSize: 12, color: "rgba(255,255,255,0.65)",
          flex: 1, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {name}
        </span>
        <ChevronDown size={12} color="rgba(255,255,255,0.3)" />
      </div>
    </div>
  );
}

function NavButton({
  item, active, collapsed, onNav
}: {
  item:      NavItem;
  active:    boolean;
  collapsed: boolean;
  onNav:     (id: string) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onNav(item.id)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            collapsed ? 0 : 9,
        justifyContent: collapsed ? "center" : "flex-start",
        padding:        collapsed ? "8px" : "7px 10px",
        borderRadius:   6,
        background:     active ? "rgba(56,138,221,0.18)" : "transparent",
        border:         "none",
        cursor:         "pointer",
        color:          active ? "#85B7EB" : "rgba(255,255,255,0.45)",
        fontSize:       13,
        fontWeight:     active ? 500 : 400,
        width:          "100%",
        textAlign:      "left",
        transition:     "background 0.15s",
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      {!collapsed && item.label}
    </button>
  );
}