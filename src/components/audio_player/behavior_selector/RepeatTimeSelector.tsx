import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import LabeledCheckbox from "@components/core/LabeledCheckbox";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import React, { useMemo } from "react";
import { Stack, useTheme } from "@mui/material";

export const TIME_OPTIONS = Array
    .from({ length: 12 * 4 })
    .map((_, i) => (i + 1) * 15 * 60);

export type RepeatTimeSelectorProps = {
    seconds: number;
    finish_segment: boolean;
    on_time_select: (seconds: number) => void;
    on_finish_segment_change: (value: boolean) => void;
};

export default function RepeatTimeSelector({
    seconds,
    finish_segment,
    on_time_select,
    on_finish_segment_change,
}: RepeatTimeSelectorProps): React.ReactElement {
    const theme = useTheme();
    const i18n = use_app_i18n();

    const strings = useMemo(
        () => ({
            finish_segment_label: __t(
                "pages.audio_player.behavior_selector.repeat_behavior.finish_segment_label",
                "Finish Segment"
            ),
            finish_segment_tooltip: __t(
                "pages.audio_player.behavior_selector.repeat_behavior.finish_segment_tooltip",
                "Finish the current section or chapter even if the timer has finished"
            ),
        }),
        [i18n]
    );

    const options = useMemo((): TextSelectDropdownOption<number>[] => {
        return TIME_OPTIONS
            .map((m) => {
                const hours = Math.floor(m / 60 / 60);
                const minutes = Math.floor((m - hours * 60 * 60) / 60);
                return {
                    value: m,
                    text: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
                    tooltip: null,
                };
            });
    }, []);

    const selected_index = useMemo(() => {
        return options.findIndex((o) => o.value === seconds);
    }, [options, seconds]);

    return (
        <Stack direction="row" alignItems="center">
            <TextSelectDropdown
                options={options}
                on_select={on_time_select}
                tooltip={null}
                selected={selected_index >= 0 ? selected_index : 0}
                variant="body2"
                button_sx={{
                    padding: theme.spacing(0.5),
                }}
                option_sx={{
                    padding: theme.spacing(0.5),
                }}
            />
            <LabeledCheckbox
                label_props={{ 
                    variant: "body2", 
                    bold: true, 
                }}
                checkbox_props={{
                    sx: {
                        padding: 0,
                        ml: theme.spacing(1)
                    }
                }}
                label={strings.finish_segment_label}
                tooltip={strings.finish_segment_tooltip}
                value={finish_segment}
                on_change={on_finish_segment_change}
            />
        </Stack>
    );
}
