import { Stack, useTheme } from "@mui/material";
import React from "react";
import * as images from "../../assets";
import ImageButton from "../core/ImageButton";
import Slider from "../core/Slider";
import { use_settings } from "../providers/SettingsProvider";

export default function VolumeControl(): React.ReactElement
{
    const theme = useTheme();
    const { settings, update_settings } = use_settings();
    const volume = settings.tts_settings.volume;

    let volume_image: string;
    if (volume == 0)
    {
        volume_image = images.volume_mute;
    }
    else if (volume < 0.3)
    {
        volume_image = images.volume_low;
    }
    else if (volume < 0.6)
    {
        volume_image = images.volume_mid;
    }
    else 
    {
        volume_image = images.volume_high;
    }

    let tooltip: string;
    if (volume != 0)
    {
        tooltip = "Mute audio";
    }
    else 
    {
        tooltip = "Unmute audio";
    }

    const handle_button_click = () => {
        let new_volume = volume == 0 ? 1 : 0;
        update_settings(s => {
            s.tts_settings.volume = new_volume;
            return s;
        })
    }

    const handle_slider_change = (v: number) => {
        update_settings(s => {
            s.tts_settings.volume = v;
            return s;
        })
    }

    return (
        <Stack
            direction="row"
            display="flex"
            alignItems="center"
            gap={theme.spacing(0.5)}
            width={theme.spacing(20)}
            sx={{
                mr: theme.spacing(1)
            }}
        >
            <ImageButton
                image={volume_image}
                tooltip={tooltip}
                on_click={handle_button_click}
            />
            <Slider
                value={volume}
                min={0}
                max={1}
                step={0.0001}
                tooltip="Modify volume"
                on_change={handle_slider_change}
            />
        </Stack>
    )
}