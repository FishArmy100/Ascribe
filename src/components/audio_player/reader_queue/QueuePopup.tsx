import * as images from "@assets";
import OverlayModal from "@components/core/OverlayModal";
import { use_bible_reader } from "@components/providers/BibleReaderProvider";
import { get_backend_reader_queue, ReaderQueue, ReaderReading } from "@interop/reader";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { LoadingSpinner } from "@src/pages/LoadingSpinner";
import React, { useEffect, useState } from "react";
import QueueItem from "./QueueItem";
import use_image_filter from "@utils/use_image_filter";

const QUEUE_OFFSET = 3;

export type QueuePopupProps = {
    index: number;
    show: boolean;
    bible: string;
    on_close: () => void;
    on_select: (index: number) => void;
};

export default function QueuePopup({
    index,
    bible,
    show,
    on_close,
    on_select,
}: QueuePopupProps): React.ReactElement {
    const [queue_state, set_queue_state] = useState<ReaderQueue | null>(null);
    const { reader_behavior } = use_bible_reader();
    const theme = useTheme();

    useEffect(() => {
        let mounted = true;

        get_backend_reader_queue(bible, index, QUEUE_OFFSET).then(queue => {
            if (mounted) 
            {
                set_queue_state(queue);
            }
        });

        return () => {
            mounted = false;
        };
    }, [index, bible, reader_behavior]);

    const is_loaded = queue_state !== null;

    const image_filter = use_image_filter(theme.palette.background.default);

    return (
        <OverlayModal show={show} on_close={on_close}>
            {is_loaded ? (
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
                        {queue_state.queue.map((r, i) => (
                            <QueueItem
                                key={i}
                                reading={r}
                                selected={i === queue_state.relative_index}
                                on_click={() => on_select(i + queue_state.queue_offset)}
                            />
                        ))}
                    </Stack>
                </Box>
            ) : (
                <LoadingSpinner />
            )}
        </OverlayModal>
    );
}