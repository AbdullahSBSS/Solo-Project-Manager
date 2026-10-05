import type { AppState } from "../types";

const STORAGE_KEY = "solo_pm_v1";

// ─────────────────────────────────────────
// DRIVER INTERFACE
// The abstraction that makes the service
// swappable. IndexedDB, localStorage, or
// a remote API all satisfy this shape.
// ─────────────────────────────────────────
interface StorageDriver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// ─────────────────────────────────────────
// DRIVER IMPLEMENTATIONS
// ─────────────────────────────────────────

// Production: IndexedDB via idb library
// import { openDB } from "idb";
// const db = await openDB("solo_pm", 1, {
//   upgrade(db) { db.createObjectStore("kv"); }
// });
// const IndexedDBDriver: StorageDriver = {
//   get:    (k)    => db.get("kv", k) ?? null,
//   set:    (k, v) => db.put("kv", v, k),
//   delete: (k)    => db.delete("kv", k),
// };

// Artifact sandbox: window.storage driver
const WindowStorageDriver: StorageDriver = {
  get: async (k) => {
    try {
      const r = await window.storage.get(k);
      return r ? r.value : null;
    } catch { return null; }
  },
  set: async (k, v) => {
    try { await window.storage.set(k, v); }
    catch (e) { console.error("[Storage] write failed:", e); }
  },
  delete: async (k) => {
    try { await window.storage.delete(k); }
    catch (e) { console.error("[Storage] delete failed:", e); }
  },
};

// Swap this single line to change the driver everywhere
const driver: StorageDriver = WindowStorageDriver;

// ─────────────────────────────────────────
// DEBOUNCE
// Prevents thrashing on rapid state changes
// (e.g. dragging a card across the board).
// ─────────────────────────────────────────
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─────────────────────────────────────────
// PUBLIC API
// load() — called once on boot by StoreProvider
// save() — called on every state change, debounced
// clear() — called by "Reset project" in Settings
// ─────────────────────────────────────────
async function load(): Promise<AppState | null> {
  try {
    const raw = await driver.get(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Sanity check: reject clearly corrupt data
    if (!parsed || typeof parsed !== "object" || !parsed.version) {
      console.warn("[Storage] corrupt state detected, starting fresh");
      return null;
    }
    return parsed as AppState;
  } catch (e) {
    // JSON.parse failure or driver error — never crash the app
    console.error("[Storage] load failed:", e);
    return null;
  }
}

const save = debounce(async (state: AppState): Promise<void> => {
  try {
    await driver.set(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("[Storage] save failed:", e);
  }
}, 300);

async function clear(): Promise<void> {
  try {
    await driver.delete(STORAGE_KEY);
  } catch (e) {
    console.error("[Storage] clear failed:", e);
  }
}

export const StorageService = { load, save, clear };