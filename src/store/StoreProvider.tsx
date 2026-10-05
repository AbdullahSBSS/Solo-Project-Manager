import {
  createContext, useContext, useEffect, useMemo,
  useReducer, useState,
  type Dispatch, type ReactNode,
} from "react";
import type { AppState } from "../types";
import type { AppAction } from "./actions";
import { reducer } from "./reducer";
import { createInitialState } from "./initialState";
import { StorageService } from "../services/storage.service";
import { MigrationService } from "../services/migration.service";

interface StoreContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

// Responsibilities (and nothing else):
//   1. Hydrate from storage on boot
//   2. Persist to storage on every change
//   3. Expose state + dispatch via context
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [ready, setReady] = useState(false);

  // Boot: load persisted state, migrate, hydrate
  useEffect(() => {
    StorageService.load().then(persisted => {
      if (persisted) {
        dispatch({ type: "HYDRATE", payload: MigrationService.migrate(persisted) });
      }
      setReady(true);
    });
  }, []);

  // Persist: the ready guard stops the initial state from overwriting
  // saved data before hydration has completed.
  useEffect(() => {
    if (ready) StorageService.save(state);
  }, [state, ready]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  if (!ready) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", color: "#9F9D97", fontSize: 13,
      }}>
        Loading…
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}