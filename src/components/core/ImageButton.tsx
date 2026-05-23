import React, { useCallback, useMemo } from "react";
import { Button, useTheme } from "@mui/material";
import { use_settings } from "../providers/SettingsProvider";
import { AppSettings } from "../../interop/settings";
import { SxProps } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
import Tooltip from "./Tooltip";
import { play_sfx, Sfx } from "@interop/sfx";

export const BUTTON_SIZE = 4;
export const BUTTON_BORDER_RADIUS = 0.75;
export const BUTTON_PADDING = 3 / 8;

export type ButtonVariant = "default" | "inverted" | "info" | "error";

export type ImageButtonProps = {
    image: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    sx?: SxProps<Theme>,
    sfx?: Sfx | "none",
    variant?: ButtonVariant
}

export default function ImageButton({
    image,
    tooltip,
    disabled,
    active,
    on_click,
    sx,
    sfx = "click",
    variant = "default",
}: ImageButtonProps): React.ReactElement
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
            console.log(`Invalid variant ${variant}`);
            return null as any;
        }
    }, [variant, active])

    const image_color = useMemo(() => {
        return theme.palette.getContrastText(background_color);
    }, [background_color])

    return (
        <Tooltip
            tooltip={tooltip}
        >
            <span>
                <Button
                    disabled={disabled}
                    onClick={handle_click}
                    sx={{
                        backgroundColor: background_color,
                        borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                        borderWidth: (theme) => theme.spacing(1 / 8),
                        borderColor: theme.palette.divider,
                        borderStyle: "solid",
                        width: (theme) => theme.spacing(BUTTON_SIZE),
                        height: (theme) => theme.spacing(BUTTON_SIZE),
                        minWidth: (theme) => theme.spacing(BUTTON_SIZE),
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
                    <img
                        src={image}
                        alt=""
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            boxSizing: "border-box",
                            opacity: disabled ? 0.5 : 1,
                            filter: disabled ? "grayscale(100%)" : "none"
                        }}
                    />
                </Button>
            </span>
        </Tooltip>
    )
}