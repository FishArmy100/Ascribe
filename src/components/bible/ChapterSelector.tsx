import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { ChapterId, OsisBook } from "@interop/bible";
import { Stack, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import ChapterPicker from "./ChapterPicker";
import WrapIf from "@components/core/WrapIf";
import OptionGroup from "@components/core/OptionGroup";

export type ChapterSelectorProps = {
    label: string | null,
    bible: string,
    chapter: ChapterId,
    on_select: (chapter: ChapterId) => void;
}

export default function ChapterSelector({
    label,
    bible,
    chapter,
    on_select,
}: ChapterSelectorProps): React.ReactElement
{
    const theme = useTheme();
    const { bible_infos } = use_bible_infos();
    const bible_info = bible_infos[bible];

    const book_options = useMemo((): TextSelectDropdownOption<OsisBook>[] => {
        return bible_info.books.map(b => ({
            value: b.osis_book,
            text: b.abbreviation,
            tooltip: null,
        }))
    }, [bible_info]);

    const selected_book_index = useMemo(() => {
        return book_options.findIndex(o => o.value === chapter.book);
    }, [chapter.book, book_options])

    const chapter_options = useMemo((): TextSelectDropdownOption<number>[] => {
        const book = bible_info.books.find(b => b.osis_book === chapter.book)!;
        return Array.from({ length: book.chapters.length }, (_, i) => i + 1).map(c => ({
            value: c,
            text: c.toString(),
            tooltip: null,
        }));
    }, [bible_info, chapter.book]);

    const selected_chapter_index = chapter.chapter - 1;

    const handle_book_picked = useCallback((book: OsisBook) => {
        on_select({
            book,
            chapter: 1,
        })
    }, [on_select]);

    const handle_chapter_picked = useCallback((ch: number) => {
        on_select({
            book: chapter.book,
            chapter: ch,
        })
    }, [chapter.book, on_select])

    return (
        <WrapIf 
            cond={label !== null}
            wrapper={OptionGroup}
            props={{ label: label! }}
        >
            <Stack
                direction="row"
                gap={theme.spacing(1)}
                alignItems="center"
            >
                <ChapterPicker on_select={on_select} />
                <TextSelectDropdown
                    on_select={handle_book_picked}
                    options={book_options}
                    tooltip={null}
                    selected={selected_book_index}
                    variant="body2"
                    option_sx={{
                        padding: theme.spacing(0.5),
                    }}
                    button_sx={{
                        padding: theme.spacing(0.5)
                    }}
                />
                <TextSelectDropdown
                    on_select={handle_chapter_picked}
                    options={chapter_options}
                    tooltip={null}
                    selected={selected_chapter_index}
                    variant="body2"
                    option_sx={{
                        padding: theme.spacing(0.5),
                    }}
                    button_sx={{
                        padding: theme.spacing(0.5)
                    }}
                />
            </Stack>
        </WrapIf>
    )
}