import ImageButton, { BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import { AppBar, Box, useTheme } from "@mui/material";
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
            color="primary" 
            role="banner"
            sx={{
                backgroundColor: "green",
                borderBottomWidth: theme.spacing(BORDER_WIDTH),
                borderBottomColor: theme.palette.divider,
                borderBottomStyle: "solid",
            }}
        >
            <Box
                data-tauri-drag-region
                sx={{
                    width: "100vw",
                    height: theme.spacing(TAB_BAR_HEIGHT - BORDER_WIDTH),
                    boxSizing: "border-box",
                }}
            >
                <ImageButton 
                    image={images.x_mark}
                    variant="error"
                    on_click={on_close}
                    tooltip={tooltips.close}
                    sx={{
                        ml: "auto"
                    }}
                />
            </Box>
        </AppBar>
    )
}