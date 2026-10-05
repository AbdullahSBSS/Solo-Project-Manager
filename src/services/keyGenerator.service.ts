import type { AppState } from "../types";

// ─────────────────────────────────────────
// KEY FORMAT
// "{PROJECT_KEY}-{ZERO_PADDED_NUMBER}"
// e.g. SPM-001, SPM-042, SPM-100
//
// Design decisions:
//   - Numbers never reuse a deleted ticket's number.
//     (max + 1, not count + 1 — prevents key collisions
//      if a ticket is deleted and a new one is created)
//   - Zero-padded to 3 digits for consistent sort order.
//     Expands naturally beyond 999 (SPM-1000 sorts correctly
//     as a string once it exceeds 3 digits).
//   - Project key is always uppercased for consistency.
// ─────────────────────────────────────────
function generate(state: AppState): string {
  const project = state.projects[state.activeProjectId];

  if (!project) {
    throw new Error(
      `[KeyGenerator] no active project found for id: ${state.activeProjectId}`
    );
  }

  const prefix = project.key.toUpperCase();

  // Extract all existing numbers for this project's tickets
  const existingNumbers = Object.values(state.tickets)
    .filter(t => t.projectId === state.activeProjectId)
    .map(t => {
      const parts = t.key.split("-");
      const num   = parseInt(parts[1] ?? "0", 10);
      return isNaN(num) ? 0 : num;
    });

  // max+1 ensures we never reuse a number, even after deletions
  const next = existingNumbers.length
    ? Math.max(...existingNumbers) + 1
    : 1;

  return `${prefix}-${String(next).padStart(3, "0")}`;
}

// ─────────────────────────────────────────
// PREVIEW
// Used by the create form to show the user
// what key their ticket will receive before
// they submit. Read-only — does not mutate.
// ─────────────────────────────────────────
function preview(state: AppState): string {
  return generate(state);
}

// ─────────────────────────────────────────
// PARSE
// Extracts the numeric part from a key string.
// Useful for sorting tickets by key in the
// Backlog view (sort by number, not string).
// ─────────────────────────────────────────
function parse(key: string): { prefix: string; number: number } {
  const [prefix, numStr] = key.split("-");
  return {
    prefix: prefix ?? "",
    number: parseInt(numStr ?? "0", 10),
  };
}

export const KeyGeneratorService = { generate, preview, parse };