import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { T } from "./DesignTokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const VARIANTS: Record<Variant, CSSProperties> = {
  primary:   { background: T.blue, color: "#fff", border: "none" },
  secondary: { background: T.bg, color: T.textSub, border: `1px solid ${T.border}` },
  ghost:     { background: "transparent", color: T.textSub, border: "none" },
  danger:    { background: T.dangerLight, color: T.danger, border: "1px solid #FECACA" },
};

const SIZES: Record<Size, CSSProperties> = {
  sm: { fontSize: 12, padding: "5px 10px" },
  md: { fontSize: 13, padding: "7px 14px" },
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  loading = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const inactive = disabled || loading;

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: T.radius,
    fontWeight: 500,
    cursor: inactive ? "not-allowed" : "pointer",
    opacity: inactive ? 0.55 : 1,
    transition: "background 0.15s, opacity 0.15s",
    fontFamily: "inherit",
    filter: hover && !inactive ? "brightness(0.95)" : "none",
    ...VARIANTS[variant],
    ...SIZES[size],
    ...style,
  };

  return (
    <button
      {...rest}
      disabled={inactive}
      style={baseStyle}
      onMouseEnter={e => { setHover(true);  onMouseEnter?.(e); }}
      onMouseLeave={e => { setHover(false); onMouseLeave?.(e); }}
    >
      {loading ? (
        <span style={{
          width: 12, height: 12, border: "2px solid currentColor",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}