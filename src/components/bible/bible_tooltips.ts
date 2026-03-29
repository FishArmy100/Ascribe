import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_bible_tooltips()
{
    const i18n = use_app_i18n();
    const tooltips = useMemo(() => ({
        select_chapter: __t(
            "bible.tooltips.select_chapter",
            "Select chapter",
        ),
        select_version: __t(
            "bible.tooltips.select_version",
            "Select Bible version",
        ),
        select_version_button: (bible: string) => __t(
            "bible.tooltips.select_version_button",
            "Select Bible {{$bible}}",
            { bible }
        ),
        disable_strongs: __t(
            "bible.tooltips.disable_strongs",
            "Disable Strongs numbers",
        ),
        enable_strongs: __t(
            "bible.tooltips.enable_strongs",
            "Enable Strongs numbers",
        ),
        enable_parallel: __t(
            "bible.tooltips.enable_parallel",
            "Enable parallel version"
        ),
        disable_parallel: __t(
            "bible.tooltips.disable_parallel",
            "Disable parallel version"
        ),
    }), [i18n]);

    return tooltips;
}