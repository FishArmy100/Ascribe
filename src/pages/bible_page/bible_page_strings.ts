import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t, { __tv } from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";


export default function use_bible_page_strings()
{
    const i18n = use_app_i18n();
    const strings = useMemo(() => ({
        chapter_nav_tooltip: (dir: "left" | "right") => __tv(
            "pages.bible.tooltips.chapter_nav",
            [
                ["To previous chapter", ({ dir }) => dir === "left"],
                ["To next chapter", ({ dir }) => dir === "right"],
                ""
            ],
            { dir }
        ),
        nav_back_tooltip: __t(
            "pages.bible.tooltips.nav_back",
            "To previous page",
        ),
        nav_forward_tooltip: __t(
            "pages.bible.tooltips.nav_forward",
            "To next page",
        ),
        play_audio_tooltip: __t(
            "pages.bible.tooltips.play_audio",
            "Play audio",
        ),
    }), [i18n]);

    return strings;
}