import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { use_bible_infos } from "@components/providers/BibleInfoProvider"
import { use_app_i18n } from "@components/providers/LanguageProvider"
import { use_module_configs } from "@components/providers/ModuleConfigProvider"
import __t from "@fisharmy100/react-auto-i18n"
import { OsisBook } from "@interop/bible"
import React, { useCallback, useMemo } from "react"

export type BookDropdownProps = {
    bible_id: string,
    book: OsisBook,
    on_change: (book: OsisBook) => void,
}

export default function BookDropdown({
    bible_id,
    book,
    on_change,
}: BookDropdownProps): React.ReactElement
{
    const i18n = use_app_i18n();
    const { bible_infos, get_book_display_name } = use_bible_infos();
    const bible_info = bible_infos[bible_id];

    const option_tooltip = useCallback((book: OsisBook) => {
        return __t(
            "pages.bible_printer.tooltips.book_select_tooltip",
            "Select {{$book}}",
            {book: get_book_display_name(bible_id, book)}
        )
    }, [i18n, get_book_display_name, bible_id]);

    const options = useMemo(() => bible_info.books.map((b): TextSelectDropdownOption<OsisBook> => ({
        value: b.osis_book,
        text: get_book_display_name(bible_id, b.osis_book),
        tooltip: option_tooltip(b.osis_book),
    })), [option_tooltip, bible_info, get_book_display_name]);

    return (
        <TextSelectDropdown 
            tooltip={null}
            options={options}
            selected={bible_info.books.findIndex(b => b.osis_book === book)}
            on_select={on_change}
            variant="body1"
        />
    )
}