import { use_app_i18n } from "@components/providers/LanguageProvider";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { Stack, useTheme } from "@mui/material";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as images from "@assets"
import ImageButton, { BUTTON_PADDING } from "@components/core/ImageButton";
import { TAB_BAR_BORDER_WIDTH, TAB_BAR_HEIGHT } from "./TabBar";

const app_window = getCurrentWindow();

export default function WindowControlButtons(): React.ReactElement
{
    const theme = useTheme();
    const [is_maximized, set_is_maximized] = useState(false)

    const view_history = use_view_history();
    const on_close = useCallback(() => {
        view_history.close_window();
    }, [view_history]);

    const on_minimize = useCallback(() => {
        app_window.minimize()
    }, [app_window]);

    const on_maximize = useCallback(() => {
        app_window.maximize();
    }, [app_window]);
    
    const i18n = use_app_i18n();
    const tooltips = useMemo(() => ({
        close: __t("window_control_buttons.tooltips.close", "Close window"),
        minimize: __t("window_control_buttons.tooltips.minimize", "Minimize window"),
        maximize: __t("window_control_buttons.tooltips.maximize", "Maximize window"),
    }), [i18n]);

    useEffect(() => {
        let unlisten: UnlistenFn | undefined;

        const sync = async () => set_is_maximized(await app_window.isMaximized());
        sync();

        // Fires on resize, which covers maximize/restore via double-click, snapping, etc.
        app_window.onResized(sync).then((fn) => (unlisten = fn));

        return () => unlisten?.();
    }, []);

    return (
        <Stack
            data-tauri-drag-region
            sx={{
                width: "fit-content",
                height: theme.spacing(TAB_BAR_HEIGHT - TAB_BAR_BORDER_WIDTH),
                boxSizing: "border-box",
                position: "absolute",
                top: 0,
                right: 0,
            }}
            direction="row"
        >
            <ImageButton 
                image={images.minimize_window}
                on_click={on_minimize}
                tooltip={tooltips.minimize}
                sx={{
                    margin: theme.spacing(BUTTON_PADDING)
                }}
            />
            <ImageButton 
                image={images.maximize_window}
                on_click={on_maximize}
                tooltip={tooltips.maximize}
                active={is_maximized}
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
    )
}