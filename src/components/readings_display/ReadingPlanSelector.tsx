import DropdownBase from "@components/core/DropdownBase";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { get_module_display_name } from "@interop/module_info";
import { Stack, Typography } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useCallback, useMemo, useState } from "react";

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

    const on_select_plan = useCallback((plan: string) => {
        const copy = deep_copy(bible_display_settings);
        copy.reading_plan = plan;
        set_bible_display_settings(copy);
    }, [bible_display_settings, set_bible_display_settings, deep_copy])

    const selected_reading_name = get_module_display_name(
        reading_plans.find(r => r.id === bible_display_settings.reading_plan)!
    );

    return (
        <DropdownBase
            button={{
                type: "text",
                tooltip: "Select reading plan",
                text: selected_reading_name,
                sx: {
                    width: "100%"
                }
            }}
            is_open={is_open}
            on_click={() => set_is_open(!is_open)}
            content_z_index={2000}
            panel_sx={{
                boxSizing: "border-box",
                width: "100%",
            }}
        >
            <Stack>
                {reading_plans.map((r, i) => {
                    const name = get_module_display_name(r);
                    const is_selected = bible_display_settings.reading_plan === r.id;
                    return (
                        <Typography
                            key={i}
                            fontWeight={is_selected ? "bold" : undefined}
                            component="span"
                            className="animated-underline"
                            onClick={() => on_select_plan(r.id)}
                            sx={{
                                cursor: "pointer",
                                width: "fit-content",
                            }}
                        >
                            {name}
                        </Typography>
                    )
                })}
            </Stack>
        </DropdownBase>
    )
}