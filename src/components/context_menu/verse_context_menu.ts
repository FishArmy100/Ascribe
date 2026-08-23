import { use_app_i18n } from "@components/providers/LanguageProvider";
import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_format_verse_id, VerseId } from "@interop/bible";
import { useCallback, useMemo } from "react";
import { ContextMenuOption } from "./ContextMenu";
import __t from "@fisharmy100/react-auto-i18n";
import * as images from "@assets";
import { backend_fetch_verse_render_data } from "@interop/bible/render";


export function use_verse_context_menu_options(verse: VerseId, bible: string, on_inspect: (verse: VerseId, e: React.MouseEvent) => void): ContextMenuOption[]
{
    const { set_ranges } = use_bible_print_ranges();
    const view_history = use_view_history();

    const i18n = use_app_i18n();
    const format_verse = use_format_verse_id();
    const strings = useMemo(() => ({
        print_verse_label:  __t(
            "context_menu.labels.print_verse",
            "Print Verse",
        ),
        print_verse_tooltip: (verse: VerseId, bible: string) => __t(
            "context_menu.tooltips.print_verse",
            "Print Verse \"{{$verse}}\"",
            { verse: format_verse(verse, bible) }
        ),
        inspect_verse_label: __t(
            "context_menu.labels.inspect_verse",
            "Inspect Verse"
        ),
        inspect_verse_tooltip: (verse: VerseId, bible: string) => __t(
            "context_menu.tooltips.inspect_verse",
            "Open popover for \"{{$verse}}\"",
            { verse: format_verse(verse, bible) }
        ),
        copy_verse_label: __t(
            "context_menu.labels.copy_verse",
            "Copy Verse"
        ),
        copy_verse_tooltip: (verse: VerseId, bible: string) => __t(
            "context_menu.tooltips.copy_verse",
            "Copy \"{{$verse}}\"",
            { verse: format_verse(verse, bible) }
        ),
    }), [format_verse, i18n]);

    const copy_verse = useCallback(async () => {
        const rd = await backend_fetch_verse_render_data([verse], bible, []);
        const text = rd[0].words.map(w => (w.begin_punc ?? "") + w.word + (w.end_punc ?? "")).join(" ");
        navigator.clipboard.writeText(text);
    }, [verse, bible])

    return useMemo((): ContextMenuOption[] => {
        return [
            {
                label: strings.inspect_verse_label,
                tooltip: strings.inspect_verse_tooltip(verse, bible),
                image: images.microscope,
                on_click: e => {
                    on_inspect(verse, e);
                },
                play_click_sfx: false,
            },
            {
                label: strings.copy_verse_label,
                tooltip: strings.copy_verse_tooltip(verse, bible),
                image: images.copy,
                on_click: copy_verse
            },
            {
                label: strings.print_verse_label,
                tooltip: strings.print_verse_tooltip(verse, bible),
                image: images.printer,
                on_click: async () => {
                    await set_ranges([{
                        bible,
                        from: verse,
                        to: verse,
                    }]);

                    view_history.push({
                        type: "bible_printer",
                    })
                },
            }
        ]
    }, [verse, bible, view_history, strings]);
}