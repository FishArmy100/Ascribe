import { ImageButton } from "@components/index";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as images from "@assets"
import Slider from "@components/core/Slider";
import use_settings_page_strings from "./settings_page_strings";
import { use_settings } from "@components/providers/SettingsProvider";

export default function SfxVolumeSlider(): React.ReactElement
{
    const theme = useTheme();
    const strings = use_settings_page_strings();
    const { settings, update_settings } = use_settings();

    const [sfx_volume_value, set_sfx_volume_value] = useState(settings.sfx_volume);
    useEffect(() => {
        set_sfx_volume_value(settings.sfx_volume)
    }, [settings.sfx_volume]);

    
    
    const handle_slider_value_changed = useCallback((value: number) => {
        set_sfx_volume_value(value);
    }, [set_sfx_volume_value]);

    const handle_slider_value_committed = useCallback(() => {
        update_settings(s => {
            s.sfx_volume = sfx_volume_value;
            return s;
        })
    }, [settings, update_settings, sfx_volume_value]);

    const handle_button_click = useCallback(() => {
        if (sfx_volume_value === 0)
        {
            update_settings(s => {
                s.sfx_volume = 1;
                return s;
            })
        }
        else 
        {
            update_settings(s => {
                s.sfx_volume = 0;
                return s;
            })
        }
    }, [sfx_volume_value, update_settings])

    let button_image = images.volume_mute;
    if (sfx_volume_value > 0.66)
    {
        button_image = images.volume_high
    }
    else if (sfx_volume_value > 0.33)
    {
        button_image = images.volume_mid
    }
    else if (sfx_volume_value > 0)
    {
        button_image = images.volume_low;
    }

    const button_tooltip = sfx_volume_value === 0 ? strings.sfx_mute_tooltip : strings.sfx_unmute_tooltip;
    const sfx_percent_text = useMemo(() => {
        return Math.round(sfx_volume_value * 100).toString() + "%";
    }, [sfx_volume_value]);
    
    return (
        <Paper
            sx={{
                borderRadius: theme.spacing(1),
                padding: 1,
            }}
        >
            <Stack 
                direction="column"
            >
                <Typography 
                    variant="h5" 
                    textAlign="center"
                    fontWeight="bold"
                >
                    {strings.sfx_volume_scale_title}
                </Typography>
                <Stack 
                    direction="row"
                    gap={theme.spacing(1)}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <ImageButton 
                        image={button_image}
                        tooltip={button_tooltip}
                        on_click={handle_button_click}
                    />
                    <Slider 
                        value={sfx_volume_value} 
                        max={1} 
                        min={0} 
                        step={0.0001}
                        tooltip={""}
                        on_change={handle_slider_value_changed}
                        on_commit={handle_slider_value_committed}            
                    />
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        {sfx_percent_text}
                    </Typography>
                </Stack>
            </Stack>
        </Paper>
    )
}