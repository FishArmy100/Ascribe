import React, { useCallback } from "react";
import { Stack, useTheme } from "@mui/material";
import { BibleReaderBehavior } from "@interop/reader";
import ImageButton from "@components/core/ImageButton";
import RepeatTimeSelector, { TIME_OPTIONS } from "./RepeatTimeSelector";
import * as images from "@assets";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { ChapterId } from "@interop/bible";

export type ContinuousBehaviorSectionProps = {
    behavior: BibleReaderBehavior;
    on_change: (updater: (behavior: BibleReaderBehavior) => BibleReaderBehavior) => void;
};

export default function ContinuousBehaviorSection({
    behavior,
    on_change,
}: ContinuousBehaviorSectionProps): React.ReactElement {
    const theme = useTheme();
    const view_history = use_view_history();

    const get_current_chapter = useCallback((): ChapterId => {
        let index = view_history.get_index();
        while (index > 0) {
            const entry = view_history.at(index);
            if (entry.type === "chapter" || entry.type === "verse") {
                return entry.chapter;
            }
            index -= 1;
        }
        return { book: "Gen", chapter: 1 };
    }, [view_history]);

    const handle_enable_continuous_time_button = useCallback(() => {
        const chapter = get_current_chapter();

        on_change(prev => {
            if (prev.type === "continuous") {
                return {
                    type: "timed_continuous",
                    finish_segment: false,
                    seconds: TIME_OPTIONS[0],
                    start: chapter,
                };
            } else if (prev.type === "timed_continuous") {
                return {
                    type: "continuous",
                    start: chapter,
                };
            }
            return prev;
        });
    }, [on_change, get_current_chapter]);

    const handle_continuous_time_changed = useCallback((seconds: number) => {
        on_change(prev => {
            if (prev.type !== "timed_continuous") return prev;
            return {
                type: "timed_continuous",
                finish_segment: prev.finish_segment,
                seconds,
                start: prev.start,
            };
        });
    }, [on_change]);

    const handle_continuous_finish_section_changed = useCallback((value: boolean) => {
        on_change(prev => {
            if (prev.type !== "timed_continuous") return prev;
            return {
                type: "timed_continuous",
                finish_segment: value,
                seconds: prev.seconds,
                start: prev.start,
            };
        });
    }, [on_change]);

    if (behavior.type !== "continuous" && behavior.type !== "timed_continuous") {
        return <></>;
    }

    return (
        <Stack
            direction="row"
            gap={theme.spacing(1)}
            alignItems="center"
        >
            <ImageButton 
                image={images.alarm_clock}
                tooltip={null}
                on_click={handle_enable_continuous_time_button}
                active={behavior.type === "timed_continuous"}
            />
            {behavior.type === "timed_continuous" && (
                <RepeatTimeSelector 
                    seconds={behavior.seconds}
                    finish_segment={behavior.finish_segment}
                    on_time_select={handle_continuous_time_changed}
                    on_finish_segment_change={handle_continuous_finish_section_changed}
                />
            )}
        </Stack>
    );
}