import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_readings_display_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        select_plan: __t(
            "readings_display.tooltips.select_plan", 
            "Select readings plan",
        ),
        hide: __t(
            "readings_display.tooltips.hide", 
            "Hide readings display",
        ),
        show: __t(
            "readings_display.tooltips.show", 
            "Show readings display",
        ),
        pick_date: __t(
            "readings_display.labels.pick_date",
            "Pick a date",
        )
    }), [i18n]);

    return strings;
}