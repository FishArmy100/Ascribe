import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_search_bar_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        search_error: __t(
            "search_bar.messages.search_error",
            "Error when searching",
        ),
        search_tooltip: __t(
            "search_bar.tooltips.search",
            "Search",
        ),
        search_more: __t(
            "search_bar.tooltips.search_more",
            "More search options",
        )
    }), [i18n]);

    return strings;
}