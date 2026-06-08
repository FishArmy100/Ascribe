import ImageSelectDropdown, { ImageSelectDropdownOption } from "@components/core/ImageSelectDropdown";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { RepeatBehavior } from "@interop/reader";
import React, { useMemo } from "react";
import * as images from "@assets";

export type RepeatBehaviorTypeSelectorProps = {
    behaviorType: RepeatBehavior["type"];
    onSelect: (type: RepeatBehavior["type"]) => void;
};

type RepeatBehaviorType = RepeatBehavior["type"];

export default function RepeatBehaviorTypeSelector({
    behaviorType,
    onSelect,
}: RepeatBehaviorTypeSelectorProps): React.ReactElement {
    const i18n = use_app_i18n();

    const strings = useMemo(
        () => ({
            count_tooltip: __t(
                "pages.audio_player.behavior_selector.repeat_behavior.count_tooltip",
                "Repeat the current scripture sections a number of times"
            ),
            time_tooltip: __t(
                "pages.audio_player.behavior_selector.repeat_behavior.time_tooltip",
                "Repeat the current scripture sections for a set amount of time"
            ),
            infinite_tooltip: __t(
                "pages.audio_player.behavior_selector.repeat_behavior.infinite_tooltip",
                "Repeat the current scripture sections indefinitely"
            ),
        }),
        [i18n]
    );

    const options = useMemo((): ImageSelectDropdownOption<RepeatBehaviorType>[] => {
        return [
            {
                image: images.repeat,
                tooltip: strings.count_tooltip,
                value: "count",
            },
            {
                image: images.alarm_clock,
                tooltip: strings.time_tooltip,
                value: "time",
            },
            {
                image: images.infinity,
                tooltip: strings.infinite_tooltip,
                value: "infinite",
            },
        ];
    }, [strings]);

    const selectedIndex = useMemo(() => {
        return options.findIndex((v) => v.value === behaviorType);
    }, [options, behaviorType]);

    return (
        <ImageSelectDropdown
            tooltip={null}
            options={options}
            selected={selectedIndex}
            on_select={onSelect}
        />
    );
}
