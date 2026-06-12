import { useTheme } from "@mui/material";
import React from "react";

export type LabelPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "left"
    | "right";

export type OptionGroupProps = {
    label: string;
    children: React.ReactNode;
    label_props?: { position: LabelPosition, background?: string }
};

export default function OptionGroup({
  label,
  children,
  label_props
}: OptionGroupProps): React.ReactElement {
    const theme = useTheme();

    const label_position = label_props?.position ?? "top-left"
    const is_top    = label_position.startsWith("top");
    const is_bottom = label_position.startsWith("bottom");
    const is_left   = label_position === "left";
    const is_right  = label_position === "right";

    const base_label_styles: React.CSSProperties = {
        fontSize: "0.75rem",
        padding: `0 ${theme.spacing(0.5)}`,
        fontFamily: "inherit",
        position: "absolute",
        whiteSpace: "nowrap",
        color: theme.palette.text.primary,
        background: label_props?.background ?? theme.palette.background.default,
    };

    const label_position_styles: Record<LabelPosition, React.CSSProperties> = {
        "top-left":      { top: 0, left: theme.spacing(1.5),  transform: "translateY(-50%)" },
        "top-center":    { top: 0, left: "50%",               transform: "translate(-50%, -50%)" },
        "top-right":     { top: 0, right: theme.spacing(1.5), transform: "translateY(-50%)" },
        "bottom-left":   { bottom: 0, left: theme.spacing(1.5),  transform: "translateY(50%)" },
        "bottom-center": { bottom: 0, left: "50%",               transform: "translate(-50%, 50%)" },
        "bottom-right":  { bottom: 0, right: theme.spacing(1.5), transform: "translateY(50%)" },
        "left":          { top: "50%", left: 0,  transform: "translate(-50%, -50%) rotate(-90deg)" },
        "right":         { top: "50%", right: 0, transform: "translate(50%, -50%) rotate(90deg)" },
    };

    return (
        <fieldset
            style={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.spacing(0.5),
                paddingTop:    is_top    ? theme.spacing(2) : theme.spacing(1),
                paddingBottom: is_bottom ? theme.spacing(2) : theme.spacing(1),
                paddingLeft:   is_left   ? theme.spacing(3) : theme.spacing(2),
                paddingRight:  is_right  ? theme.spacing(3) : theme.spacing(2),
                margin: 0,
                position: "relative",
            }}
        >
            <span style={{ ...base_label_styles, ...label_position_styles[label_position] }}>
                {label}
            </span>

            {children}
        </fieldset>
    );
}