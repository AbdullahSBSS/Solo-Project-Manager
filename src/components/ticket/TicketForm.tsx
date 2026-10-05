import { StyledInput } from "../ui/StyledInput";
import { StyledTextarea } from "../ui/StyledTextarea";
import { StyledSelect } from "../ui/StyledSelect";
import { PRIORITIES, TICKET_TYPES } from "../../types";
import type { Priority, StatusConfig, TicketType } from "../../types";

export interface TicketFormValues {
  title: string;
  type: TicketType;
  priority: Priority;
  statusId: string;
  description: string;
}

interface TicketFormProps {
  values: TicketFormValues;
  onChange: (patch: Partial<TicketFormValues>) => void;
  errors: Partial<Record<keyof TicketFormValues, string>>;
  statusConfigs: StatusConfig[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Field layout only — validation lives in CreateTicketModal.
export function TicketForm({
  values, onChange, errors, statusConfigs,
}: TicketFormProps) {
  const set =
    <K extends keyof TicketFormValues>(k: K) =>
    (v: TicketFormValues[K]) =>
      onChange({ [k]: v } as Partial<TicketFormValues>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StyledInput
        autoFocus
        label="Title"
        value={values.title}
        placeholder="What needs to be done?"
        onChange={e => set("title")(e.target.value)}
        error={errors.title}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StyledSelect
          label="Type"
          value={values.type}
          onChange={e => set("type")(e.target.value as TicketType)}
        >
          {TICKET_TYPES.map(t => (
            <option key={t} value={t}>{cap(t)}</option>
          ))}
        </StyledSelect>

        <StyledSelect
          label="Priority"
          value={values.priority}
          onChange={e => set("priority")(e.target.value as Priority)}
        >
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{cap(p)}</option>
          ))}
        </StyledSelect>
      </div>

      <StyledSelect
        label="Column"
        value={values.statusId}
        onChange={e => set("statusId")(e.target.value)}
      >
        {statusConfigs.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </StyledSelect>

      <StyledTextarea
        label="Description"
        value={values.description}
        placeholder="Add more details…"
        rows={3}
        onChange={e => set("description")(e.target.value)}
      />
    </div>
  );
}