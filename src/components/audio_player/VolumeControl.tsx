import { Stack, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
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
    const [volume, set_volume] = useState<number>(settings.tts_settings.volume);
    const previous_volume = useRef<number>(
        settings.tts_settings.volume > 0 ? settings.tts_settings.volume : DEFAULT_UNMUTE_VOLUME
    );

    // Sync local state if settings change externally
    useEffect(() => {
        const next = settings.tts_settings.volume;
        set_volume(prev => {
            if (prev !== next) {
                if (next > 0) previous_volume.current = next;
                return next;
            }
            return prev;
        });
    }, [settings.tts_settings.volume]);

    const debounce_timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounce_timeout.current) {
            clearTimeout(debounce_timeout.current);
        }

        debounce_timeout.current = setTimeout(() => {
            update_settings(s => {
                s.tts_settings.volume = volume;
                return s;
            });
        }, 300);

        return () => {
            if (debounce_timeout.current) {
                clearTimeout(debounce_timeout.current);
            }
        };
    }, [volume, update_settings]);

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
            set_volume(restore);
        } else {
            // Mute: remember current volume before zeroing
            previous_volume.current = volume;
            set_volume(0);
        }
    };

    const handle_slider_change = (v: number) => {
        if (v > 0) previous_volume.current = v;
        set_volume(v);
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
                step={0.0001}
                tooltip={tooltips.modify_volume}
                on_change={handle_slider_change}
            />
        </Stack>
    );
}