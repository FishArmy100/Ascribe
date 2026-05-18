import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_format_verse_id, VerseId } from "@interop/bible";
import { useMemo } from "react";

export function use_context_menu_strings()
{
    const format_verse = use_format_verse_id();
    
    return useMemo(() => ({
        print_verse_label:  __t(
            "context_menu.labels.print_verse",
            "Print verse",
        ),
        print_verse_tooltip: (verse: VerseId, bible: string) => __t(
            "context_menu.tooltips.print_verse",
            "Print verse {{$verse}}",
            { verse: format_verse(verse, bible) }
        ),
    }), [format_verse]);
}