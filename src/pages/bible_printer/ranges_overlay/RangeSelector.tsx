import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { BiblePrintRange } from "@interop/printing";
import { Stack, Typography, useTheme } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useEffect, useState } from "react";
import BookDropdown from "./BookDropdown";
import BibleSelector from "../dropdowns/BibleSelector";
import ChapterDropdown from "./ChapterDropdown";
import VerseDropdown from "./VerseDropdown";

export type RangeSelectorProps = {
    on_change: (range: BiblePrintRange) => void,
}

export default function RangeSelector({
    on_change,
}: RangeSelectorProps): React.ReactElement
{
    const theme = useTheme();
    const { bible_infos } = use_bible_infos();
    const deep_copy = use_deep_copy();
    const [range, set_range] = useState<BiblePrintRange>(() => {
        const bible = Object.values(bible_infos)[0];
        return {
            bible: bible.id,
            from: {
                book: bible.books[0].osis_book,
                chapter: 1,
                verse: 1,
            },
            to: {
                book: bible.books[0].osis_book,
                chapter: 1,
                verse: bible.books[0].chapters[0],
            }
        }
    });

    useEffect(() => {
        on_change(range);
    }, [range]);

    return (
        <Stack 
            direction="row"
            gap={theme.spacing(1)}
            sx={{
                alignItems: "center"
            }}
        >
            <BibleSelector on_change={bible => {
                const copy = deep_copy(range);
                copy.bible = bible;
                set_range(copy);
            }}/>

            <BookDropdown 
                bible_id={range.bible}
                book={range.from.book}
                on_change={b => {
                    const copy = deep_copy(range);
                    copy.from.book = b;
                    set_range(copy)
                }}
            />

            <ChapterDropdown 
                bible_id={range.bible}
                book={range.from.book}
                chapter={range.from.chapter}
                on_change={c => {
                    const copy = deep_copy(range);
                    copy.from.chapter = c;
                    set_range(copy);
                }}
            />

            <Typography 
                variant="body1" 
                fontWeight="bold"
            >
                :
            </Typography>

            <VerseDropdown 
                bible_id={range.bible}
                book={range.from.book}
                chapter={range.from.chapter}
                verse={range.from.verse}
                on_change={v => {
                    const copy = deep_copy(range);
                    copy.from.verse = v;
                    set_range(copy);
                }}
            />

            <Typography 
                variant="body1" 
                fontWeight="bold"
            >
                -
            </Typography>

            <BookDropdown 
                bible_id={range.bible}
                book={range.to.book}
                on_change={b => {
                    const copy = deep_copy(range);
                    copy.to.book = b;
                    set_range(copy)
                }}
            />

            <ChapterDropdown 
                bible_id={range.bible}
                book={range.to.book}
                chapter={range.to.chapter}
                on_change={c => {
                    const copy = deep_copy(range);
                    copy.to.chapter = c;
                    set_range(copy);
                }}
            />

            <Typography 
                variant="body1" 
                fontWeight="bold"
            >
                :
            </Typography>

            <VerseDropdown 
                bible_id={range.bible}
                book={range.to.book}
                chapter={range.to.chapter}
                verse={range.to.verse}
                on_change={v => {
                    const copy = deep_copy(range);
                    copy.to.verse = v;
                    set_range(copy);
                }}
            />
        </Stack>
    )
}