import { useState } from "react";
import { useStore } from "../../store/StoreProvider";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BoardPage } from "../../pages/BoardPage";
import { BacklogPage } from "../../pages/BacklogPage";
import { ProjectSettingsPage } from "../../pages/ProjectSettingsPage";
import type { ViewId } from "../../types";

// Owns layout and view switching only.
export function AppShell() {
  const { state, dispatch } = useStore();
  const view = state.ui.activeView;
  const [collapsed, setCollapsed] = useState(false);

  const onNav = (v: string) =>
    dispatch({ type: "SET_VIEW", payload: v as ViewId });

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "var(--font-sans)",
    }}>
      <Sidebar
        activeView={view}
        onNav={onNav}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, overflow: "hidden",
      }}>
        <TopBar activeView={view} onNav={onNav} />

        <main style={{
          flex: 1, overflow: "auto", padding: 24,
          background: "var(--color-background-tertiary)",
        }}>
          {view === "board"    && <BoardPage />}
          {view === "backlog"  && <BacklogPage />}
          {view === "settings" && <ProjectSettingsPage />}
        </main>
      </div>
    </div>
  );
}