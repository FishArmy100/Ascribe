import { Box, Collapse, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "@assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence } from "framer-motion";
import { ITtsContextType, use_tts_player } from "../providers/TtsPlayerProvider";
import PlayButton, { PlayButtonType } from "./PlayButton";
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider";
import VolumeControl from "./VolumeControl";
import PlaybackControl from "./PlaybackControl";
import CorrectPitchCheckbox from "./CorrectPitchCheckbox";
import FollowTextCheckbox from "./FollowTextCheckbox";
import ExpandButton from "./ExpandButton";
import { ChapterId, get_chapter_verse_ids } from "@interop/bible";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { use_settings } from "@components/providers/SettingsProvider";
import VoiceSelectDropdown from "./VoiceSelectDropdown";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { VerseAudioKey } from "@interop/tts";

const FAST_FORWARD_TIME = 10;
const REWIND_TIME = 10;

export type AudioPlayerProps = {
    open: boolean,
    current_chapter: ChapterId,
}

export default function AudioPlayer({
    open,
    current_chapter
}: AudioPlayerProps): React.ReactElement
{
    const theme = useTheme();
    const tts_player = use_tts_player();
    const { settings } = use_settings();

    const [user_setting_time, set_user_setting_time] = useState(false);
    const [user_value, set_user_value] = useState(0);

    const [is_expanded, set_is_expanded] = useState(false);
    const current_version = use_bible_display_settings().bible_display_settings.bible_version;
    const { bible_infos } = use_bible_infos();

    const player_state = useMemo(() => {
        return tts_player.state();
    }, [tts_player]);

    const player_ref = useRef<ITtsContextType>(tts_player);
    useEffect(() => {
        player_ref.current = tts_player;
    }, [tts_player]);

    const handle_play_button_clicked = useCallback(() => {
        const state = player_ref.current.state();
        if (state)
        {
            if (state.paused)
            {
                player_ref.current.play();
            }
            else 
            {
                player_ref.current.pause();
            }
        }
    }, [player_state?.paused])

    const [player_progress, progress_text] = useMemo(() => {
        if (player_state && player_state.duration > 0)
        {
            const player_progress = player_state.current_time / player_state.duration;
            const progress_text = format_progress_text(player_progress, player_state.duration);
            return [player_progress, progress_text]
        }
        else 
        {
            return [ null, "--:--" ];
        }
    }, [tts_player])

    const audio_keys = useMemo(() => {
        const verses = get_chapter_verse_ids(bible_infos[current_version], current_chapter);
        return verses.map((v): VerseAudioKey => ({
            bible: current_version,
            verse: v,
            voice: settings.tts_settings.current_voice,
        }));
    }, [current_chapter, current_version, bible_infos, settings.tts_settings.current_voice]);

    useEffect(() => {
        if (open)
        {
            player_ref.current.request_verses(audio_keys);
        }
    }, [audio_keys, open]); // don't have tts tts player as a dependency, otherwise it will create a feedback loop

    const generation_progress = useMemo(() => {
        const count = player_ref.current.has_verses(audio_keys);
        if (count < audio_keys.length)
        {
            if (audio_keys.length === 0)
            {
                return 0;
            }
            return count / audio_keys.length;
        }
        else 
        {
            return null;
        }
    }, [audio_keys, player_ref.current]);

    useEffect(() => {
        if (player_ref.current.has_verses(audio_keys) === audio_keys.length && open)
        {
            player_ref.current.load(audio_keys);
        }
    }, [audio_keys, player_ref.current.get_generated().length, open]); // don't have tts tts player as a dependency, otherwise it will create a feedback loop

    const play_button_type = useMemo((): PlayButtonType => {
        const state = tts_player.state();
        if (generation_progress !== null)
        {
            return "generating";
        }
        else if (state && !state.paused)
        {
            return "pause";
        }
        else 
        {
            return "play";
        }
    }, [generation_progress, tts_player])

    const handle_user_change_progress = (v: number) => {
        set_user_setting_time(true);
        set_user_value(v);
    };

    const handle_fast_forward = () => {
        if (player_state && player_state.duration > 0)
        {
            const new_time = Math.min(player_state.current_time + FAST_FORWARD_TIME, player_state.duration);
            player_ref.current.set_time(new_time);
        }
    }

    const handle_rewind = () => {
        if (player_state && player_state.duration > 0)
        {
            const new_time = Math.max(player_state.current_time - REWIND_TIME, 0);
            player_ref.current.set_time(new_time);
        }
    } 

    const handle_user_commit_progress = (v: number) => {
        if (player_state && player_state.duration > 0)
        {
            player_ref.current.set_time(v * player_state.duration);
        }
        set_user_setting_time(false);
    }

    const tooltips = use_audio_player_tooltips();

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
                                backgroundColor: theme.palette.primary.dark,
                                borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
                                borderColor: theme.palette.divider,
                                borderWidth: theme.spacing(1 / 8),
                                borderStyle: "solid"
                            }}
                        >
                            <ExpandButton
                                is_expanded={is_expanded}
                                set_is_expanded={set_is_expanded}
                            />
                            <Stack 
                                direction="column"
                                gap={theme.spacing(0.5)}
                            >
                                <Stack
                                    direction="row"
                                    display="flex"
                                    alignItems="center"
                                    gap={theme.spacing(0.5)}
                                    padding={theme.spacing(0.5)}
                                    sx={{
                                        borderColor: theme.palette.divider,
                                        borderWidth: 0,
                                        borderBottomWidth: theme.spacing(1 / 8),
                                        borderStyle: "solid"
                                    }}
                                >
                                    <ImageButton
                                        image={images.angles_left}
                                        tooltip={tooltips.rewind(REWIND_TIME)}
                                        disabled={!tts_player.is_loaded()}
                                        on_click={handle_rewind}
                                    />
                                    <PlayButton
                                        type={play_button_type}
                                        generation_progress={generation_progress}
                                        on_click={handle_play_button_clicked ?? undefined}
                                    />
                                    <ImageButton
                                        image={images.angles_right}
                                        tooltip={tooltips.fast_forward(FAST_FORWARD_TIME)}
                                        disabled={!tts_player.is_loaded()}
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
                                <Collapse in={is_expanded} timeout="auto" unmountOnExit={false}>
                                    <Stack
                                        direction="row"
                                        display="flex"
                                        alignItems="center"
                                        flexWrap="wrap"
                                        useFlexGap
                                        gap={theme.spacing(0.5)}
                                        sx={{
                                            backgroundColor: theme.palette.background.paper,
                                        }}
                                    >
                                        <VolumeControl/>
                                        <PlaybackControl/>
                                        <CorrectPitchCheckbox/>
                                        <FollowTextCheckbox/>
                                        <VoiceSelectDropdown/>
                                    </Stack>
                                </Collapse>
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