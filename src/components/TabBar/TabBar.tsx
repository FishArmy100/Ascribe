import ImageButton, { BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import { AppBar, Box, Stack, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import * as images from "@assets";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_view_history } from "@components/providers/ViewHistoryProvider";

export type TabBarProps = {

}

const BORDER_WIDTH: number = 1 / 8
export const TAB_BAR_HEIGHT: number = BUTTON_SIZE + BUTTON_PADDING * 2 + BORDER_WIDTH;

export default function TabBar({

}: TabBarProps): React.ReactElement
{
    const theme = useTheme();

    const view_history = use_view_history();
    const on_close = useCallback(() => {
        view_history.close_window();
    }, []);
    
    const i18n = use_app_i18n();
    const tooltips = useMemo(() => ({
        close: __t("tab_bar.tooltips.close", "Close window"),
    }), [i18n]);

    return (
        <AppBar 
            position="fixed" 
            role="banner"
            sx={{
                borderBottomWidth: theme.spacing(BORDER_WIDTH),
                borderBottomColor: theme.palette.divider,
                borderBottomStyle: "solid",
                backgroundColor: theme.palette.background.default,
            }}
        >
            <Box
                data-tauri-drag-region
                sx={{
                    width: "100vw",
                    height: theme.spacing(TAB_BAR_HEIGHT - BORDER_WIDTH),
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            /> {/* Draggable region */}
            <Stack
                data-tauri-drag-region
                sx={{
                    width: "fit-content",
                    height: theme.spacing(TAB_BAR_HEIGHT - BORDER_WIDTH),
                    boxSizing: "border-box",
                    position: "absolute",
                    top: 0,
                    right: 0,
                }}
                direction="row"
            >
                <ImageButton 
                    image={images.minimize_window}
                    on_click={on_close}
                    tooltip={tooltips.close}
                    sx={{
                        margin: theme.spacing(BUTTON_PADDING)
                    }}
                />
                <ImageButton 
                    image={images.maximize_window}
                    on_click={on_close}
                    tooltip={tooltips.close}
                    sx={{
                        margin: theme.spacing(BUTTON_PADDING)
                    }}
                />
                <ImageButton 
                    image={images.x_mark}
                    variant="error"
                    on_click={on_close}
                    tooltip={tooltips.close}
                    sx={{
                        margin: theme.spacing(BUTTON_PADDING)
                    }}
                />
            </Stack>
        </AppBar>
    )
}