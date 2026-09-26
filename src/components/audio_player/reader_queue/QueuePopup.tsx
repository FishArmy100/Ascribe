import * as images from "@assets";
import OverlayModal from "@components/core/OverlayModal";
import { use_bible_reader } from "@components/providers/BibleReaderProvider";
import { get_backend_reader_queue, ReaderQueue, ReaderReading } from "@interop/reader";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { LoadingSpinner } from "@src/pages/LoadingSpinner";
import React, { useCallback, useEffect, useState } from "react";
import QueueItem from "./QueueItem";
import use_image_filter from "@utils/use_image_filter";
import { AudioPlayerController } from "../audio_player_hooks/player_controller";

const QUEUE_OFFSET = 3;

export type QueuePopupProps = {
    show: boolean,
    on_close: () => void;
    controller: AudioPlayerController
};

export default function QueuePopup({
    show,
    on_close,
    controller
}: QueuePopupProps): React.ReactElement {
    const { reader_behavior } = use_bible_reader();
    const theme = useTheme();

    const image_filter = use_image_filter(theme.palette.background.default);

    return (
        <OverlayModal show={show} on_close={on_close}> 
            <Box sx={{ minWidth: 220 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{
                        pb: 1.25,
                        mb: 2,
                        borderBottom: `${theme.spacing(1 / 16)} solid ${theme.palette.divider}`,
                    }}
                >
                    <Box
                        component="img"
                        src={images.book}
                        sx={{
                            width: 16,
                            height: 16,
                            opacity: 0.5,
                            filter: image_filter,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Up next
                    </Typography>
                </Stack>

                <Stack gap={theme.spacing(0.75)}>
                    {controller.queue.queue.map((r, i) => (
                        <QueueItem
                            key={i}
                            reading={r}
                            selected={i === controller.queue.relative_index}
                            on_click={() => controller.set_index(i + controller.queue.queue_offset)}
                        />
                    ))}
                </Stack>
            </Box>
        </OverlayModal>
    );
}