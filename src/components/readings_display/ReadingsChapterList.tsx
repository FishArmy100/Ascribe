import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { BibleInfo, ChapterId, OsisBook } from "@interop/bible";
import { Atom, RefId, RefIdInner } from "@interop/bible/ref_id";
import { Stack, Typography } from "@mui/material";
import React, { useCallback } from "react";
import * as utils from "@utils";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { ViewHistoryEntry } from "@interop/view_history";

export type ReadingsChapterListProps = {
    bible_id: string,
    readings: RefId[],
}

export default function ReadingsChapterList({
    bible_id,
    readings,
}: ReadingsChapterListProps): React.ReactElement
{
    const { bible_infos, get_book_display_name } = use_bible_infos();

    const format_book = useCallback((book: OsisBook) => {
        return get_book_display_name(bible_id, book);
    }, [get_book_display_name, bible_id]);

    const { push: push_view_history_entry } = use_view_history()

    return (
        <Stack>
            {readings.map(r => get_reading_chapters(r.id, bible_infos[bible_id])).flatMap(cs => cs).map((r, i) => {
                const text = format_readings_chapter(r, format_book);
                const on_click = () => {
                    go_to_readings_chapter(r, push_view_history_entry);
                }
                return (
                    <Typography
                        key={i}
                        fontWeight="bold"
                        component="span"
                        className="animated-underline"
                        onClick={on_click}
                        sx={{
                            width: "fit-content",
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                    >
                        {text}
                    </Typography>
                )
            })}
        </Stack>
    )
}

type ReadingsChapter = |{
    type: "chapter",
    chapter: ChapterId,
} |{
    type: "verse",
    chapter: ChapterId,
    start: number,
    end: number,
}

function go_to_readings_chapter(chapter: ReadingsChapter, push_view_history_entry: (entry: ViewHistoryEntry) => void)
{
    if (chapter.type === "chapter")
    {
        push_view_history_entry({
            type: "chapter",
            chapter: chapter.chapter
        })
    }
    else 
    {
        push_view_history_entry({
            type: "verse",
            chapter: chapter.chapter,
            start: chapter.start,
            end: chapter.end,
        })
    }
}

function format_readings_chapter(range: ReadingsChapter, book_formatter: (book: OsisBook) => string): string 
{
    if (range.type === "chapter")
    {
        return `${book_formatter(range.chapter.book)} ${range.chapter.chapter}`;
    }
    else 
    {
        if (range.start === range.end)
        {
            return `${book_formatter(range.chapter.book)} ${range.chapter.chapter}:${range.start}`
        }
        else 
        {
            return `${book_formatter(range.chapter.book)} ${range.chapter.chapter}:${range.start}-${range.end}`;
        }
    }
}

function get_reading_chapters(id: RefIdInner, bible_info: BibleInfo): ReadingsChapter[]
{
    if (id.type === "range")
    {
        return get_chapters_between_atoms(id.from, id.to, bible_info);
    }
    else 
    {
        return get_chapters_in_atom(id.atom, bible_info);
    }
}

function get_chapters_in_atom(atom: Atom, bible_info: BibleInfo): ReadingsChapter[]
{
    if (atom.type === "book")
    {
        const readings = bible_info.books.find(b => b.osis_book === atom.book)?.chapters.map((_, i): ReadingsChapter => ({
            type: "chapter",
            chapter: { book: atom.book, chapter: i + 1 }
        }));
        
        return readings ?? [];
    }
    else if (atom.type === "chapter")
    {
        return [{
            type: "chapter",
            chapter: { book: atom.book, chapter: atom.chapter }
        }]
    }
    else
    {
        return [{
            type: "verse",
            chapter: { book: atom.book, chapter: atom.chapter },
            start: atom.verse,
            end: atom.verse,
        }]
    }
}

function get_chapters_between_atoms(start: Atom, end: Atom, bible_info: BibleInfo): ReadingsChapter[]
{
    const start_book = start.book;
    const start_chapter = "chapter" in start ? start.chapter : 1;
    const start_verse = "verse" in start ? start.verse : null;

    const end_book = end.book;
    const end_chapter = "chapter" in end ? end.chapter : 1;
    const end_verse = "verse" in end ? end.verse : null;

    if (start_book === end_book)
    {
        if ((start_verse !== null || end_verse !== null) && start_chapter === end_chapter)
        {
            const csv = start_verse ? start_verse : 1;
            const cev = end_verse ? end_verse : bible_info.books.find(b => b.osis_book === start.book)?.chapters[start_chapter - 1];

            // bible does not contain the verses, chapters, or books specified in the end verse
            if (cev === undefined)
            {
                return []
            }

            return [{
                type: "verse",
                chapter: { book: start_book, chapter: start_chapter },
                start: csv,
                end: cev
            }]
        }

        const chapters = utils.range_inclusive_array(start_chapter, end_chapter).map((c): ReadingsChapter => ({
            type: "chapter",
            chapter: { book: start_book, chapter: c }
        }));

        if (start_verse !== null)
        {
            const end = bible_info.books.find(b => b.osis_book === start_book)?.chapters[start_chapter];
            if (end === undefined)
                return [];

            chapters[0] = {
                type: "verse",
                chapter: chapters[0].chapter,
                start: start_verse,
                end: end,
            }
        }

        if (end_verse !== null)
        {
            chapters[chapters.length - 1] = {
                type: 'verse',
                chapter: chapters[chapters.length - 1].chapter,
                start: 1,
                end: end_verse
            }
        }

        return chapters;
    }
    else 
    {
        const start_chapter_start: Atom = start_verse !== null ? {
            type: "verse",
            book: start_book,
            chapter: start_chapter,
            verse: start_verse
        } : {
            type: "chapter",
            book: start_book,
            chapter: start_chapter,
        }

        const start_book_chapters = bible_info.books.find(b => b.osis_book === start_book)?.chapters;
        if (start_book_chapters === undefined)
            return [];

        const start_chapter_end: Atom = {
            type: "chapter",
            book: start_book,
            chapter: start_book_chapters.length
        }

        const readings: ReadingsChapter[] = [];
        readings.push(...get_chapters_between_atoms(start_chapter_start, start_chapter_end, bible_info))

        const end_chapter_start: Atom = {
            type: "chapter",
            book: end_book,
            chapter: 1
        }

        const end_chapter_end: Atom = end_verse !== null ? {
            type: "verse",
            book: end_book,
            chapter: end_chapter,
            verse: end_verse
        } : {
            type: "chapter",
            book: end_book,
            chapter: end_chapter,
        }

        readings.push(...get_chapters_between_atoms(end_chapter_start, end_chapter_end, bible_info));
        return readings;
    }
}