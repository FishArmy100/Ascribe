import React from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { use_settings } from "./contexts/SettingsContext";
import { AppSettings } from "../interop/settings";

const BUTTON_SIZE = 32;
const BUTTON_BORDER_RADIUS = 5;

export function get_button_size(settings: AppSettings): number
{
    return BUTTON_SIZE * settings.ui_scale;
}

export function get_button_border_radius(settings: AppSettings): number
{
    return BUTTON_BORDER_RADIUS * settings.ui_scale;
}

export type ImageButtonProps = {
    image: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export default function ImageButton({
    image,
    tooltip,
    disabled,
    active,
    onClick,
}: ImageButtonProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const button_size = get_button_size(settings);

    return (
        <Tooltip 
            disableInteractive
            followCursor
            placement="bottom-start"
            title={tooltip}
            enterDelay={500}
            disableHoverListener={false}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: "offset",
                            options: {
                                offset: [8, 8], // x, y distance from the anchor
                            },
                        },
                    ],
                },
            }}
        >
            <Button
                disabled={disabled}
                onClick={onClick}
                sx={{
                    backgroundColor: active ? theme.palette.secondary.main : theme.palette.primary.light,
                    borderRadius: `${5 * settings.ui_scale}px`,
                    borderWidth: `${1}px`,
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: `${button_size}px`,
                    height: `${button_size}px`,
                    minWidth: `${button_size}px`,
                    minHeight: `${button_size}px`,
                    cursor: disabled ? "not-allowed" : "pointer",
                    padding: `${5 * settings.ui_scale}px`,

                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
                    }
                }}

            >
                <img 
                    src={image} 
                    alt="" 
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                        boxSizing: "border-box",
                        opacity: disabled ? 0.5 : 1,
                        filter: disabled ? "grayscale(100%)" : "none"
                    }}
                />
            </Button>
        </Tooltip>
    )
}