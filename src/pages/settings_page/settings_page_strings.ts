import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_settings_page_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        select_font_title: __t(
            "pages.settings.font.title",
            "Font:"
        ),
        font_option_tooltip: (name: string) => __t(
            "pages.settings.font.option_tooltip",
            "Select font '{{$name}}'",
            { name }
        ),
        select_font_tooltip: __t(
            "pages.settings.font.tooltip",
            "Select font"
        ),
        back_tooltip: __t(
            "pages.settings.back.tooltip",
            "Back",
        ),
        select_theme_title: __t(
            "pages.settings.theme.title",
            "Theme:"
        ),
        light_theme_name: __t(
            "pages.settings.theme.light",
            "Light"
        ),
        dark_theme_name: __t(
            "pages.settings.theme.dark",
            "Dark"
        ),
        theme_option_tooltip: (name: string) => __t(
            "pages.settings.theme.option_tooltip",
            "Select theme '{{$name}}'",
            { name },
        ),
        select_theme_tooltip: __t(
            "pages.settings.theme.tooltip",
            "Select theme",
        ),
        ui_scale_title: __t(
            "pages.settings.ui_scale.title",
            "Ui Scale:",
        ),
        reset_ui_scale_tooltip: __t(
            "pages.settings.ui_scale.tooltips.reset",
            "Reset Ui scale"
        )

    }), [i18n]);

    return strings;
}