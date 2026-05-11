import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { use_bible_infos } from "@components/providers/BibleInfoProvider"
import { use_app_i18n } from "@components/providers/LanguageProvider"
import __t from "@fisharmy100/react-auto-i18n"
import { OsisBook } from "@interop/bible"
import React, { useCallback, useMemo } from "react"

export type VerseDropdownProps = {
    bible_id: string,
    book: OsisBook,
    chapter: number,
    verse: number,
    on_change: (verse: number) => void,
}

export default function VerseDropdown({
    bible_id,
    book,
    chapter,
    verse,
    on_change,
}: VerseDropdownProps): React.ReactElement
{
    const i18n = use_app_i18n();
    const { bible_infos, get_book_display_name } = use_bible_infos();
    const bible_info = bible_infos[bible_id];
    const book_info = bible_info.books.find(b => b.osis_book === book)!;
    const verse_count = book_info.chapters[chapter - 1];

    const option_tooltip = useCallback((verse: number) => {
        return __t(
            "pages.bible_printer.tooltips.verse_select_option",
            "Select verse {{$verse}}",
            {verse}
        )
    }, [i18n, get_book_display_name, bible_id]);

    const options = useMemo(() => Array.from(
        { length: verse_count }, 
        (_, i) => i + 1).map((i): TextSelectDropdownOption<number> => ({
            value: i,
            text: i.toString(),
            tooltip: option_tooltip(i),
        }
    )), [option_tooltip, book_info, get_book_display_name]);

    return (
        <TextSelectDropdown 
            tooltip={null}
            options={options}
            selected={verse - 1}
            on_select={on_change}
            variant="body1"
        />
    )
}