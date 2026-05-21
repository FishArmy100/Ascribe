import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import { ContextMenuOption } from "./ContextMenu";
import { useMemo } from "react";
import { ChapterId, VerseId } from "@interop/bible";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_context_menu_strings } from "./context_menu_strings";
import * as images from "@assets";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";


export function use_verse_context_menu_options(verse: VerseId, bible: string): ContextMenuOption[]
{
    const { set_ranges } = use_bible_print_ranges();
    const view_history = use_view_history();
    const strings = use_context_menu_strings();

    return useMemo((): ContextMenuOption[] => {
        return [
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
                }
            }
        ]
    }, [verse, bible, view_history, strings]);
}

export function use_chapter_context_menu_options(chapter: ChapterId, bible: string): ContextMenuOption[]
{
    const { set_ranges } = use_bible_print_ranges();
    const view_history = use_view_history();
    const strings = use_context_menu_strings();

    const { bible_infos } = use_bible_infos();
    const verse_count = bible_infos[bible].books
        .find(b => b.osis_book === chapter.book)
        ?.chapters[chapter.chapter - 1];

    return useMemo((): ContextMenuOption[] => {
        return [
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