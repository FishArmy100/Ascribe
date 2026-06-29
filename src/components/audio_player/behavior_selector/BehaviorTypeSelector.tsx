import React, { useCallback, useMemo } from "react";
import { BibleReaderBehavior } from "@interop/reader";
import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { useTheme } from "@mui/material";
import { to_readings_date } from "@interop/bible/readings";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { ChapterId } from "@interop/bible";
import { RefIdInner } from "@interop/bible/ref_id";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";

type BehaviorType = "reading" | "chapter_range" | "current" | "continuous";

export type BehaviorTypeSelectorProps = {
    behavior: BibleReaderBehavior;
    on_change: (updater: (behavior: BibleReaderBehavior) => BibleReaderBehavior) => void,
    reading_plan_options: TextSelectDropdownOption<string>[];
};

export default function BehaviorTypeSelector({
    behavior,
    on_change,
    reading_plan_options,
}: BehaviorTypeSelectorProps): React.ReactElement {
    const theme = useTheme();
    const view_history = use_view_history();
    const i18n = use_app_i18n();

    const behavior_type_strings = useMemo(() => ({
        tooltips: {
            reading: __t(
                "audio_player.behavior_selector.tooltips.reading",
                "Listen to a selected daily readings"
            ),
            chapter_range: __t(
                "audio_player.behavior_selector.tooltips.segment",
                "Listen to a segment of scripture"
            ),
            current: __t(
                "audio_player.behavior_selector.tooltips.current",
                "Listen to the scripture that is currently open"
            ),
            continuous: __t(
                "audio_player.behavior_selector.tooltips.continuous",
                "Continually listen to a list of chapters",
            )
        },
        labels: {
            reading: __t(
                "audio_player.behavior_selector.labels.reading",
                "Reading"
            ),
            chapter_range: __t(
                "audio_player.behavior_selector.labels.segment",
                "Chapter Range"
            ),
            current: __t(
                "audio_player.behavior_selector.labels.current",
                "Current"
            ),
            continuous: __t(
                "audio_player.behavior_selector.labels.continuous",
                "Continuous",
            ),
        }
    }), [i18n]);

    const behavior_options = useMemo((): TextSelectDropdownOption<BehaviorType>[] => [
        {
            text: behavior_type_strings.labels.current,
            tooltip: behavior_type_strings.tooltips.current,
            value: "current",
        },
        {
            text: behavior_type_strings.labels.reading,
            tooltip: behavior_type_strings.tooltips.reading,
            value: "reading",
        },
        {
            text: behavior_type_strings.labels.chapter_range,
            tooltip: behavior_type_strings.tooltips.chapter_range,
            value: "chapter_range",
        },
        {
            text: behavior_type_strings.labels.continuous,
            tooltip: behavior_type_strings.tooltips.continuous,
            value: "continuous",
        },
    ], [behavior_type_strings]);

    const selected_index = useMemo(() => {
        return behavior_options.findIndex(b => 
            b.value === behavior.type || 
            (
                b.value === "continuous" && 
                (behavior.type === "timed_continuous" || behavior.type === "continuous")
            )
        );
    }, [behavior_options, behavior.type]);

    const handle_behavior_type_selected = useCallback((type: BehaviorType) => {
        if (type === "reading") {
            const start_date = to_readings_date(new Date(new Date().getFullYear(), 0, 1));

            on_change(() => ({
                type: "reading",
                module_id: reading_plan_options[0].value,
                start_date: start_date,
                date: to_readings_date(new Date()),
                repeat: {
                    type: "count",
                    count: 1,
                }
            }))
        }
        else if (type === "chapter_range") {
            let chapter: ChapterId | null = null;
            let index = view_history.get_index();
            do {
                const entry = view_history.at(index);
                if (entry.type === "chapter") {
                    chapter = entry.chapter;
                }
                else if (entry.type === "verse") {
                    chapter = entry.chapter;
                }

                index -= 1;
            }
            while (chapter === null && index > 0);

            if (chapter === null) {
                chapter = {
                    book: "Gen",
                    chapter: 1,
                }
            }

            on_change(() => ({
                type: "chapter_range",
                start: chapter,
                end: chapter,
                repeat: {
                    type: "count",
                    count: 1,
                }
            }))
        }
        else if (type === "current") 
        {
            let inner: RefIdInner | null = null;
            let index = view_history.get_index();
            do {
                const entry = view_history.at(index);
                if (entry.type === "chapter") {
                    inner = {
                        type: "single",
                        atom: {
                            type: "chapter",
                            ...entry.chapter
                        }
                    };
                }
                else if (entry.type === "verse") {
                    inner = {
                        type: "range",
                        from: {
                            type: "verse",
                            ...entry.chapter,
                            verse: entry.start,
                        },
                        to: {
                            type: "verse",
                            ...entry.chapter,
                            verse: entry.end ?? entry.start,
                        }
                    };
                }

                index -= 1;
            }
            while (inner === null && index > 0);

            if (inner === null) {
                inner = {
                    type: "single",
                    atom: {
                        type: "chapter",
                        book: "Gen",
                        chapter: 1
                    }
                }
            }

            on_change(() => ({
                type: "current",
                ref_id: inner,
                repeat: {
                    type: "count",
                    count: 1,
                }
            }))
        }
        else if (type === "continuous") {
            let chapter: ChapterId | null = null;
            let index = view_history.get_index();
            do {
                const entry = view_history.at(index);
                if (entry.type === "chapter") {
                    chapter = entry.chapter;
                }
                else if (entry.type === "verse") {
                    chapter = entry.chapter;
                }

                index -= 1;
            }
            while (chapter === null && index > 0);

            if (chapter === null) {
                chapter = {
                    book: "Gen",
                    chapter: 1,
                }
            }

            on_change(() => ({
                type: "continuous",
                start: chapter,
            }));
        }
    }, [on_change, reading_plan_options, view_history]);

    return (
        <TextSelectDropdown
            tooltip={null}
            options={behavior_options}
            selected={selected_index}
            on_select={handle_behavior_type_selected}
            variant="body2"
            button_sx={{
                padding: theme.spacing(0.5),
            }}
            option_sx={{
                padding: theme.spacing(0.5),
            }}
        />
    );
}
