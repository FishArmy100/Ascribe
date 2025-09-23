import { AppBar, Toolbar, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { AppSettings } from "../interop/settings"
import { use_settings } from "./SettingsContext"
import { get_button_size } from "./ImageButton"

export function get_top_bar_size(settings: AppSettings): { sm: number, xs: number }
{
    return {
        sm: 40 * settings.ui_scale,
        xs: 50 * settings.ui_scale,
    }
}

export type TopBarProps = {
    children: React.ReactNode
}

export default function TopBar({ 
    children 
}: TopBarProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const bar_size = get_top_bar_size(settings);
    const button_size = get_button_size(settings);
    
    let padding_x;
    if (useMediaQuery(theme.breakpoints.only("xs")))
    {
        padding_x = (bar_size.xs - button_size) / 2;
    }
    else
    {
        padding_x = (bar_size.sm - button_size) / 2;
    }

    return (
        <AppBar 
            position="fixed" 
            color="primary" 
            role="banner"
        >
            <Toolbar 
                variant="dense"
                sx={{
                    minHeight: bar_size,
                    px: `${padding_x}px`
                }}
                disableGutters
            >
                {children}
            </Toolbar>
        </AppBar>
    )
}