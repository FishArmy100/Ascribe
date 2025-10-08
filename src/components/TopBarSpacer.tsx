import { Toolbar, useTheme } from "@mui/material";
import React from "react";
import { use_settings } from "./providers/SettingsProvider";
import { use_top_bar_padding, use_top_bar_size } from "./TopBar";


export default function TopBarSpacer(): React.ReactElement
{
    const theme = useTheme();
    const padding = use_top_bar_padding(theme);

    return <Toolbar 
        variant="dense"
        sx={{
            minHeight: use_top_bar_size(theme),
            px: padding,
            py: padding
        }}
        disableGutters
    />
}