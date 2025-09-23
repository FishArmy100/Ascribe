import { Toolbar } from "@mui/material";
import React from "react";
import { use_settings } from "./SettingsContext";
import { get_top_bar_size } from "./TopBar";


export default function TopBarSpacer(): React.ReactElement
{
    const { settings } = use_settings();

    return <Toolbar sx={{
        minHeight: get_top_bar_size(settings)
    }} />
}