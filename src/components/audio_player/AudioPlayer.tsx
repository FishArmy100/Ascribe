import { Box, Collapse, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "@assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence, number } from "framer-motion";
import { use_tts_player } from "../providers/TtsPlayerProvider";
import PlayButton, { PlayButtonType } from "./PlayButton";
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider";
import VolumeControl from "./VolumeControl";
import PlaybackControl from "./PlaybackControl";
import CorrectPitchCheckbox from "./CorrectPitchCheckbox";
import FollowTextCheckbox from "./FollowTextCheckbox";
import ExpandButton from "./ExpandButton";
import { ChapterId } from "@interop/bible";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { use_settings } from "@components/providers/SettingsProvider";
import VoiceSelectDropdown from "./VoiceSelectDropdown";

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
    
    let generation_progress: number | null = null;
    let player_progress: number | null = null;
    let play_button_type: PlayButtonType = "play";
    let on_click: (() => void) | null = null;
    let progress_text = "--:--";

    const handle_user_change_progress = (v: number) => {
        set_user_setting_time(true);
        set_user_value(v);
    };

    const handle_fast_forward = () => {
        
    }

    const handle_rewind = () => {
        
    } 

    const handle_user_commit_progress = (v: number) => {
        
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
                                        disabled={true}
                                        on_click={handle_rewind}
                                    />
                                    <PlayButton
                                        type={play_button_type}
                                        generation_progress={generation_progress}
                                        on_click={on_click ?? undefined}
                                    />
                                    <ImageButton
                                        image={images.angles_right}
                                        tooltip={tooltips.fast_forward(FAST_FORWARD_TIME)}
                                        disabled={true}
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
                                        readonly={true}
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