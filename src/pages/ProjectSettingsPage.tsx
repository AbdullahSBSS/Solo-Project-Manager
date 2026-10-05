// pages/ProjectSettingsPage.tsx
import { useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import {
  SlidersHorizontal, Circle, Tag, Database,
  Download, Upload, Trash2, type LucideIcon,
} from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useTickets } from "../hooks/useTickets";
import { usePersistence } from "../hooks/usePersistence";
import { Button } from "../components/ui/Button";
import { StyledInput } from "../components/ui/StyledInput";
import { StyledTextarea } from "../components/ui/StyledTextarea";
import { T } from "../components/ui/DesignTokens";

type TabId = "general" | "statuses" | "labels" | "data";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "general",  label: "General",  icon: SlidersHorizontal },
  { id: "statuses", label: "Statuses", icon: Circle },
  { id: "labels",   label: "Labels",   icon: Tag },
  { id: "data",     label: "Data",     icon: Database },
];

const card: CSSProperties = {
  background: T.bg,
  border: `1px solid ${T.border}`,
  borderRadius: T.radiusLg,
  padding: 20,
};

export function ProjectSettingsPage() {
  const [tab, setTab] = useState<TabId>("general");

  return (
    <div style={{ maxWidth: 620 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 500 }}>
        Project Settings
      </h2>

      <div role="tablist" style={{
        display: "flex", gap: 2, marginBottom: 20,
        borderBottom: `1px solid ${T.border}`, overflowX: "auto",
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 13, padding: "7px 12px", border: "none",
                background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
                color: active ? T.text : T.textMuted,
                fontWeight: active ? 500 : 400,
                borderBottom: `2px solid ${active ? T.blue : "transparent"}`,
                fontFamily: "inherit",
              }}
            >
              <Icon size={13} /> {label}
            </button>
          );
        })}
      </div>

      {tab === "general"  && <GeneralTab />}
      {tab === "statuses" && <StatusesTab />}
      {tab === "labels"   && <LabelsTab />}
      {tab === "data"     && <DataTab />}
    </div>
  );
}

// ── General ───────────────────────────────────
function GeneralTab() {
  const { project, updateProject } = useProject();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const dirty = name !== project.name || description !== project.description;

  const save = () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    updateProject({ name: name.trim(), description });
    setError(undefined);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
      <StyledInput
        label="Project name"
        value={name}
        error={error}
        onChange={e => { setName(e.target.value); setError(undefined); }}
      />
      <StyledInput
        label="Project key"
        value={project.key}
        readOnly
        style={{ width: 100, background: T.bgSub, color: T.textMuted }}
      />
      <StyledTextarea
        label="Description"
        rows={3}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div>
        <Button
          variant="primary"
          disabled={!dirty && !saved}
          onClick={save}
          style={saved ? { background: T.success } : undefined}
        >
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

// ── Statuses ──────────────────────────────────
function StatusesTab() {
  const { statusConfigs } = useProject();
  const { countByStatus } = useTickets();

  return (
    <div style={card}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {statusConfigs.map(s => (
          <div key={s.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: T.radius,
            border: `1px solid ${T.border}`,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 13, flex: 1 }}>{s.name}</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>
              {countByStatus[s.id] ?? 0} tickets · {s.category.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 12, color: T.textMuted }}>
        Columns are fixed for now. Editing them comes with custom columns.
      </p>
    </div>
  );
}

// ── Labels ────────────────────────────────────
function LabelsTab() {
  const { labels } = useProject();

  return (
    <div style={card}>
      {labels.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>
          No labels yet. Label management isn't built yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {labels.map(l => (
            <span key={l.id} style={{
              fontSize: 12, padding: "3px 10px", borderRadius: 999,
              background: `${l.color}18`, color: l.color, border: `1px solid ${l.color}44`,
            }}>
              {l.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Data ──────────────────────────────────────
function DataTab() {
  const { all } = useTickets();
  const { project, resetProject } = useProject();
  const { exportJson, importJson, schemaVersion } = usePersistence();

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string }>();

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";                 // allow re-picking the same file
    setPendingFile(file);
    setMessage(undefined);
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    const result = await importJson(pendingFile);
    setPendingFile(null);
    setMessage(
      result.ok
        ? { kind: "ok", text: "Import complete. Your previous data was replaced." }
        : { kind: "error", text: result.error }
    );
  };

  const confirmResetNow = () => {
    resetProject();
    setConfirmReset(false);
    setMessage({ kind: "ok", text: "Project data cleared." });
  };

  return (
    <div style={card}>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: T.textSub }}>
        {all.length} ticket{all.length === 1 ? "" : "s"} · schema v{schemaVersion} ·
        saved automatically on every change.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button icon={<Download size={13} />} onClick={exportJson}>
          Export JSON
        </Button>
        <Button icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
          Import JSON
        </Button>
        <Button
          variant="danger"
          icon={<Trash2 size={13} />}
          onClick={() => { setConfirmReset(true); setMessage(undefined); }}
        >
          Reset project
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onPick}
          style={{ display: "none" }}
        />
      </div>

      {pendingFile && (
        <ConfirmBar
          text={`Replace ALL current data with "${pendingFile.name}"? Export first if you might want it back.`}
          confirmLabel="Replace data"
          onConfirm={confirmImport}
          onCancel={() => setPendingFile(null)}
        />
      )}

      {confirmReset && (
        <ConfirmBar
          text={`Delete all ${all.length} tickets in "${project.name}"? This can't be undone.`}
          confirmLabel="Delete everything"
          onConfirm={confirmResetNow}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {message && (
        <p role="status" style={{
          margin: "12px 0 0", fontSize: 12,
          color: message.kind === "ok" ? T.success : T.danger,
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
}

function ConfirmBar({
  text, confirmLabel, onConfirm, onCancel,
}: {
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      marginTop: 12, padding: 12, borderRadius: T.radius,
      background: T.dangerLight, border: "1px solid #FCA5A5",
    }}>
      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 500, color: T.danger }}>
        {text}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" variant="primary" style={{ background: T.danger }} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}