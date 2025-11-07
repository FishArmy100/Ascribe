import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "../../assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence, number } from "framer-motion";
import { use_tts_player } from "../providers/TtsPlayerProvider";
import PlayButton, { PlayButtonType } from "./PlayButton";
import { use_view_history } from "../providers/ViewHistoryProvider";
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider";
import VolumeControl from "./VolumeControl";
import PlaybackControl from "./PlaybackControl";
import CorrectPitchCheckbox from "./CorrectPitchCheckbox";
import FollowTextCheckbox from "./FollowTextCheckbox";

const FAST_FORWARD_TIME = 10;
const REWIND_TIME = 10;

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open
}: AudioPlayerProps): React.ReactElement
{
    const theme = useTheme();
    const tts_player = use_tts_player();

    const [user_setting_time, set_user_setting_time] = useState(false);
    const [user_value, set_user_value] = useState(0);

    const current_chapter = use_view_history().get_current().current.chapter;
    const current_version = use_bible_display_settings().bible_version_state.bible_version;
    
    let generation_progress: number | null = null;
    let player_progress: number | null = null;
    let play_button_type: PlayButtonType = "play";
    let on_click: (() => void) | null = null;
    let progress_text = "--:--";

    if (tts_player.player_state === "generating")
    {
        const progress = tts_player.generation_progress;
        generation_progress = progress === "ready" ? 1 : progress ?? 0;
        play_button_type = "generating";
    }
    else if (tts_player.player_state === "playing")
    {
        play_button_type = "pause";
        on_click = () => tts_player.pause();
    }
    else if (tts_player.player_state === "paused")
    {
        play_button_type = "play";
        on_click = () => tts_player.play();
    }
    else if (tts_player.player_state === "finished")
    {
        play_button_type = "play";
        on_click = () => tts_player.play();
    }

    if (tts_player.duration !== null && tts_player.elapsed !== null)
    {
        player_progress = tts_player.elapsed;
        progress_text = format_progress_text(tts_player.elapsed, tts_player.duration)
    }

    useEffect(() => {
        if (open)
        {
            tts_player.request({
                bible: current_version,
                chapter: current_chapter,
                verse_range: null,
            })
        }
        else 
        {
            tts_player.stop();
        }
    }, [open, current_version, current_chapter.book, current_chapter.chapter])

    const handle_user_change_progress = (v: number) => {
        set_user_setting_time(true);
        set_user_value(v);
    };

    const handle_fast_forward = () => {
        if(tts_player.duration && tts_player.elapsed)
        {
            let new_time = Math.clamp(0, tts_player.duration, FAST_FORWARD_TIME + tts_player.elapsed * tts_player.duration) / tts_player.duration;
            tts_player.set_time(new_time);
        }
    }

    const handle_rewind = () => {
        if(tts_player.duration && tts_player.elapsed)
        {
            let new_time = Math.clamp(0, tts_player.duration,  tts_player.elapsed * tts_player.duration - REWIND_TIME) / tts_player.duration;
            tts_player.set_time(new_time);
        }
    } 

    const handle_user_commit_progress = (v: number) => {
        set_user_setting_time(false);
        set_user_value(v);
        tts_player.set_time(v);
        generation_progress = v;
    }

    return (
        <Box
            sx={{
                position: "fixed",
                display: "flex",
                justifyContent: "center",
                bottom: 0,
                right: 0,
                width: "100vw",
                pointerEvents: "none",
            }}
        >
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ width: "60%", pointerEvents: "all" }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
                                padding: theme.spacing(0.5)
                            }}
                        >
                            <Stack 
                                direction="column"
                                gap={theme.spacing(0.5)}
                            >
                                <Stack
                                    direction="row"
                                    display="flex"
                                    alignItems="center"
                                    gap={theme.spacing(0.5)}
                                >
                                    <ImageButton
                                        image={images.angles_left}
                                        tooltip={`Rewind ${REWIND_TIME}s`}
                                        disabled={play_button_type === "generating"}
                                        on_click={handle_rewind}
                                    />
                                    <PlayButton
                                        type={play_button_type}
                                        generation_progress={generation_progress}
                                        on_click={on_click ?? undefined}
                                    />
                                    <ImageButton
                                        image={images.angles_right}
                                        tooltip={`Fast forward ${FAST_FORWARD_TIME}s`}
                                        disabled={play_button_type === "generating"}
                                        on_click={handle_fast_forward}
                                    />
                                    <Slider
                                        value={user_setting_time ? user_value : player_progress ?? 0}
                                        min={0}
                                        max={1}
                                        step={0.0001}
                                        tooltip="Progress slider"
                                        on_change={handle_user_change_progress}
                                        on_commit={handle_user_commit_progress}
                                        readonly={tts_player.player_state === "finished" || tts_player.player_state === "generating" || tts_player.player_state === "idle"}
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
                                <Stack
                                    direction="row"
                                    display="flex"
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                    gap={theme.spacing(0.5)}
                                >
                                    <VolumeControl/>
                                    <PlaybackControl/>
                                    <CorrectPitchCheckbox/>
                                    <FollowTextCheckbox/>
                                </Stack>
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    )
}

function format_progress_text(elapsed: number, duration: number): string
{
    let time = Math.floor(duration - elapsed * duration);
    let mins = Math.floor(time / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}