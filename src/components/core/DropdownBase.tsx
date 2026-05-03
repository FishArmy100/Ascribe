import { Box, Paper, SxProps, Theme, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ImageButton from "./ImageButton";
import TextButton from "./TextButton";
import { IMAGE_DROPDOWN_PADDING } from "./ImageDropdown";

export type DropdownButton =
    | { type: "image"; src: string; tooltip: string; sx?: SxProps<Theme> }
    | { type: "text"; text: string; tooltip: string; sx?: SxProps<Theme> }
    | { type: "element"; element_builder: (on_click: () => void) => React.ReactElement };

export type DropdownPlacement = "top" | "bottom" | "auto";

export type DropdownBaseProps = {
    button: DropdownButton;
    is_open: boolean;
    on_click: () => void;
    children: React.ReactNode;
    disable_hover?: boolean;
    content_z_index?: number;
    panel_sx?: SxProps<Theme>;
    placement?: DropdownPlacement;
};

export default function DropdownBase({
    button,
    is_open,
    on_click,
    children,
    disable_hover,
    content_z_index = 1000,
    panel_sx,
    placement = "auto",
}: DropdownBaseProps): React.ReactElement {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [resolved_placement, set_resolved_placement] = useState<"top" | "bottom">("bottom");

    const resolve_placement = useCallback(() => {
        if (placement !== "auto") return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        set_resolved_placement(
            window.innerHeight - rect.bottom >= rect.top ? "bottom" : "top"
        );
    }, [placement]);

    // Recalculate when opened via click (is_open state change)
    useEffect(() => {
        if (is_open) resolve_placement();
    }, [is_open, resolve_placement]);

    // Recalculate on hover — covers the CSS-only hover path when disable_hover is false
    useEffect(() => {
        if (disable_hover || placement !== "auto") return;
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("mouseenter", resolve_placement);
        return () => container.removeEventListener("mouseenter", resolve_placement);
    }, [disable_hover, placement, resolve_placement]);

    const effective_placement: "top" | "bottom" =
        placement === "auto" ? resolved_placement : placement;

    let button_element: React.ReactElement;
    if (button.type === "image") {
        button_element = (
            <ImageButton
                image={button.src}
                tooltip={button.tooltip}
                active={is_open}
                on_click={on_click}
                sx={button.sx}
            />
        );
    } else if (button.type === "text") {
        button_element = (
            <TextButton
                text={button.text}
                tooltip={button.tooltip}
                active={is_open}
                on_click={on_click}
                sx={button.sx}
            />
        );
    } else {
        button_element = button.element_builder(on_click);
    }

    const placement_sx: SxProps<Theme> =
        effective_placement === "top"
            ? {
                  bottom: "100%",
                  top: "auto",
                  "&::before": {
                      top: "auto",
                      bottom: theme.spacing(-1),
                  },
              }
            : {
                  top: "100%",
                  bottom: "auto",
                  "&::before": {
                      top: theme.spacing(-1),
                      bottom: "auto",
                  },
              };

    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                ...(!disable_hover && {
                    "&:hover > .dropdown-content": {
                        opacity: 1,
                        visibility: "visible",
                        pointerEvents: "auto",
                    },
                }),
            }}
        >
            {button_element}
            <Paper
                sx={{
                    position: "absolute",
                    top: "100%",
                    left: (theme) => theme.spacing(-IMAGE_DROPDOWN_PADDING),
                    padding: IMAGE_DROPDOWN_PADDING,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease",
                    zIndex: content_z_index,
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: theme.spacing(1),
                        left: 0,
                        right: 0,
                        height: theme.spacing(1),
                    },
                    ...placement_sx,
                    ...panel_sx,
                }}
                className="dropdown-content"
            >
                {children}
            </Paper>
        </Box>
    );
}