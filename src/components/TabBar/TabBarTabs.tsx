import { Box, useTheme } from "@mui/material";
import React from "react";
import { TAB_BAR_HEIGHT } from "./TabBar";

export type TabBarTabProps = {
    width: string,
    left: string,
}

export default function TabBarTabs({
    width,
    left
}: TabBarTabProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <Box
            data-tauri-drag-region
            sx={{
                position: "absolute",
                width: width,
                height: theme.spacing(TAB_BAR_HEIGHT),
                left: left,
                top: 0,
                backgroundColor: "cyan",
            }}
        >
            
        </Box>
    )
}