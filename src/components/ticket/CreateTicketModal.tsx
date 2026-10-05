import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTickets } from "../../hooks/useTickets";
import { useProject } from "../../hooks/useProject";
import { TicketForm, type TicketFormValues } from "./TicketForm";
import { Button } from "../ui/Button";
import { T } from "../ui/DesignTokens";

interface CreateTicketModalProps {
  defaultStatusId: string;
  close: () => void;
}

type FormErrors = Partial<Record<keyof TicketFormValues, string>>;

const BLANK: TicketFormValues = {
  title: "",
  type: "task",
  priority: "medium",
  statusId: "",
  description: "",
};

// Owns form values, validation, and the createTicket call.
// How it is overlaid is ModalProvider's concern.
export function CreateTicketModal({ defaultStatusId, close }: CreateTicketModalProps) {
  const { createTicket, nextKey } = useTickets();
  const { statusConfigs } = useProject();

  const [values, setValues] = useState<TicketFormValues>({
    ...BLANK,
    statusId: defaultStatusId,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (patch: Partial<TicketFormValues>) => {
    setValues(v => ({ ...v, ...patch }));
    // Clear the error for every field that just changed
    setErrors(prev => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof TicketFormValues)[]).forEach(k => {
        delete next[k];
      });
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.title.trim()) next.title = "Title is required";
    if (Object.keys(next).length) {
      setErrors(next);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createTicket({
      title: values.title.trim(),
      type: values.type,
      priority: values.priority,
      statusId: values.statusId,
      description: values.description,
    });
    close();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 301,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, pointerEvents: "none",
    }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          pointerEvents: "all", background: T.bg,
          borderRadius: T.radiusLg, border: `1px solid ${T.border}`,
          boxShadow: T.shadow, width: "100%", maxWidth: 480, overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "15px 20px", borderBottom: `1px solid ${T.border}`,
          background: T.bgSub,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, background: T.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Create Ticket</span>
            <span style={{
              fontSize: 12, fontFamily: "monospace", color: T.textMuted,
              background: T.bgSub, border: `1px solid ${T.border}`,
              padding: "1px 7px", borderRadius: 999,
            }}>
              {nextKey}
            </span>
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

        <div style={{ padding: "20px 20px 16px" }}>
          <TicketForm
            values={values}
            onChange={onChange}
            errors={errors}
            statusConfigs={statusConfigs}
          />
        </div>

        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "12px 20px", borderTop: `1px solid ${T.border}`,
          background: T.bgSub,
        }}>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create</Button>
        </div>
      </div>
    </div>
  );
}