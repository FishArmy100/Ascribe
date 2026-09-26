import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import { ContextMenuOption } from "./ContextMenu";
import { useMemo } from "react";
import { ChapterId, use_format_chapter_id } from "@interop/bible";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import * as images from "@assets";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_app_i18n } from "@components/providers/LanguageProvider";


export function use_chapter_context_menu_options(chapter: ChapterId, bible: string, on_inspect: (chapter: ChapterId, e: React.MouseEvent) => void): ContextMenuOption[]
{
    const { set_ranges } = use_bible_print_ranges();
    const view_history = use_view_history();
    const { bible_infos } = use_bible_infos();
    const verse_count = bible_infos[bible].books
        .find(b => b.osis_book === chapter.book)
        ?.chapters[chapter.chapter - 1];

        
    const i18n = use_app_i18n();
    const format_chapter = use_format_chapter_id();
    const strings = useMemo(() => ({
        print_chapter_label:  __t(
            "context_menu.labels.print_chapter",
            "Print Chapter",
        ),
        print_chapter_tooltip: (chapter: ChapterId, bible: string) => __t(
            "context_menu.tooltips.print_chapter",
            "Print chapter {{$chapter}}",
            { chapter: format_chapter(chapter, bible) }
        ),
        inspect_chapter_label: __t(
            "context_menu.labels.inspect_chapter",
            "Inspect Chapter"
        ),
        inspect_chapter_tooltip: (chapter: ChapterId, bible: string) => __t(
            "context_menu.tooltips.inspect_chapter",
            "Open popover for \"{{$chapter}}\"",
            { chapter: format_chapter(chapter, bible) }
        ),
    }), [format_chapter, i18n]);

    return useMemo((): ContextMenuOption[] => {
        return [
            {
                label: strings.inspect_chapter_label,
                tooltip: strings.inspect_chapter_tooltip(chapter, bible),
                image: images.microscope,
                on_click: e => {
                    on_inspect(chapter, e);
                },
                play_click_sfx: false,
            },
            {
                label: strings.print_chapter_label,
                tooltip: strings.print_chapter_tooltip(chapter, bible),
                image: images.printer,
                on_click: async () => {
                    await set_ranges([{
                        bible,
                        from: {
                            ...chapter,
                            verse: 1
                        },
                        to: {
                            ...chapter,
                            verse: verse_count ?? 1,
                        },
                    }]);

                    view_history.push({
                        type: "bible_printer",
                    })
                }
            }
        ]
    }, [chapter, bible, view_history, strings]);
}