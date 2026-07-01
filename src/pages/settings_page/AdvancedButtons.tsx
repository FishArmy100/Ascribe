import ConfirmPopup from "@components/ConfirmPopup";
import TextButton from "@components/core/TextButton";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { backend_open_save_path } from "@interop/index";
import { clear_backend_view_history } from "@interop/view_history";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";

export default function AdvancedButtons(): React.ReactElement
{
    const theme = useTheme();
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        title: __t(
            "pages.settings_page.advanced_buttons.title",
            "Advanced Buttons"
        ),
        clear_view_history: __t(
            "pages.settings_page.advanced_buttons.clear_view_history",
            "Clear View History",
        ),
        clear_view_history_tooltip: __t(
            "pages.settings_page.advanced_buttons.tooltips.clear_view_history",
            "Clear your view history, searches, chapters, and module entries",
        ),
        open_save_path: __t(
            "pages.settings_page.advanced_buttons.open_save_path",
            "Open Save Path",
        ),
        open_save_path_tooltip: __t(
            "pages.settings_page.advanced_buttons.tooltips.open_save_path",
            "Open your file explorer to the current save path",
        ),
        clear_view_history_model_title: __t(
            "pages.settings_page.advanced_buttons.modal.title",
            "Clear View History"
        ),
        clear_view_history_model_message: __t(
            "pages.settings_page.advanced_buttons.modal.body",
            "Are you sure you want to clear the view history?"
        ),
    }), [i18n]);

    const [show_confirm_clear_view_history, set_show_confirm_clear_view_history] = useState(false);


    
    return (
        <>
            <Paper
                sx={{
                    borderRadius: theme.spacing(1),
                    padding: 1,
                }}
            >
                
                <Typography 
                    variant="h5" 
                    textAlign="center"
                    fontWeight="bold"
                >
                    {strings.title}
                </Typography>
                <Stack
                    direction="row"
                    justifyContent="space-around"
                    sx={{
                        mt: theme.spacing(2),
                    }}
                >
                    <TextButton
                        text={strings.open_save_path}
                        tooltip={strings.open_save_path_tooltip}
                        on_click={() => backend_open_save_path().then(e => {
                            if (e)
                            {
                                console.error(e);
                            }
                        })}
                        sx={{
                            padding: theme.spacing(1)
                        }}
                        text_props={{
                            bold: true,
                        }}
                    />
                    <TextButton
                        text={strings.clear_view_history}
                        tooltip={strings.clear_view_history_tooltip}
                        on_click={() => set_show_confirm_clear_view_history(true)}
                        sx={{
                            padding: theme.spacing(1)
                        }}
                        text_props={{
                            bold: true,
                        }}
                        variant="error"
                    />
                </Stack>
            </Paper>
            <ConfirmPopup 
                title={strings.clear_view_history_model_title}
                message={strings.clear_view_history_model_message}
                show={show_confirm_clear_view_history}
                on_cancel={() => set_show_confirm_clear_view_history(false)}
                on_confirm={() => {
                    set_show_confirm_clear_view_history(true);
                    clear_backend_view_history()
                }}
            />
        </>
    )
}