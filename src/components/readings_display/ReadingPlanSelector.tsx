import DropdownBase from "@components/core/DropdownBase";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { get_module_display_name } from "@interop/module_info";
import { Box, Stack, Typography } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useCallback, useMemo, useState } from "react";
import use_readings_display_strings from "./readings_display_strings";
import { play_sfx } from "@interop/sfx";
import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";

export default function ReadingsPlanSelector(): React.ReactElement
{
    const { bible_display_settings, set_bible_display_settings } = use_bible_display_settings();
    const deep_copy = use_deep_copy();

    const [is_open, set_is_open] = useState(false);
    const { module_infos } = use_module_infos();

    const reading_plans = useMemo(() => {
        return Object.values(module_infos)
            .filter(m => m !== undefined)
            .filter(m => m.module_type === "readings")
            .sort((a, b) => 
                get_module_display_name(a).localeCompare(get_module_display_name(b))
            );
    }, [module_infos]);

    const strings = use_readings_display_strings();

    const on_select_plan = useCallback((plan: string) => {
        const copy = deep_copy(bible_display_settings);
        copy.reading_plan = plan;
        set_bible_display_settings(copy);
    }, [bible_display_settings, set_bible_display_settings, deep_copy]);

    const selected_reading_name = get_module_display_name(
        reading_plans.find(r => r.id === bible_display_settings.reading_plan)!
    );

    const options = useMemo((): TextSelectDropdownOption<string>[] => reading_plans.map(r => ({
        text: get_module_display_name(r),
        tooltip: null,
        value: r.id,
    })), []);

    const selected_option_index = useMemo(() => {
        return options.findIndex(o => o.value === bible_display_settings.reading_plan);
    }, [bible_display_settings.reading_plan, options])

    return (
        <TextSelectDropdown 
            tooltip={strings.select_plan}
            options={options}
            selected={selected_option_index}
            on_select={on_select_plan}
            variant="body2"
        />
    ) 
}