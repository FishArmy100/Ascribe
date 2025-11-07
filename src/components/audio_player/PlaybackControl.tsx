import { Stack, useTheme } from "@mui/material";
import React from "react";
import * as images from "../../assets";
import ImageButton from "../core/ImageButton";
import Slider from "../core/Slider";
import { use_settings } from "../providers/SettingsProvider";

export default function PlaybackControl(): React.ReactElement
{
    const theme = useTheme();
    const { settings, update_settings } = use_settings();
    const playback_speed = settings.tts_settings.playback_speed;

    const display_speed = inverse_lerp_playback_speed(playback_speed);

    let speed_image: string;
    if (display_speed < 0.2)
    {
        speed_image = images.gauge_min;
    }
    else if (display_speed < 0.4)
    {
        speed_image = images.gauge_low;
    }
    else if (display_speed <= 0.6)
    {
        speed_image = images.gauge_mid;
    }
    else if (display_speed < 0.8)
    {
        speed_image = images.gauge_high;
    }
    else 
    {
        speed_image = images.gauge_max;
    }

    let tooltip = "Reset playback speed";

    const handle_button_click = () => {
        update_settings(s => {
            s.tts_settings.playback_speed = 1;
            return s;
        })
    }

    const handle_slider_change = (v: number) => {
        update_settings(s => {
            s.tts_settings.playback_speed = lerp_playback_speed(v);
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
        >
            <ImageButton
                image={speed_image}
                tooltip={tooltip}
                on_click={handle_button_click}
            />
            <Slider
                value={display_speed}
                min={0}
                max={1}
                step={0.0001}
                tooltip="Modify playback speed"
                on_change={handle_slider_change}
            />
        </Stack>
    )
}

/**
 * Maps the input value from 0-1 to 0.5-2.0
 * @param speed a value between 0 and 1
 * @returns a value between 0.5 and 2
 */
function lerp_playback_speed(speed: number): number
{
    speed = Math.lerp(-1, 1, speed);
    speed = speed + Math.sign(speed);

    if (Math.abs(speed) == 0) 
        speed = 1;

    speed = Math.abs(Math.pow(speed, Math.sign(speed)));
    return speed;
}

/**
 * Maps the input value from 0.5-2.0 to 0-1
 * @param speed a value between 0.5 and 2
 * @returns a value between 0 and 1
 */
function inverse_lerp_playback_speed(speed: number): number
{
    let processed = 0.5;
    if(speed <= 1 && speed >= 0)
    {
        processed = -1 / (2 * speed) + 1;
    }
    else if(speed >= 1 && speed <= 2)
    {
        processed = speed / 2;
    }

    return processed;
}