import React from "react";
import { Button, Tooltip } from "@mui/material";
import { use_settings } from "./SettingsContext";

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
    let { settings } = use_settings();
    const TEST_SIZE = 48;
    return (
        <Tooltip title={tooltip}>
            <Button
                disabled={disabled}
                onClick={onClick}
                sx={{
                    width: `${TEST_SIZE * (settings?.ui_scale ?? 1) }px`,
                    height: `${TEST_SIZE * (settings?.ui_scale ?? 1)}px`,
                    padding: `0px`,
                    minWidth: `${TEST_SIZE * (settings?.ui_scale ?? 1)}px`,
                    minHeight: `${TEST_SIZE * (settings?.ui_scale ?? 1)}px`,
                    cursor: disabled ? "not-allowed" : "pointer",

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