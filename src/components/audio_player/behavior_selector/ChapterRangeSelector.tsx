import React, { useCallback, useMemo } from "react";
import { Stack, useTheme } from "@mui/material";
import { BibleReaderBehavior } from "@interop/reader";
import { ChapterId, get_chapter_distance } from "@interop/bible";
import { use_deep_copy } from "@utils/index";
import ChapterSelector from "@components/bible/ChapterSelector";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";

export type ChapterRangeSelectorProps = {
    bible: string,
    behavior: BibleReaderBehavior,
    on_change: (updater: (behavior: BibleReaderBehavior) => BibleReaderBehavior) => void,
};

export default function ChapterRangeSelector({
    bible,
    behavior,
    on_change,
}: ChapterRangeSelectorProps): React.ReactElement {
    const theme = useTheme();
    const deep_copy = use_deep_copy();
    const { bible_infos } = use_bible_infos();

    const handle_start_chapter_selected = useCallback((chapter: ChapterId) => {
        on_change(prev => {
            if (prev.type !== "chapter_range") return prev;

            const bible_info = bible_infos[bible];
            const copy = deep_copy(prev);
            copy.start = chapter;

            if (get_chapter_distance(bible_info, copy.start, copy.end) < 0) {
                copy.end = chapter;
            }
            return copy;
        });
    }, [on_change, deep_copy, bible_infos, bible]);

    const handle_end_chapter_selected = useCallback((chapter: ChapterId) => {
        on_change(prev => {
            if (prev.type !== "chapter_range") return prev;

            const bible_info = bible_infos[bible];
            const copy = deep_copy(prev);

            copy.end = chapter;

            if (get_chapter_distance(bible_info, prev.start, chapter) < 0) 
            {
                copy.start = chapter;
            }
            return copy;
        });
    }, [on_change, bible, bible_infos, deep_copy]);

    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        start: __t(
            "audio_player.behavior_selector.labels.start",
            "Start"
        ),
        end: __t(
            "audio_player.behavior_selector.labels.end",
            "End"
        )
    }), [i18n]);

    if (behavior.type !== "chapter_range") {
        return <></>;
    }

    return (
        <Stack
            direction="row"
            gap={theme.spacing(1)}
            alignItems="center"
        >
            <ChapterSelector 
                label={strings.start}
                bible={bible}
                chapter={behavior.start} 
                on_select={handle_start_chapter_selected} 
            />
            <ChapterSelector 
                label={strings.end}
                bible={bible}
                chapter={behavior.end}
                on_select={handle_end_chapter_selected} 
            />
        </Stack>
    );
}
