import { AppBar, Box, Stack, Theme, Toolbar, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { AppSettings } from "../interop/settings"
import { use_settings } from "./providers/SettingsProvider"
import { BUTTON_SIZE } from "./core/ImageButton";

export function use_top_bar_size(theme: Theme): number 
{
    const isXs = useMediaQuery(theme.breakpoints.only("xs"));
    return 5
}

export function use_top_bar_padding(theme: Theme): number 
{
    const bar_size = use_top_bar_size(theme);;
    return (bar_size - BUTTON_SIZE) / 2;
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
    const theme = useTheme();
    const bar_size = use_top_bar_size(theme);
    const padding = use_top_bar_padding(theme);

    const react_children = React.Children.toArray(children).map((child, index) => {
        return React.isValidElement(child)
            ? React.cloneElement(child, { key: child.key ?? index })
            : child
    });

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
                    minHeight: (theme) => theme.spacing(bar_size),
                    px: padding,
                    py: padding
                }}
                disableGutters
            >
                <Stack
                    gap={padding}
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