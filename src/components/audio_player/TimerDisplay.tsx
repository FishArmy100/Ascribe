import { Box, Stack, Typography, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import * as images from "@assets";
import ImageButton, { BUTTON_PADDING, BUTTON_SIZE } from "@components/core/ImageButton";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import use_image_filter from "@utils/use_image_filter";

export type TimerDisplayProps = {
    total_seconds: number,
    elapsed_seconds: number,
    show: boolean,
    on_reset: () => void,
}

export default function TimerDisplay({
    total_seconds,
    elapsed_seconds,
    show,
    on_reset,
}: TimerDisplayProps): React.ReactElement
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        reset: __t(
            "pages.audio_player.timer_display.labels.reset",
            "Reset timer",
        )
    }), [i18n])
    const theme = useTheme();

    const image_filter = use_image_filter(theme.palette.primary.dark);

    return (
        <Box
            sx={{
                position: "absolute",
                bottom: `100%`,
                right: theme.spacing(1),
                zIndex: -5,
            }}
        >
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ width: "60%", pointerEvents: "all" }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap={theme.spacing(1.5)}
                            sx={{
                                backgroundColor: theme.palette.primary.dark,
                                borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
                                px: 1,
                                py: 0.5,
                                borderStyle: "solid",
                                borderWidth: theme.spacing(1 / 8),
                                borderColor: theme.palette.divider,
                                width: "fit-content"
                            }}
                        >
                            <Box
                                component="img"
                                src={images.alarm_clock}
                                sx={{
                                    width: theme.spacing(BUTTON_SIZE),
                                    height: theme.spacing(BUTTON_SIZE),
                                    padding: theme.spacing(BUTTON_PADDING),
                                    filter: image_filter,
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: theme.palette.primary.contrastText,
                                }}
                            >
                                {format_progress_text(elapsed_seconds, total_seconds)}
                            </Typography>
                            <ImageButton 
                                image={images.arrows_rotate}
                                tooltip={strings.reset}
                                on_click={on_reset}
                            />
                        </Stack>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    )
}

function format_progress_text(elapsed: number, duration: number): string
{
    let time = Math.floor(duration - elapsed);
    let mins = Math.floor(time / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}