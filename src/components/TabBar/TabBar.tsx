import ImageButton, { BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import { AppBar, Box, Divider, Stack, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as images from "@assets";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import WindowControlButtons from "./WindowControlButtons";
import AscribeIcon from "./AscribeIcon";
import TabBarTabs from "./TabBarTabs";

export type TabBarProps = {

}

export const TAB_BAR_BORDER_WIDTH: number = 1 / 8
export const TAB_BAR_HEIGHT: number = BUTTON_SIZE + BUTTON_PADDING * 2 + TAB_BAR_BORDER_WIDTH;

export default function TabBar({

}: TabBarProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <AppBar 
            position="fixed" 
            role="banner"
            sx={{
                backgroundColor: theme.palette.background.default,
                top: 0,
                left: 0,
            }}
        >
            {/* Draggable region */}
            <Box
                data-tauri-drag-region
                sx={{
                    width: "100vw",
                    height: theme.spacing(TAB_BAR_HEIGHT),
                    position: "absolute",
                    top: 0,
                    left: 0
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: "flex",
                    width: theme.spacing(TAB_BAR_HEIGHT),
                    height: theme.spacing(TAB_BAR_HEIGHT),
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <AscribeIcon />
            </Box>
            <TabBarTabs 
                width={`calc(100vw - ${theme.spacing(BUTTON_SIZE * 4 + BUTTON_PADDING * 9 + 10)})`} 
                left={theme.spacing(BUTTON_SIZE + BUTTON_PADDING * 2)} 
            />
            <WindowControlButtons />
        </AppBar>
    )
}