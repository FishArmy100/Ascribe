import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export function use_bible_printer_strings()
{
    const i18n = use_app_i18n();
    const object = useMemo(() => ({
        back_tooltip: __t(
            "pages.bible_printer.tooltips.back",
            "Back",
        ),
        download_tooltip: __t(
            "pages.bible_printer.tooltips.download",
            "Download as Pdf",
        ),
        print_tooltip: __t(
            "pages.bible_printer.tooltips.print",
            "Print Pdf",
        ),
        settings_tooltip: __t(
            "pages.bible_printer.tooltips.settings",
            "Open Pdf Settings",
        ),
    }), [i18n]);

    return object;
}