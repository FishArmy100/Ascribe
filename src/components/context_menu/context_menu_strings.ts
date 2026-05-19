import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { ChapterId, use_format_chapter_id, use_format_verse_id, VerseId } from "@interop/bible";
import { useMemo } from "react";

export function use_context_menu_strings()
{
    const format_verse = use_format_verse_id();
    const format_chapter = use_format_chapter_id();
    
    return useMemo(() => ({
        print_verse_label:  __t(
            "context_menu.labels.print_verse",
            "Print Verse",
        ),
        print_verse_tooltip: (verse: VerseId, bible: string) => __t(
            "context_menu.tooltips.print_verse",
            "Print Verse {{$verse}}",
            { verse: format_verse(verse, bible) }
        ),
        print_chapter_label:  __t(
            "context_menu.labels.print_chapter",
            "Print Chapter",
        ),
        print_chapter_tooltip: (chapter: ChapterId, bible: string) => __t(
            "context_menu.tooltips.print_chapter",
            "Print chapter {{$chapter}}",
            { chapter: format_chapter(chapter, bible) }
        ),
    }), [format_verse]);
}