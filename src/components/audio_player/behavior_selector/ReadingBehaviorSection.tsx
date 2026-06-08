import React, { useCallback, useMemo } from "react";
import { useTheme } from "@mui/material";
import { BibleReaderBehavior } from "@interop/reader";
import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { ReadingsDate, to_readings_date } from "@interop/bible/readings";
import BehaviorDatePicker from "./BehaviorDatePicker";
import { use_deep_copy } from "@utils/index";
import { use_module_infos } from "@components/providers/ModuleInfoProvider";
import { get_module_display_name } from "@interop/module_info";

export type ReadingBehaviorSectionProps = {
    behavior: BibleReaderBehavior;
    on_change: (behavior: BibleReaderBehavior) => void;
};

export default function ReadingBehaviorSection({
    behavior,
    on_change,
}: ReadingBehaviorSectionProps): React.ReactElement {
    const theme = useTheme();
    const deep_copy = use_deep_copy();

    const { reading_plan_options, get_selected_reading_plan_index } = use_reading_plans()

    const handle_reading_plan_selected = useCallback((id: string) => {
        if (behavior.type === "reading") {
            const copy = deep_copy(behavior);
            copy.module_id = id;
            on_change(copy);
        }
        else {
            const start_date = to_readings_date(new Date(new Date().getFullYear(), 0, 1));
            on_change({
                type: "reading",
                module_id: id,
                start_date,
                date: to_readings_date(new Date()),
                repeat: {
                    type: "count",
                    count: 1,
                }
            })
        }
    }, [behavior, on_change, deep_copy]);

    const handle_date_changed = useCallback((date: ReadingsDate) => {
        if (behavior.type !== "reading") 
            return;

        const copy = deep_copy(behavior);
        copy.date = date;
        on_change(copy);
    }, [on_change, behavior, deep_copy]);

    if (behavior.type !== "reading") {
        return <></>;
    }

    return (
        <>
            <TextSelectDropdown
                tooltip={null}
                options={reading_plan_options}
                selected={get_selected_reading_plan_index(behavior)}
                on_select={handle_reading_plan_selected}
                variant="body2"
                button_sx={{
                    padding: theme.spacing(0.5),
                }}
                option_sx={{
                    padding: theme.spacing(0.5),
                }}
            />
            <BehaviorDatePicker 
                label={null}
                date={behavior.date}
                on_change={handle_date_changed}
            />
        </>
    );
}

export const use_reading_plans = () => {
    const { module_infos } = use_module_infos();

    const reading_plans = useMemo(() => {
        return Object.values(module_infos)
            .filter(m => m !== undefined)
            .filter(m => m.module_type === "readings")
            .sort((a, b) => 
                get_module_display_name(a).localeCompare(get_module_display_name(b))
            );
    }, [module_infos]);

    const reading_plan_options = useMemo((): TextSelectDropdownOption<string>[] => {
        return reading_plans.map(p => ({
            text: get_module_display_name(p),
            tooltip: null,
            value: p.id,
        }))
    }, [reading_plans]);

    const get_selected_reading_plan_index = useCallback((behavior: BibleReaderBehavior) => {
        if (behavior.type !== "reading") {
            return -1;
        }
        return reading_plan_options.findIndex(o => o.value === behavior.module_id);
    }, [reading_plan_options]);

    return { reading_plans, reading_plan_options, get_selected_reading_plan_index };
};
