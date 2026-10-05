import { useState } from "react";
import { T } from "./DesignTokens";

export interface StyledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?:   string;
  label?:   string;
}

export function StyledInput({ error, label, style, ...rest }: StyledInputProps) {
  const [focus, setFocus] = useState(false);

  const inputStyle: React.CSSProperties = {
    display:      "block",
    width:        "100%",
    boxSizing:    "border-box",
    padding:      "8px 11px",
    fontSize:     13,
    lineHeight:   1.5,
    background:   T.bg,
    color:        T.text,
    border:       `1px solid ${error ? T.danger : focus ? T.borderFocus : T.border}`,
    borderRadius: T.radius,
    outline:      "none",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    boxShadow:    focus
      ? `0 0 0 3px ${error ? T.danger : T.borderFocus}22`
      : "none",
    fontFamily:   "inherit",
    ...style,
  };

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label style={{
          display: "block", fontSize: 12,
          fontWeight: 500, color: T.textSub, marginBottom: 4,
        }}>
          {label}
        </label>
      )}
      <input
        {...rest}
        style={inputStyle}
        onFocus={e => { setFocus(true);  rest.onFocus?.(e); }}
        onBlur={e  => { setFocus(false); rest.onBlur?.(e);  }}
      />
      {error && (
        <p style={{ margin: "3px 0 0", fontSize: 11, color: T.danger }}>
          {error}
        </p>
      )}
    </div>
  );
}