import { Toolbar, useTheme } from "@mui/material";
import React from "react";
import { use_settings } from "./providers/SettingsProvider";
import { use_top_bar_padding, use_top_bar_size } from "./TopBar";


export default function TopBarSpacer(): React.ReactElement
{
    const theme = useTheme();
    const { settings } = use_settings();
    const padding = use_top_bar_padding(settings, theme);

    return <Toolbar 
        variant="dense"
        sx={{
            minHeight: use_top_bar_size(settings, theme),
            px: `${padding}px`,
            py: `${padding}px`
        }}
        disableGutters
    />
}