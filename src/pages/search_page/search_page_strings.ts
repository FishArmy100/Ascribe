import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { __tv } from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_search_page_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        search_title: (raw: string, count: number) => __tv(
            "pages.search.title",
            [
                ["Found {{$count}} results for: {{$raw}}", ({count}) => count > 1],
                ["Found a result for: {{$raw}}", ({count}) => count === 1],
                "No search results where found for: {{$raw}}"
            ],
            { raw, count }
        ),
        next_page: __t(
            "pages.search.tooltips.next",
            "To next page",
        ),
        previous_page: __t(
            "pages.search.tooltips.previous",
            "To previous page",
        ),
        select_range_tooltip: (title: string) => __t(
            "pages.search.tooltips.select_range",
            "Select range {{$title}}",
            {title}
        ),
        
    }), [i18n]);

    return strings;
}