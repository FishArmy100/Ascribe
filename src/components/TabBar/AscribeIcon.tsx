import React from "react";
import logo from "@assets/logos/ascribe.png"
import { useTheme } from "@mui/material";
import { BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";

export default function AscribeIcon(): React.ReactElement
{
    const theme = useTheme();
    return (
        <img 
            data-tauri-drag-region
            src={logo}
            style={{
                width: theme.spacing(BUTTON_SIZE / 1.5),
                height: theme.spacing(BUTTON_SIZE / 1.5),
                userSelect: "none",
            }}
        />
    )
}