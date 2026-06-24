import { RepeatBehavior } from "@interop/reader";
import React, { useCallback, useEffect, useMemo } from "react";
import { Stack, useTheme } from "@mui/material";
import RepeatBehaviorTypeSelector from "./RepeatBehaviorTypeSelector";
import RepeatCountSelector from "./RepeatCountSelector";
import RepeatTimeSelector, { TIME_OPTIONS } from "./RepeatTimeSelector";

export type RepeatBehaviorSelectorProps = {
    behavior: RepeatBehavior,
    on_change: (behavior: RepeatBehavior) => void,
}

type RepeatBehaviorType = RepeatBehavior["type"]

export default function RepeatBehaviorSelector({
    behavior,
    on_change
}: RepeatBehaviorSelectorProps): React.ReactElement
{
    const theme = useTheme();

    const handle_behavior_type_changed = useCallback((type: RepeatBehaviorType) => {
        if (type === "count")
        {
            on_change({
                type: "count",
                count: 1,
            })
        }
        else if (type === "time")
        {
            on_change({
                type: "time",
                finish_segment: false,
                seconds: TIME_OPTIONS[0]
            })
        }
        else 
        {
            on_change({
                type: "infinite",
            })
        }
    }, [on_change, TIME_OPTIONS]);
    
    const handle_count_changed = useCallback((count: number) => {
        on_change({
            type: "count",
            count,
        })
    }, [on_change]);

    const handle_time_changed = useCallback((seconds: number) => {
        if (behavior.type === "time")
        {
            on_change({
                type: "time",
                finish_segment: behavior.finish_segment,
                seconds,
            })
        }
        else 
        {
            on_change({
                type: "time",
                finish_segment: false,
                seconds,
            })
        }
    }, [on_change, behavior]);

    const handle_finish_section_changed = useCallback((value: boolean) => {
        if (behavior.type === "time")
        {
            on_change({
                type: "time",
                finish_segment: value,
                seconds: behavior.seconds,
            })
        }
        else 
        {
            on_change({
                type: "time",
                finish_segment: value,
                seconds: TIME_OPTIONS[0],
            })
        }
    }, [on_change, behavior, TIME_OPTIONS])

    useEffect(() => {
        let corrected_behavior: RepeatBehavior | null = null;

        // Validate count
        if (behavior.type === "count") 
        {
            const { count } = behavior;
            if (!Number.isInteger(count) || count < 1 || count > 10) 
            {
                console.warn(`Invalid count: ${count}, correcting to 1`);
                corrected_behavior = { type: "count", count: 1 };
            }
        }

        // Validate time
        if (behavior.type === "time") 
        {
            if (!TIME_OPTIONS.includes(behavior.seconds)) 
            {
                console.warn(`Invalid seconds: ${behavior.seconds}, correcting to first option`);
                corrected_behavior = { type: "time", finish_segment: false, seconds: TIME_OPTIONS[0] };
            }
        }

        // Notify parent if correction needed
        if (corrected_behavior) 
        {
            on_change(corrected_behavior);
        }
    }, [behavior, TIME_OPTIONS, on_change])

    return (
        <Stack
            direction="row"
            alignItems="center"
            gap={theme.spacing(1)}
        >
            <RepeatBehaviorTypeSelector
                behaviorType={behavior.type}
                onSelect={handle_behavior_type_changed}
            />
            {behavior.type === "count" && (
                <RepeatCountSelector
                    count={behavior.count}
                    onSelect={handle_count_changed}
                />
            )}
            {behavior.type === "time" && (
                <RepeatTimeSelector
                    seconds={behavior.seconds}
                    finish_segment={behavior.finish_segment}
                    on_time_select={handle_time_changed}
                    on_finish_segment_change={handle_finish_section_changed}
                />
            )}
        </Stack>
    )

}