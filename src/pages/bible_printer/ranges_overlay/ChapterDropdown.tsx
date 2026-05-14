import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { use_bible_infos } from "@components/providers/BibleInfoProvider"
import { use_app_i18n } from "@components/providers/LanguageProvider"
import __t from "@fisharmy100/react-auto-i18n"
import { OsisBook } from "@interop/bible"
import React, { useEffect, useMemo } from "react"

export type ChapterDropdownProps = {
    bible_id: string,
    book: OsisBook,
    chapter: number,
    on_change: (chapter: number) => void,
}

export default function ChapterDropdown({
    bible_id,
    book,
    chapter,
    on_change,
}: ChapterDropdownProps): React.ReactElement
{
    const i18n = use_app_i18n();
    const { bible_infos, get_book_display_name } = use_bible_infos();
    const bible_info = bible_infos[bible_id];
    const book_info = bible_info.books.find(b => b.osis_book === book)!;
    
    const options = useMemo(() => book_info.chapters.map((_, i): TextSelectDropdownOption<number> => ({
        value: i + 1,
        text: (i + 1).toString(),
        tooltip: null,
    })), [book_info, get_book_display_name, bible_id, book, chapter]);

    useEffect(() => {
        if (chapter > options.length)
        {
            on_change(1);
        }
    })

    return (
        <TextSelectDropdown 
            tooltip={null}
            options={options}
            selected={chapter > options.length ? 0 : chapter - 1}
            on_select={on_change}
            variant="body1"
        />
    )
}