import React from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { use_settings } from "./SettingsContext";
import { AppSettings } from "../interop/settings";

const BUTTON_SIZE = 32;

export function get_button_size(settings: AppSettings): number
{
    return BUTTON_SIZE * settings.ui_scale;
}

export type ImageButtonProps = {
    image: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    onClick?: () => void,
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
    return (
        <Tooltip title={tooltip}>
            <Button
                disabled={disabled}
                onClick={onClick}
                sx={{
                    backgroundColor: active ? theme.palette.secondary.main : theme.palette.primary.light,
                    borderRadius: `${3 * settings.ui_scale}px`,
                    borderWidth: `${1}px`,
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: `${BUTTON_SIZE * (settings?.ui_scale ?? 1) }px`,
                    height: `${BUTTON_SIZE * (settings?.ui_scale ?? 1)}px`,
                    minWidth: `${BUTTON_SIZE * (settings?.ui_scale ?? 1)}px`,
                    minHeight: `${BUTTON_SIZE * (settings?.ui_scale ?? 1)}px`,
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