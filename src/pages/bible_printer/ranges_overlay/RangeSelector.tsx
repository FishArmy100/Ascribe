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
import { use_format_verse_id } from "@interop/bible";
import Label from "@components/core/Label";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";

export function use_default_bible_range(): BiblePrintRange
{
    const bible_id = use_bible_display_settings().bible_display_settings.bible_version;
    const { bible_infos } = use_bible_infos();
    const bible = bible_infos[bible_id];

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
}

export type RangeSelectorProps = {
    on_change: (range: BiblePrintRange) => void,
}

export default function RangeSelector({
    on_change,
}: RangeSelectorProps): React.ReactElement
{
    const theme = useTheme();
    const i18n = use_app_i18n();
    const { bible_infos } = use_bible_infos();
    const deep_copy = use_deep_copy();
    const format_verse_id = use_format_verse_id();
    const [range, set_range] = useState<BiblePrintRange>(() => {
        const bible = Object.values(bible_infos)
            .sort((a, b) => a.display_name.localeCompare(b.display_name))[0];

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

    const strings = useMemo(() => ({
        from: __t("pages.bible_printer.labels.range_from", "From"),
        to: __t("pages.bible_printer.labels.range_from", "To"),
    }), [i18n])

    const title = useMemo(() => {
        const from = format_verse_id(range.from, range.bible, {
            hide_bible: true
        });
        const to = format_verse_id(range.to, range.bible, {
            hide_bible: true,
        });
        const bible = bible_infos[range.bible].display_name; 
        return `(${bible}) ${from} - ${to}`;
    }, [format_verse_id, range, bible_infos]);

    useEffect(() => {
        on_change(range);
    }, [range]);

    return (
        <OptionGroup label={title}>
            <Stack
                direction="column"
                gap={theme.spacing(1)}
            >
                <BibleSelector 
                    bible_id={range.bible}
                    on_change={bible => {
                        const copy = deep_copy(range);
                        copy.bible = bible;
                        set_range(copy);
                    }}
                />
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
                </Label>
            </Stack>
        </OptionGroup>
    )
}