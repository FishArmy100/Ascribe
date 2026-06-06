import ImageSelectDropdown, { ImageSelectDropdownOption } from "@components/core/ImageSelectDropdown";
import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { RepeatBehavior } from "@interop/reader";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as images from "@assets";
import { Stack, useTheme } from "@mui/material";
import LabeledCheckbox from "@components/core/LabeledCheckbox";

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
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        count_tooltip: __t(
            "pages.audio_player.behavior_selector.repeat_behavior.count_tooltip",
            "Repeat the current scripture sections a number of times",
        ),
        time_tooltip: __t(
            "pages.audio_player.behavior_selector.repeat_behavior.time_tooltip",
            "Repeat the current scripture sections for a set amount of time",
        ),
        infinite_tooltip: __t(
            "pages.audio_player.behavior_selector.repeat_behavior.infinite_tooltip",
            "Repeat the current scripture sections indefinitely",
        ),
        finish_segment_label: __t(
            "pages.audio_player.behavior_selector.repeat_behavior.finish_segment_label",
            "Finish Segment",
        ),
        finish_segment_tooltip: __t(
            "pages.audio_player.behavior_selector.repeat_behavior.finish_segment_tooltip",
            "Finish the current section or chapter even if the timer has finished",
        )
    }), [i18n]);

    const count_options = useMemo((): TextSelectDropdownOption<number>[] => {
        return Array.from({ length: 10 }, (_, i) => i + 1).map(i => ({
            text: `${i}x`,
            tooltip: null,
            value: i,
        }));
    }, []);

    const behavior_type_options = useMemo((): ImageSelectDropdownOption<RepeatBehaviorType>[] => {
        return [
            {
                image: images.repeat,
                tooltip: strings.count_tooltip,
                value: "count"
            },
            {
                image: images.alarm_clock,
                tooltip: strings.time_tooltip,
                value: "time"
            },
            {
                image: images.infinity,
                tooltip: strings.infinite_tooltip,
                value: "infinite"
            },
        ]
    }, []);

    const selected_behavior_type_index = useMemo(() => {
        return behavior_type_options.findIndex(v => v.value === behavior.type);
    }, [behavior_type_options, behavior]);

    const time_options = useMemo((): TextSelectDropdownOption<number>[] => {
        return Array.from({ length: 12 * 4 }).map((_, i)=> (i + 1) * 15 * 60).map(m => {
            const hours = Math.floor(m / 60 / 60);
            const minutes = Math.floor((m - hours * 60 * 60) / 60);
            return {
                value: m,
                text: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
                tooltip: null,
            }
        })
    }, []);

    const selected_time_index = useMemo(() => {
        if (behavior.type !== "time")
        {
            return null;
        }
        return time_options.findIndex(o => o.value === behavior.seconds);
    }, [time_options, behavior]);

    const handle_behavior_type_changed = useCallback((type: RepeatBehaviorType) => {
        if (type === "count")
        {
            on_change({
                type: "count",
                count: count_options[0].value,
            })
        }
        else if (type === "time")
        {
            on_change({
                type: "time",
                finish_segment: false,
                seconds: time_options[0].value
            })
        }
        else 
        {
            on_change({
                type: "infinite",
            })
        }
    }, [on_change]);
    
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
                seconds: time_options[0].value,
            })
        }
    }, [on_change, behavior])

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
            const valid_times = time_options.map(o => o.value);
            if (!valid_times.includes(behavior.seconds)) 
            {
                console.warn(`Invalid seconds: ${behavior.seconds}, correcting to first option`);
                corrected_behavior = { type: "time", finish_segment: false, seconds: time_options[0].value };
            }
        }

        // Notify parent if correction needed
        if (corrected_behavior) 
        {
            on_change(corrected_behavior);
        }
    }, [behavior, time_options, on_change])

    return (
        <Stack
            direction="row"
            alignItems="center"
            gap={theme.spacing(1)}
        >
            <ImageSelectDropdown 
                tooltip={null}
                options={behavior_type_options}
                selected={selected_behavior_type_index}
                on_select={handle_behavior_type_changed}
            />
            {behavior.type === "count" && (
                <TextSelectDropdown 
                    options={count_options}
                    on_select={handle_count_changed}
                    tooltip={null}
                    selected={behavior.count - 1}
                    variant="body2"
                    button_sx={{
                        padding: theme.spacing(0.5),
                    }}
                    option_sx={{
                        padding: theme.spacing(0.5),
                    }}
                />
            )}
            {behavior.type === "time" && (
                <Stack
                    direction="row"
                    alignItems="center"
                >
                    <TextSelectDropdown 
                        options={time_options}
                        on_select={handle_time_changed}
                        tooltip={null}
                        selected={selected_time_index ?? 0}
                        variant="body2"
                        button_sx={{
                            padding: theme.spacing(0.5),
                        }}
                        option_sx={{
                            padding: theme.spacing(0.5),
                        }}
                    />
                    <LabeledCheckbox 
                        label_props={{ variant: "body2", bold: true }}
                        label={strings.finish_segment_label}
                        tooltip={strings.finish_segment_tooltip}
                        value={behavior.finish_segment}
                        on_change={handle_finish_section_changed}
                    />
                </Stack>
            )}
        </Stack>
    )

}