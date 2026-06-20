import * as images from "@assets";
import OverlayModal from "@components/core/OverlayModal";
import { use_bible_reader } from "@components/providers/BibleReaderProvider";
import { get_backend_next_reader_passage, ReaderReading } from "@interop/reader";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { LoadingSpinner } from "@src/pages/LoadingSpinner";
import React, { useEffect, useState } from "react";
import QueueItem from "./QueueItem";

const QUEUE_OFFSET = 3;

type QueueState = {
    readings: (ReaderReading | null)[];
    selected_index: number;
    index_offset: number;
};

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
    const [queue_state, set_queue_state] = useState<QueueState | null>(null);
    const { reader_behavior } = use_bible_reader();
    const theme = useTheme();

    useEffect(() => {
        let mounted = true;

        fetch_reader_queue(index, QUEUE_OFFSET, bible).then(queue => {
            if (mounted) {
                set_queue_state({
                    readings: queue.readings,
                    selected_index: queue.selected_index,
                    index_offset: queue.index_offset,
                });
            }
        });

        return () => {
            mounted = false;
        };
    }, [index, bible, reader_behavior]);

    const is_loaded = queue_state !== null;

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
                        {queue_state.readings.map((r, i) => (
                            <QueueItem
                                key={i}
                                reading={r}
                                selected={i === queue_state.selected_index}
                                on_click={() => on_select(i + queue_state.index_offset)}
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

async function fetch_reader_queue(
    index: number,
    offset: number,
    bible: string,
): Promise<QueueState> {
    const before_count = Math.min(offset, Math.max(0, index));
    const before_offset = Math.max(0, index - before_count);
    const after_count = offset;
    const total_count = before_count + after_count + 1;

    const readings = await Promise.all(
        Array.from({ length: total_count }, (_, i) => i + before_offset).map(i =>
            get_backend_next_reader_passage(bible, i)
        )
    );

    return {
        readings,
        selected_index: before_count,
        index_offset: before_offset,
    };
}