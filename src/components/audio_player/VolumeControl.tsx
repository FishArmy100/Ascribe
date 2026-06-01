import { Stack, useTheme } from "@mui/material";
import React, { useRef } from "react";
import * as images from "../../assets";
import ImageButton from "../core/ImageButton";
import Slider from "../core/Slider";
import { use_settings } from "../providers/SettingsProvider";
import use_audio_player_tooltips from "./audio_player_tooltips";

const DEFAULT_UNMUTE_VOLUME = 0.5;

export default function VolumeControl(): React.ReactElement
{
    const theme = useTheme();
    const { settings, update_settings } = use_settings();
    const volume = settings.tts_settings.volume;
    const previous_volume = useRef<number>(
        settings.tts_settings.volume > 0 ? settings.tts_settings.volume : DEFAULT_UNMUTE_VOLUME
    );

    let volume_image: string;
    if (volume === 0)
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

    const tooltips = use_audio_player_tooltips();
    const tooltip = volume !== 0 ? tooltips.mute : tooltips.unmute;

    const handle_button_click = () => {
        if (volume === 0) {
            // Unmute: restore the last non-zero volume
            const restore = previous_volume.current > 0 ? previous_volume.current : DEFAULT_UNMUTE_VOLUME;
            update_settings(s => {
                s.tts_settings.volume = restore;
                return s;
            });
        } else {
            // Mute: remember current volume before zeroing
            previous_volume.current = volume;
            update_settings(s => {
                s.tts_settings.volume = 0;
                return s;
            });
        }
    };

    const handle_slider_change = (v: number) => {
        if (v > 0) previous_volume.current = v;
        update_settings(s => {
            s.tts_settings.volume = v;
            return s;
        });
    };

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
                step={0.02}
                tooltip={tooltips.modify_volume}
                on_change={handle_slider_change}
            />
        </Stack>
    );
}