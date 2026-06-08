import React, { useCallback } from "react";
import { Stack, useTheme, Typography } from "@mui/material";
import { BibleReaderBehavior } from "@interop/reader";
import { ChapterId } from "@interop/bible";
import ChapterPicker from "@components/bible/ChapterPicker";
import { use_deep_copy } from "@utils/index";

export type ChapterRangeSelectorProps = {
    behavior: BibleReaderBehavior;
    on_change: (behavior: BibleReaderBehavior) => void;
};

export default function ChapterRangeSelector({
    behavior,
    on_change,
}: ChapterRangeSelectorProps): React.ReactElement {
    const theme = useTheme();
    const deep_copy = use_deep_copy();

    const handle_start_chapter_selected = useCallback((chapter: ChapterId) => {
        if (behavior.type !== "chapter_range")
            return;

        const copy = deep_copy(behavior);
        copy.start = chapter;
        on_change(copy);
    }, [behavior, on_change, deep_copy]);

    const handle_chapter_count_changed = useCallback((chapter: ChapterId) => {
        if (behavior.type !== "chapter_range")
            return;

        // Calculate the number of chapters between start and selected chapter
        const start_num = behavior.start.chapter;
        const end_num = chapter.chapter;
        const count = Math.abs(end_num - start_num) + 1;

        const copy = deep_copy(behavior);
        copy.count = count;
        on_change(copy);
    }, [behavior, on_change, deep_copy]);

    if (behavior.type !== "chapter_range") {
        return <></>;
    }

    return (
        <Stack
            direction="row"
            gap={theme.spacing(1)}
            alignItems="center"
        >
            <Stack direction="row" gap={theme.spacing(0.5)} alignItems="center">
                <Typography variant="body1">Start</Typography>
                <ChapterPicker on_select={handle_start_chapter_selected} />
            </Stack>
            <Stack direction="row" gap={theme.spacing(0.5)} alignItems="center">
                <Typography variant="body1">End</Typography>
                <ChapterPicker on_select={handle_chapter_count_changed} />
            </Stack>
        </Stack>
    );
}
