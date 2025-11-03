import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "../../assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence } from "framer-motion";
import * as tts from "../../interop/tts";

type PlayerState = "playing" | "paused" | "generating" | "finished" | "stopped";

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open
}: AudioPlayerProps): React.ReactElement
{
    const theme = useTheme();
    const [player_state, set_player_state] = useState<PlayerState | null>(null);
    const [playing_id, set_playing_id] = useState<string | null>(null);
    const [duration, set_duration] = useState<number | null>(null);
    const [current_time, set_current_time] = useState<number | null>(null);
    const [generation_progress, set_generation_progress] = useState<number | null>(null);
    
    useEffect(() => {
        let unlisten = tts.listen_tts_event(e => {
            if (e.type === "played")
            {
                set_playing_id(playing_id);
                set_player_state("playing");
            }
            else if (e.type === "playing")
            {
                
            }
            else if (e.type === "generated")
            {
                if (playing_id === e.id)
                {
                    tts.backend_set_tts_id(playing_id);
                }
            }
            else if (e.type === "generation_progress")
            {
                if (playing_id === e.id)
                {
                    set_player_state("generating");
                    set_generation_progress(e.progress);
                }
            }
            else if (e.type === "finished")
            {

            }
            else if (e.type === "paused")
            {

            }
            else if (e.type === "set")
            {
                if (player_state !== null && e.data.id === playing_id)
                {
                    tts.backend_play_tts();
                }
            }
            else if (e.type === "stopped")
            {
                if (player_state)
                {
                    const id = player_state.playing_id;
                    set_player_state({
                        type: "stopped",
                        playing_id: id,
                        duration: player_state
                    })
                }
            }
        })

        return () => { 
            unlisten.then(u => u())
        }
    }, [])

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
                                <ImageButton
                                    image={images.play}
                                    tooltip="Play"
                                />
                                <ImageButton
                                    image={images.angles_right}
                                    tooltip="Fast forward 10s"
                                />
                                <Slider
                                    value={progress_value}
                                    min={0}
                                    max={100}
                                    tooltip="Progress slider"
                                    on_change={v => set_progress_value(v)}
                                    readonly
                                />
                                <Typography
                                    color={theme.palette.primary.contrastText}
                                    variant="body2"
                                    textAlign="center"
                                    component="span"
                                >
                                    00:00
                                </Typography>
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    )
}