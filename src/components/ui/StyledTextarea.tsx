import { useState } from "react";
import { T } from "./DesignTokens";

export interface StyledTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function StyledTextarea({ label, style, ...rest }: StyledTextareaProps) {
  const [focus, setFocus] = useState(false);

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
      <textarea
        {...rest}
        style={{
          display: "block", width: "100%", boxSizing: "border-box",
          padding: "8px 11px", fontSize: 13, lineHeight: 1.6,
          background: T.bg, color: T.text, resize: "vertical",
          border: `1px solid ${focus ? T.borderFocus : T.border}`,
          borderRadius: T.radius, outline: "none",
          boxShadow: focus ? `0 0 0 3px ${T.borderFocus}22` : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          fontFamily: "inherit",
          ...style,
        }}
        onFocus={e => { setFocus(true);  rest.onFocus?.(e); }}
        onBlur={e  => { setFocus(false); rest.onBlur?.(e);  }}
      />
    </div>
  );
}