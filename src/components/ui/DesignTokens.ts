// The single source of truth for the visual language.
// Import T wherever a raw value is needed.
// Changing a value here updates the entire app.

export const T = {
  // Surfaces
  bg:          "#FFFFFF",
  bgSub:       "#F8F7F5",
  bgHover:     "#F0EEE8",

  // Borders
  border:      "#E2E0DA",
  borderFocus: "#185FA5",

  // Text
  text:        "#1A1A2E",
  textSub:     "#5F5E5A",
  textMuted:   "#9F9D97",

  // Brand
  blue:        "#185FA5",
  blueLight:   "#E6F1FB",
  blueDark:    "#0F4070",

  // Semantic
  danger:      "#DC2626",
  dangerLight: "#FEF2F2",
  success:     "#3B6D11",
  warning:     "#D97706",

  // Shape
  radius:      8,
  radiusSm:    5,
  radiusLg:    12,

  // Shadow
  shadow:      "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
  shadowSm:    "0 1px 4px rgba(0,0,0,0.08)",
} as const;

// Priority colours — used by tickets and badges
export const PRIORITY_COLORS: Record<string, string> = {
  low:      "#6B7280",
  medium:   "#D97706",
  high:     "#EA580C",
  critical: "#DC2626",
};

// Status category colours — fallback when no StatusConfig is found
export const CATEGORY_COLORS: Record<string, string> = {
  todo:        "#888780",
  in_progress: "#378ADD",
  done:        "#639922",
};