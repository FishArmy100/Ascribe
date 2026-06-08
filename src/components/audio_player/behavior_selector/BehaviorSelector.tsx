import { BibleReaderBehavior, RepeatBehavior } from "@interop/reader";
import { Stack, useTheme } from "@mui/material";
import React, { useCallback } from "react";
import RepeatBehaviorSelector from "./RepeatBehaviorSelector";
import BehaviorTypeSelector from "./BehaviorTypeSelector";
import ReadingBehaviorSection, { use_reading_plans } from "./ReadingBehaviorSection";
import ContinuousBehaviorSection from "./ContinuousBehaviorSection";
import ChapterRangeSelector from "./ChapterRangeSelector";
import { use_deep_copy } from "@utils/index";

export type BehaviorSelectorProps = {
    behavior: BibleReaderBehavior,
    on_change: (behavior: BibleReaderBehavior) => void,
}

export default function BehaviorSelector({
    behavior,
    on_change,
}: BehaviorSelectorProps): React.ReactElement {
    const theme = useTheme();
    const deep_copy = use_deep_copy();
    const { reading_plan_options } = use_reading_plans();

    const handle_repeat_behavior_changed = useCallback((repeat: RepeatBehavior) => {
        if (behavior.type === "continuous" || behavior.type === "timed_continuous")
            return;

        const copy = deep_copy(behavior);
        copy.repeat = repeat;
        on_change(copy);
    }, [behavior, on_change, deep_copy]);

    return (
        <Stack
            direction="column"
            gap={theme.spacing(1)}
            sx={{
                backgroundColor: theme.palette.background.default,
                padding: theme.spacing(0.5)
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                gap={theme.spacing(1)}
                flexWrap="wrap"
            >
                <BehaviorTypeSelector
                    behavior={behavior}
                    on_change={on_change}
                    reading_plan_options={reading_plan_options}
                />
                <ReadingBehaviorSection
                    behavior={behavior}
                    on_change={on_change}
                />
                <ChapterRangeSelector
                    behavior={behavior}
                    on_change={on_change}
                />
                <ContinuousBehaviorSection
                    behavior={behavior}
                    on_change={on_change}
                />
            </Stack>
            {(behavior.type !== "continuous" && behavior.type !== "timed_continuous") && (
                <RepeatBehaviorSelector
                    behavior={behavior.repeat}
                    on_change={handle_repeat_behavior_changed} 
                />
            )}
        </Stack>
    )
}