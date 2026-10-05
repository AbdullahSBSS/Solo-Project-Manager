// types/ui.types.ts
export const VIEW_IDS = ["board", "backlog", "settings"] as const;
export type ViewId = (typeof VIEW_IDS)[number];

export interface UIState {
  activeView: ViewId;
}