import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_settings } from "@components/providers/SettingsProvider";
import { ALL_FONTS, SelectedFont, SelectedTheme } from "@interop/settings";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useCallback, useMemo } from "react";
import use_settings_page_strings from "./settings_page_strings";

export default function FontSelectorDropdown(): React.ReactElement
{
    const { settings, set_settings } = use_settings();
    const deep_copy = use_deep_copy();
    const strings = use_settings_page_strings();

    const options = useMemo(() => {
        return deep_copy(ALL_FONTS).sort().map((f): TextSelectDropdownOption<SelectedFont> => {
            const name = (f as string).split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
            return {
                text: name,
                tooltip: strings.font_option_tooltip(name),
                value: f,
            }
        })
    }, []);

    const selected_index = options.findIndex(o => o.value === settings.selected_font);

    const handle_dropdown_select = useCallback((font: SelectedFont) => {
        const copy = deep_copy(settings);
        copy.selected_font = font;
        set_settings(copy);
    }, [set_settings, settings])

    const theme = useTheme();
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
                    {strings.select_font_title}
                </Typography>
                <TextSelectDropdown 
                    options={options}
                    tooltip={strings.select_font_tooltip}
                    selected={selected_index}
                    on_select={handle_dropdown_select}
                    variant="h5"
                    bold
                />
            </Stack>
        </Paper>
    )
}