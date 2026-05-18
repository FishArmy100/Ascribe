import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import { ContextMenuOption } from "./ContextMenu";
import { useMemo } from "react";
import { VerseId } from "@interop/bible";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_context_menu_strings } from "./context_menu_strings";
import * as images from "@assets";


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