import DropdownBase from "@components/core/DropdownBase";
import { use_settings } from "@components/providers/SettingsProvider";
import __t, { getLangCode, getLocaleLangName, LangScriptCode } from "@fisharmy100/react-auto-i18n";
import React, { useCallback, useMemo, useState } from "react";
import LanguageButton from "./LanguageButton";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { use_app_i18n } from "@components/providers/LanguageProvider";


export const LANGUAGE_DROPDOWN_PADDING = 0.4;

export default function LanguageSelectionDropdown(): React.ReactElement
{
    const [is_open, set_is_open] = useState(false);
    const theme = useTheme();
    const i18n = use_app_i18n();

    const { update_settings } = use_settings()

    const set_language = useCallback((language: LangScriptCode) => {
        update_settings(s => {
            s.selected_language = language;
            return s;
        })
    }, [update_settings]);

    const strings = useMemo(() => ({
        button: __t(
            "settings_page.language_selection.button",
            "Change current language",
        ),
        language_option: (language: LangScriptCode) => __t(
            "settings_page.language_selection.language_option",
            "Select language {{$language}}",
            {language: getLocaleLangName(getLangCode(language))}
        ),
        title: __t(
            "settings_page.language_selection.title",
            "Language: ",
        ),
    }), [i18n])

    return (
        <Paper
            sx={{
                borderRadius: theme.spacing(1),
                padding: 1,
            }}
        >
            <Stack
                direction="row"
                gap={theme.spacing(1)}
                sx={{
                    alignItems: "center",
                }}
            >
                <Typography 
                    variant="h5" 
                    textAlign="center"
                    fontWeight="bold"
                >
                    {strings.title}
                </Typography>
                <DropdownBase
                    button={{
                        type: "element",
                        element_builder: (on_click) => (
                            <Box sx={{ width: "100%" }}>
                                <LanguageButton
                                    tooltip={strings.button}
                                    language={i18n.locale()}
                                    active={is_open}
                                    sx={{ width: "100%" }}  // stretch to fill the Box
                                    on_click={on_click}
                                />
                            </Box>
                        )
                    }}
                    panel_sx={{
                        boxSizing: "border-box",
                        width: "100%",
                        minWidth: "max-content", // panel grows to fit widest button
                    }}
                    is_open={is_open}
                    on_click={() => set_is_open(!is_open)}
                    content_z_index={2000}
                >
                    <Stack
                        sx={{
                            padding: 1,
                            gap: theme => theme.spacing(1),
                        }}
                    >
                        {i18n.get_supported_locales().map((l, i) => {
                            const is_selected = i18n.locale() === l;
                            const tooltip = strings.language_option(l);
                            return (
                                <LanguageButton
                                    tooltip={tooltip}
                                    active={is_selected}
                                    language={l}
                                    on_click={() => {
                                        set_language(l);
                                        set_is_open(false);
                                    }}
                                    key={i}
                                    sx={{
                                        width: "100%"
                                    }}
                                />
                            )
                        })}
                    </Stack>
                </DropdownBase>
            </Stack>
        </Paper>
    )
}