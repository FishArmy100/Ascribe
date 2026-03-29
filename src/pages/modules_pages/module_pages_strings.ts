import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_module_pages_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        select_range_tooltip: (title: string) => __t(
            "pages.module.tooltips.select_range",
            "Select range {{$title}}",
            {title}
        ),
        next_page: __t(
            "pages.module.tooltips.next",
            "To next page",
        ),
        previous_page: __t(
            "pages.module.tooltips.previous",
            "To previous page",
        ),
        expand_module_tooltip: __t(
            "pages.modules.tooltips.expand_module",
            "Expand module information",
        ),
        collapse_module_tooltip: __t(
            "pages.modules.tooltips.collapse_module",
            "Collapse module information",
        ),
        enable_module_tooltip: __t(
            "pages.modules.tooltips.enable_module",
            "Enable Module"
        ),
        disable_module_tooltip: __t(
            "pages.modules.tooltips.disable_module",
            "Disable Module"
        ),
        cannot_disable_tooltip: __t(
            "pages.modules.tooltips.cannot_disable",
            "Cannot be disabled",
        ),
        license_title: __t(
            "pages.modules.titles.license",
            "License",
        ),
        source_title: __t(
            "pages.modules.titles.source",
            "Source",
        ),
        pub_year_title: __t(
            "pages.modules.titles.pub_year",
            "Publication Year",
        ),
        authors_title: __t(
            "pages.modules.titles.authors",
            "Authors",
        ),
        language: __t(
            "pages.module.titles.language",
            "Language",
        ),
        search_placeholder: __t(
            "pages.module.placeholders.search",
            "Search...",
        ),
        module_display_button_tooltip: __t(
            "pages.modules.tooltips.module_display_button_tooltip",
            "Module display settings",
        ),
        bible_option_title: __t(
            "pages.modules.titles.bible",
            "Bibles",
        ),
        bible_option_tooltip: __t(
            "pages.modules.tooltips.bible",
            "Showing Bible modules",
        ),
        commentary_option_title: __t(
            "pages.modules.titles.commentary",
            "Commentaries",
        ),
        commentary_option_tooltip: __t(
            "pages.modules.tooltips.commentary",
            "Showing commentary modules",
        ),
        xrefs_option_title: __t(
            "pages.modules.titles.xrefs",
            "Cross References",
        ),
        xrefs_option_tooltip: __t(
            "pages.modules.tooltips.xrefs",
            "Showing cross reference modules",
        ),
        dictionaries_option_title: __t(
            "pages.modules.titles.dictionaries",
            "Dictionaries",
        ),
        dictionaries_option_tooltip: __t(
            "pages.modules.tooltips.dictionaries",
            "Showing dictionary modules",
        ),
        notebooks_option_title: __t(
            "pages.modules.titles.notebook",
            "Notebooks",
        ),
        notebooks_option_tooltip: __t(
            "pages.modules.tooltips.notebook",
            "Showing notebook modules",
        ),
        readings_option_title: __t(
            "pages.modules.titles.readings",
            "Readings",
        ),
        readings_option_tooltip: __t(
            "pages.modules.tooltips.readings",
            "Showing readings modules",
        ),
        strongs_option_title: __t(
            "pages.modules.titles.strongs",
            "Strong's Definitions",
        ),
        strongs_option_tooltip: __t(
            "pages.modules.tooltips.strongs",
            "Showing Strong's definitions",
        ),
        reset_options_tooltip: __t(
            "pages.modules.tooltips.reset_modules",
            "Reset display options",
        ),
        enable_module_filter_tooltip: (name: string) => __t(
            "pages.modules.tooltips.enable_module_filter",
            "Enable {{$name}}",
            {name},
        ),
        disable_module_filter_tooltip: (name: string) => __t(
            "pages.modules.tooltips.disable_module_filter",
            "Disable {{$name}}",
            {name},
        ),
        module_titles_label: (modules: string[]) => {
            let name = modules.join(", ");
            if (modules.length === 1)
            {
                return __t(
                    "pages.modules.labels.search_module_title",
                    "Module: {{$name}}",
                    {name},
                )
            }
            else
            {
                return __t(
                    "pages.modules.labels.search_modules_title",
                    "Modules: {{$name}}",
                    {name},
                )
            }
        }
    }), [i18n]);

    return strings;
}