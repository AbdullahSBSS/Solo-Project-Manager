import type { AppState } from "../types";

// ─────────────────────────────────────────
// MIGRATION FUNCTION TYPE
// Each migration is a pure function:
// takes the previous state shape,
// returns the next state shape.
// They never throw — they degrade gracefully.
// ─────────────────────────────────────────
type Migration = (state: any) => any;

// ─────────────────────────────────────────
// MIGRATION REGISTRY
// Key = the version the migration produces.
// To add a migration: add one entry here.
// Nothing else needs to change.
//
// Example scenarios that would need a migration:
//   v2: tickets gain a `storyPoints` field
//   v3: statusConfigs gain an `icon` field
//   v4: `activeProjectId` moves into `ui`
// ─────────────────────────────────────────
const MIGRATIONS: Record<number, Migration> = {

  // v1 → v2 example (not yet needed, shown for pattern):
  // 2: (state) => ({
  //   ...state,
  //   version: 2,
  //   tickets: Object.fromEntries(
  //     Object.entries(state.tickets).map(([id, t]: any) => [
  //       id,
  //       { ...t, storyPoints: t.storyPoints ?? null },
  //     ])
  //   ),
  // }),

};

const CURRENT_VERSION = 1;

// ─────────────────────────────────────────
// PUBLIC API
// Called by StoreProvider after load(),
// before dispatch("HYDRATE").
//
// Walks the migration chain from the stored
// version up to CURRENT_VERSION, applying
// each step in order.
// ─────────────────────────────────────────
function migrate(state: any): AppState {
  let current = state;
  const storedVersion = current.version ?? 0;

  if (storedVersion === CURRENT_VERSION) {
    return current as AppState; // nothing to do
  }

  if (storedVersion > CURRENT_VERSION) {
    // State is newer than this build — likely a rollback.
    // Return as-is and let the app handle what it can.
    console.warn(
      `[Migration] stored version (${storedVersion}) is ahead ` +
      `of current (${CURRENT_VERSION}). Skipping migrations.`
    );
    return current as AppState;
  }

  // Walk the chain: v1 → v2 → v3 → ... → CURRENT
  for (let v = storedVersion + 1; v <= CURRENT_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (!migration) continue;
    try {
      console.info(`[Migration] applying v${v - 1} → v${v}`);
      current = migration(current);
    } catch (e) {
      // A failed migration must never crash the app.
      // Log and continue with whatever state we have.
      console.error(`[Migration] v${v} failed:`, e);
    }
  }

  return current as AppState;
}

// ─────────────────────────────────────────
// UTILITIES
// Exposed for debugging and the Settings
// "Data" tab to display the schema version.
// ─────────────────────────────────────────
function getCurrentVersion(): number {
  return CURRENT_VERSION;
}

function needsMigration(state: any): boolean {
  return (state?.version ?? 0) < CURRENT_VERSION;
}

export const MigrationService = {
  migrate,
  getCurrentVersion,
  needsMigration,
};