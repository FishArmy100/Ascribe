import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_settings } from "@components/providers/SettingsProvider";
import { SelectedTheme } from "@interop/settings";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useCallback, useMemo } from "react";

const THEME_SELECTOR_DROPDOWN_TITLE: string = "Theme: "

export default function ThemeSelectorDropdown(): React.ReactElement
{
    const { settings, set_settings } = use_settings();
    const deep_copy = use_deep_copy();

    const options = useMemo(() => {
        const options: TextSelectDropdownOption<SelectedTheme>[] = [];

        options.push({
            text: "Light",
            tooltip: "Select 'Light' theme",
            value: { type: "light" }
        });

        options.push({
            text: "Dark",
            tooltip: "Select 'Dark' theme",
            value: { type: "dark" }
        });

        const custom = Object.values(settings.custom_themes).map((o): TextSelectDropdownOption<SelectedTheme> => ({
            text: o.name,
            tooltip: `Select '${o.name}' theme`,
            value: { type: "custom", value: o.name }
        }))

        options.push(...custom);
        options.sort((a, b) => a.text.localeCompare(b.text));

        return options;
    }, [settings])

    const selected_index = useMemo(() => {
        const index = options.findIndex(o => {
            if (o.value.type === "light" && settings.selected_theme.type === "light")
            {
                return true;
            }
            else if (o.value.type === "dark" && settings.selected_theme.type === "dark")
            {
                return true;
            }
            else if (o.value.type === "custom" && settings.selected_theme.type === "custom")
            {
                return o.value.value === settings.selected_theme.value
            }
            else 
            {
                return false;
            }
        });

        if (index === -1)
        {
            return options.findIndex(o => o.value.type === "light")
        }
        else
        {
            return index;
        }
    }, [settings, options]);

    const handle_dropdown_select = useCallback((theme: SelectedTheme) => {
        const copy = deep_copy(settings);
        copy.selected_theme = theme;
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
                    {THEME_SELECTOR_DROPDOWN_TITLE}
                </Typography>
                <TextSelectDropdown 
                    options={options}
                    tooltip="Select Theme"
                    selected={selected_index}
                    on_select={handle_dropdown_select}
                    variant="h5"
                    bold
                />
            </Stack>
        </Paper>
    )
}