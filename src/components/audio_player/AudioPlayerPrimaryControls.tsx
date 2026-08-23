import ImageButton from "@components/core/ImageButton";
import { Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import use_audio_player_tooltips from "./audio_player_tooltips";
import use_audio_player_labels from "./audio_player_labels";
import * as images from "@assets";
import { PlayState } from "./audio_player_hooks/play_state_controller";
import { AudioPlayerController } from "./audio_player_hooks/player_controller";
import PlayButton from "./PlayButton";
import Slider from "@components/core/Slider";

const REWIND_TIME = 10;
const FAST_FORWARD_TIME = 10;

export type AudioPlayerPrimaryControlsProps = {
    controller: AudioPlayerController,
}

export default function AudioPlayerPrimaryControls({
    controller
}: AudioPlayerPrimaryControlsProps): React.ReactElement
{
    const theme = useTheme();
    const tooltips = use_audio_player_tooltips();

    const controller_ref = useRef(controller);
    useEffect(() => {
        controller_ref.current = controller;
    }, [controller])

    const nav_disabled = useMemo(() => {
        const state_type = controller.state.type
        return state_type === "generating"  || 
               state_type === "idle"        || 
               state_type === "loaded"      || 
               state_type === "loading"

    }, [controller.state.type]);

    const handle_rewind = useCallback(() => {
        if (controller_ref.current.can_seek)
        {
            const time = Math.clamp(0, get_duration(controller_ref.current.state), get_elapsed(controller_ref.current.state) - REWIND_TIME);
            controller_ref.current.seek(time);
        }
    }, []);

    const handle_fast_forward = useCallback(() => {
        if (controller_ref.current.can_seek)
        {
            const time = Math.clamp(0, get_duration(controller_ref.current.state), get_elapsed(controller_ref.current.state) + FAST_FORWARD_TIME);
            controller_ref.current.seek(time);
        }
    }, []);
    
    
    
    const [user_setting_time, set_user_setting_time] = useState(false);
    const [user_value, set_user_value] = useState(0);

    const handle_user_change_progress = useCallback((v: number) => {
        set_user_setting_time(true);
        set_user_value(v);
    }, [set_user_setting_time, set_user_value]);

    const handle_user_commit_progress = useCallback((v: number) => {
        if (controller_ref.current.can_seek)
        {
            const duration = get_duration(controller_ref.current.state);
            controller_ref.current.seek(v * duration);
        }
        set_user_setting_time(false);
    }, []);

    const progress_text = format_progress_text(controller.state);
    const player_progress = get_player_progress(controller.state);
    
    return (
        <Stack
            direction="row"
            display="flex"
            alignItems="center"
            gap={theme.spacing(0.5)}
            padding={theme.spacing(0.5)}
        >
            <ImageButton
                image={images.angles_left}
                tooltip={tooltips.rewind(REWIND_TIME)}
                disabled={nav_disabled}
                on_click={handle_rewind}
            />
            <PlayButton
                controller={controller}
            />
            <ImageButton
                image={images.angles_right}
                tooltip={tooltips.fast_forward(FAST_FORWARD_TIME)}
                disabled={nav_disabled}
                on_click={handle_fast_forward}
            />
            <Slider
                value={user_setting_time ? user_value : player_progress ?? 0}
                min={0}
                max={1}
                step={0.0001}
                tooltip={tooltips.progress}
                on_change={handle_user_change_progress}
                on_commit={handle_user_commit_progress}
                readonly={false}
                sx={{
                    ml: theme.spacing(2)
                }}
                rail_sx={{
                    backgroundColor: theme.palette.background.default,
                    border: `${theme.spacing(1 / 8)} solid ${theme.palette.divider}`
                }}
                slider_sx={{
                    backgroundColor: theme.palette.primary.main,
                    border: `${theme.spacing(1 / 8)} solid ${theme.palette.divider}`
                }}
            />
            <Typography
                color={theme.palette.primary.contrastText}
                variant="body2"
                textAlign="center"
                component="div"
                width="8em"
            >
                {progress_text}
            </Typography>
        </Stack>
    )
}

function get_elapsed(state: PlayState): number
{
    if (state.type === "finished")
    {
        return state.duration;
    }
    else if (state.type === "paused" || state.type === "playing")
    {
        return state.time;
    }
    else 
    {
        return 0;
    }
}

function get_duration(state: PlayState): number
{
    if (state.type === "finished" || state.type === "playing" || state.type === "paused")
    {
        return state.duration;
    }
    else 
    {
        return 0;
    }
}

function format_progress_text(state: PlayState): string
{
    const duration = get_duration(state);
    const elapsed = get_elapsed(state);

    let time = Math.floor(duration - elapsed);
    let mins = Math.floor(time / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function get_player_progress(state: PlayState): number
{
    const duration = get_duration(state);
    if (duration === 0)
        return 0;

    const elapsed = get_elapsed(state);
    return elapsed / duration;
}