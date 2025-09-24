import { AppBar, Box, Stack, Theme, Toolbar, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { AppSettings } from "../interop/settings"
import { use_settings } from "./contexts/SettingsContext"
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
    children: React.ReactNode,
    right_aligned?: number,
}

export default function TopBar({ 
    children,
    right_aligned = 0,
}: TopBarProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const bar_size = use_top_bar_size(settings, theme);
    const padding = use_top_bar_padding(settings, theme);

    const react_children = React.Children.toArray(children).map((child, index) => {
        return React.isValidElement(child)
            ? React.cloneElement(child, { key: child.key ?? index })
            : child
    });

    console.log(react_children.length)
    console.log(right_aligned)

    if (right_aligned > react_children.length)
    {
        throw new Error("Right aligned count cannot be greater than the child count")
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
                    px: `${padding}px`,
                    py: `${padding}px`
                }}
                disableGutters
            >
                <Stack
                    gap={`${padding}px`}
                    direction={"row"}
                    sx={{ width: "100%", boxSizing: "border-box" }}
                >
                    {react_children.slice(0, react_children.length - right_aligned)}
                    <Box sx={{ ml: "auto" }}>
                        {react_children.slice(react_children.length - right_aligned, react_children.length)}
                    </Box>
                </Stack>
            </Toolbar>
        </AppBar>
    )
}