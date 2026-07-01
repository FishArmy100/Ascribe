import { Button, SxProps, Theme, Typography, TypographyVariant, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import Tooltip from "./Tooltip";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "./ImageButton";
import { play_sfx, Sfx } from "@interop/sfx";
import WrapIf from "./WrapIf";

export type TextButtonVariant = "default" | "inverted" | "info" | "error";

export type TextButtonProps = {
    text: string,
    text_props?: { variant?: TypographyVariant, bold?: boolean, sx?: SxProps<Theme> }
    tooltip: string | null,
    disabled?: boolean,
    active?: boolean,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    sx?: SxProps<Theme>,
    sfx?: Sfx | "none",
    variant?: TextButtonVariant,
    bold?: boolean,
    italics?: boolean,
}

export default function TextButton({
    text,
    text_props,
    tooltip,
    disabled,
    active,
    on_click,
    sx,
    sfx = "click",
    variant,
}: TextButtonProps): React.ReactElement
{
    const theme = useTheme();
    const handle_click = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (sfx && sfx !== "none")
        {
            play_sfx(sfx);
        }
        on_click?.(event);
    }, [on_click, sfx]);
    
    const background_color = useMemo(() => {
        if (!variant || variant === "default")
        {
            return active ? 
                theme.palette.secondary.main : 
                theme.palette.primary.light;
        }
        else if (variant === "error")
        {
            return active ?
                theme.palette.error.main :
                theme.palette.error.light
        }
        else if (variant === "info")
        {
            return active ?
                theme.palette.info.main :
                theme.palette.info.light
        }
        else if (variant === "inverted")
        {
            return active ? 
                theme.palette.background.default :
                theme.palette.primary.main;
        }
        else
        {
            console.error(`Invalid variant ${variant}`);
            return null as any;
        }
    }, [variant, active, theme]);

    const hover_background_color = useMemo(() => {
        if (!variant || variant === "default")
        {
            return theme.palette.primary.dark;
        }
        else if (variant === "error")
        {
            return theme.palette.error.dark;
        }
        else if (variant === "info")
        {
            return theme.palette.info.dark;
        }
        else if (variant === "inverted")
        {
            return theme.palette.primary.dark;
        }
        else
        {
            console.error(`Invalid variant ${variant}`);
            return null as any;
        }
    }, [variant, theme]);
    
    const text_color = useMemo(() => {
        return theme.palette.getContrastText(background_color);
    }, [background_color, theme]);

    return (
        <WrapIf 
            cond={tooltip !== null}
            wrapper={Tooltip}
            props={{ tooltip: tooltip! }}
        >
            <Button
                disabled={disabled}
                onClick={handle_click}
                sx={{
                    backgroundColor: background_color,
                    color: text_color,
                    borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderWidth: (theme) => theme.spacing(1 / 8),
                    borderColor: theme.palette.divider,
                    borderStyle: "solid",
                    width: "fit-content",
                    minWidth: "fit-content",
                    cursor: disabled ? "not-allowed" : "pointer",
                    padding: BUTTON_PADDING,
                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
                    },
                    "&:hover": {
                        backgroundColor: !active
                            ? hover_background_color
                            : theme.palette.action.hover,
                    },
                    ...sx,
                }}
            >
                <Typography
                    variant={text_props?.variant ?? "body1"}
                    textAlign="center"
                    sx={{
                        color: theme.palette.common.black,
                        opacity: disabled ? 0.5 : 1,
                        filter: disabled ? "grayscale(100%)" : "none",
                        fontWeight: text_props?.bold ? "bold" : undefined,
                        ...text_props?.sx,
                    }}
                >
                    {text}
                </Typography>
            </Button>
        </WrapIf>
    );
}