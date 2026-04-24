import LabeledToggleSwitch from "@components/core/LabeledToggleSwitch";
import { use_settings } from "@components/providers/SettingsProvider";
import { Sfx, use_sfx_names } from "@interop/sfx";
import { FormControlLabel, Paper, Stack, Switch, Typography, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import use_settings_page_strings from "./settings_page_strings";

export default function SfxToggles(): React.ReactElement
{
    const sfx_names = use_sfx_names();
    const settings_page_strings = use_settings_page_strings();
    const { settings, update_settings } = use_settings();
    const theme = useTheme();

    const enabled_sfx = useMemo(() => {
        return Object.entries(settings.sfx_settings.enabled)
            .sort(([a], [b]) => a.localeCompare(b));
    }, [settings]) as [Sfx, boolean][];

    const on_toggle = useCallback((sfx: Sfx, value: boolean) => {
        update_settings(s => {
            s.sfx_settings.enabled[sfx] = value;
            return s;
        })
    }, [update_settings])

    return (
        <Paper
            sx={{
                borderRadius: theme.spacing(1),
                padding: 1,
            }}
        >
            <Typography
                textAlign="center"
                variant="h5"
                fontWeight="bold"
            >
                {settings_page_strings.sfx_toggle_title}
            </Typography>
            <Stack direction="column">
                {enabled_sfx.map(([sfx, enabled], i) => {
                    const tooltip = enabled ? 
                        settings_page_strings.sfx_toggle_disable(sfx_names[sfx]) :
                        settings_page_strings.sfx_toggle_enable(sfx_names[sfx]);

                    return (
                        <LabeledToggleSwitch 
                            on_change={v => on_toggle(sfx, v)}
                            label={sfx_names[sfx]}
                            value={enabled}
                            tooltip={tooltip}
                            key={i}
                        />
                    )
                })}
            </Stack>
        </Paper>
    )
}