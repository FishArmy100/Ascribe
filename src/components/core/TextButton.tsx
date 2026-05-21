import { Button, SxProps, Theme, Typography, TypographyVariant, useTheme } from "@mui/material";
import React, { useCallback } from "react";
import Tooltip from "./Tooltip";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "./ImageButton";
import { play_sfx, Sfx } from "@interop/sfx";

export type TextButtonProps = {
    text: string,
    text_props?: { variant?: TypographyVariant, bold?: boolean, sx?: SxProps<Theme> }
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    sx?: SxProps<Theme>,
    sfx?: Sfx | "none",
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

    return (
        <Tooltip
            tooltip={tooltip}
        >
            <Button
                disabled={disabled}
                onClick={handle_click}
                sx={{
                    backgroundColor: active ? theme.palette.secondary.main : theme.palette.primary.light,
                    borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderWidth: (theme) => theme.spacing(1 / 8),
                    borderColor: theme.palette.divider,
                    borderStyle: "solid",
                    width: "fit-content",
                    height: (theme) => theme.spacing(BUTTON_SIZE),
                    minWidth: "fit-content",
                    minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                    cursor: disabled ? "not-allowed" : "pointer",
                    padding: BUTTON_PADDING,
                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
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
        </Tooltip>
    );
}