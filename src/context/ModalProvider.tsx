import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { CreateTicketModal } from "../components/ticket/CreateTicketModal";
import { TicketDetailPanel } from "../components/ticket/TicketDetailPanel";

// Adding a modal = one union member here + one line in ModalRenderer.
type ModalType =
  | { type: "create"; props: { defaultStatusId: string } }
  | { type: "detail"; props: { ticketId: string } };
  // | { type: "sprint"; props: { sprintId?: string } }
  // | { type: "epic";   props: { epicId?: string   } }

interface ModalContextValue {
  modal: ModalType | null;
  open: <K extends ModalType["type"]>(
    type: K,
    props: Extract<ModalType, { type: K }>["props"]
  ) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}

// Owns all overlay side effects exactly once: Escape key + body scroll lock.
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalType | null>(null);

  const open = useCallback(
    <K extends ModalType["type"]>(
      type: K,
      props: Extract<ModalType, { type: K }>["props"]
    ) => setModal({ type, props } as ModalType),
    []
  );

  const close = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [modal, close]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const value = useMemo(() => ({ modal, open, close }), [modal, open, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer modal={modal} close={close} />
    </ModalContext.Provider>
  );
}

// The only place that maps a modal type to a component.
function ModalRenderer({
  modal, close,
}: {
  modal: ModalType | null;
  close: () => void;
}) {
  if (!modal) return null;

  return (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.5)", transition: "opacity 0.2s",
        }}
      />
      {modal.type === "create" && (
        <CreateTicketModal {...modal.props} close={close} />
      )}
      {modal.type === "detail" && (
        <TicketDetailPanel {...modal.props} close={close} />
      )}
    </>
  );
}