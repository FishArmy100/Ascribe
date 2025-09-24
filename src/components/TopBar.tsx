import { AppBar, Stack, Theme, Toolbar, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { AppSettings } from "../interop/settings"
import { use_settings } from "./SettingsContext"
import { get_button_size } from "./ImageButton"

export function use_top_bar_size(settings: AppSettings, theme: Theme): number 
{
    const isXs = useMediaQuery(theme.breakpoints.only("xs"));
    return isXs ? 50 * settings.ui_scale : 40 * settings.ui_scale;
}

export function use_top_bar_padding(settings: AppSettings, theme: Theme): number 
{
    const bar_size = use_top_bar_size(settings, theme);
    const button_size = get_button_size(settings);
    return (bar_size - button_size) / 2;
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
    const bar_size = use_top_bar_size(settings, theme);
    const padding = use_top_bar_padding(settings, theme);

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
                    px: `${padding}px`,
                    py: `${padding}px`
                }}
                disableGutters
            >
                <Stack
                    gap={`${padding}px`}
                    direction={"row"}
                >
                    {React.Children.map(children, (child, index) =>
                        React.isValidElement(child)
                            ? React.cloneElement(child, { key: child.key ?? index })
                            : child
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    )
}