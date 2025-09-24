import { Toolbar, useTheme } from "@mui/material";
import React from "react";
import { use_settings } from "./SettingsContext";
import { use_top_bar_size } from "./TopBar";


export default function TopBarSpacer(): React.ReactElement
{
    const theme = useTheme();
    const { settings } = use_settings();

    return <Toolbar sx={{
        minHeight: use_top_bar_size(settings, theme)
    }} />
}