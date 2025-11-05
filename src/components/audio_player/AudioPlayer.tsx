import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "../../assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence, number } from "framer-motion";
import { use_tts_player } from "../providers/TtsPlayerProvider";
import PlayButton, { PlayButtonType } from "./PlayButton";

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open
}: AudioPlayerProps): React.ReactElement
{
    const theme = useTheme();
    const tts_player = use_tts_player();
    
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
        if (tts_player.duration && tts_player.elapsed)
        {
            player_progress = tts_player.elapsed / tts_player.duration;
            progress_text = format_progress_text(tts_player.elapsed, tts_player.duration)
        }
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

    if (tts_player.duration && tts_player.elapsed)
    {
        player_progress = tts_player.elapsed / tts_player.duration;
        progress_text = format_progress_text(tts_player.elapsed, tts_player.duration)
    }

    useEffect(() => {
        if (open)
        {
            tts_player.request({
                bible: "KJV",
                chapter: { book: "Gen", chapter: 1 },
                verse_range: null,
            })
        }
        else 
        {
            tts_player.stop();
        }
    }, [open])

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
                                direction="row"
                                display="flex"
                                alignItems="center"
                                gap={theme.spacing(0.5)}
                            >
                                <ImageButton
                                    image={images.angles_left}
                                    tooltip="Rewind 10s"
                                />
                                <PlayButton 
                                    type={play_button_type}
                                    generation_progress={generation_progress}
                                    on_click={on_click ?? undefined}
                                />
                                <ImageButton
                                    image={images.angles_right}
                                    tooltip="Fast forward 10s"
                                />
                                <Slider
                                    value={player_progress ?? 0}
                                    min={0}
                                    max={1}
                                    tooltip="Progress slider"
                                    readonly
                                />
                                <Typography
                                    color={theme.palette.primary.contrastText}
                                    variant="body2"
                                    textAlign="center"
                                    component="span"
                                >
                                    {progress_text}
                                </Typography>
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
    return "--:--";
}