import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { BiblePrintRange } from "@interop/printing";
import { Stack, Typography, useTheme } from "@mui/material";
import { use_deep_copy } from "@utils/index";
import React, { useEffect, useMemo, useState } from "react";
import BookDropdown from "./BookDropdown";
import BibleSelector from "../dropdowns/BibleSelector";
import ChapterDropdown from "./ChapterDropdown";
import VerseDropdown from "./VerseDropdown";
import OptionGroup from "@components/core/OptionGroup";
import { compare_verse_ids, use_format_verse_id } from "@interop/bible";
import Label from "@components/core/Label";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { ImageButton } from "@components/index";
import * as images from "@assets";

export function use_default_bible_range(): () => BiblePrintRange
{
    const bible_id = use_bible_display_settings().bible_display_settings.bible_version;
    const { bible_infos } = use_bible_infos();
    const bible = bible_infos[bible_id];

    return () => ({
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
    })
}

export type RangeSelectorProps = {
    range: BiblePrintRange,
    on_change: (range: BiblePrintRange) => void,
    on_delete: () => void,
    can_delete: boolean,
}

export default function RangeSelector({
    range,
    on_change,
    on_delete,
    can_delete,
}: RangeSelectorProps): React.ReactElement
{
    const theme = useTheme();
    const i18n = use_app_i18n();
    const { bible_infos, get_book_display_name } = use_bible_infos();
    const deep_copy = use_deep_copy();
    const format_verse_id = use_format_verse_id();

    const strings = useMemo(() => ({
        from: __t("pages.bible_printer.labels.range_from", "From"),
        to: __t("pages.bible_printer.labels.range_from", "To"),
        delete: __t("pages.bible_printer.tooltips.delete_range", "Delete this range"),
    }), [i18n])

    const title = useMemo(() => {
        const bible_display_name = bible_infos[range.bible].display_name;

        if (range.from.book === range.to.book && range.from.chapter == range.to.chapter)
        {
            const verse_count = bible_infos[range.bible].books
                .find(b => b.osis_book === range.from.book)
                ?.chapters[range.from.chapter - 1];

            if (verse_count !== undefined && range.from.verse === 1 && range.to.verse === verse_count)
            {
                return `${bible_display_name} ${get_book_display_name(range.bible, range.from.book)} ${range.from.chapter}`
            }
        }

        const from = format_verse_id(range.from, range.bible, {
            hide_bible: true
        });
        const to = format_verse_id(range.to, range.bible, {
            hide_bible: true,
        }); 
        return `(${bible_display_name}) ${from} - ${to}`;
    }, [format_verse_id, range, bible_infos]);

    useEffect(() => {
        const cmp = compare_verse_ids(range.from, range.to, bible_infos[range.bible]);
        if (cmp === 1)
        {
            console.log("Got here", range)
            const copy = deep_copy(range);
            copy.to = deep_copy(range.from);
            on_change(copy);
        }

        console.log(range)
    }, [range])

    return (
        <OptionGroup label={title}>
            <Stack
                direction="column"
                gap={theme.spacing(1)}
            >
                <Stack 
                    justifyContent="space-between"
                    direction="row"
                >
                    <BibleSelector
                        bible_id={range.bible}
                        on_change={bible => {
                            const copy = deep_copy(range);
                            copy.bible = bible;
                            on_change(copy);
                        }}
                    />
                    <ImageButton 
                        image={images.trash_can}
                        tooltip={strings.delete}
                        on_click={on_delete}
                        disabled={!can_delete}
                    />
                </Stack>
                <Label 
                    label={strings.from}
                    label_props={{
                        variant: "body1",
                        bold: true,
                        sx: { 
                            minWidth: theme.spacing(9),
                        }
                    }}
                >
                    <Stack 
                        direction="row"
                        gap={theme.spacing(1)}
                        sx={{
                            alignItems: "center"
                        }}
                    >
                        <BookDropdown
                            bible_id={range.bible}
                            book={range.from.book}
                            on_change={b => {
                                const copy = deep_copy(range);
                                copy.from.book = b;
                                on_change(copy)
                            }}
                        />
                        <ChapterDropdown
                            bible_id={range.bible}
                            book={range.from.book}
                            chapter={range.from.chapter}
                            on_change={c => {
                                const copy = deep_copy(range);
                                copy.from.chapter = c;
                                on_change(copy);
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
                                on_change(copy);
                            }}
                        />
                    </Stack>
                </Label>
                
                <Label 
                    label={strings.to}
                    label_props={{
                        variant: "body1",
                        bold: true,
                        sx: { 
                            minWidth: theme.spacing(9),
                        }
                    }}
                >
                    <Stack
                        direction="row"
                        gap={theme.spacing(1)}
                        sx={{
                            alignItems: "center"
                        }}
                    >
                        <BookDropdown
                            bible_id={range.bible}
                            book={range.to.book}
                            on_change={b => {
                                const copy = deep_copy(range);
                                copy.to.book = b;
                                on_change(copy)
                            }}
                        />
                        <ChapterDropdown
                            bible_id={range.bible}
                            book={range.to.book}
                            chapter={range.to.chapter}
                            on_change={c => {
                                const copy = deep_copy(range);
                                copy.to.chapter = c;
                                on_change(copy);
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
                                on_change(copy);
                            }}
                        />
                    </Stack>
                </Label>
            </Stack>
        </OptionGroup>
    )
}