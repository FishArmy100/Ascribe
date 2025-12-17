import React from "react"
import { VerseRenderData } from "../../interop/bible/render"
import { SxProps } from "@mui/material/styles"
import { Theme } from "@mui/material/styles"
import { Box, Typography } from "@mui/material"
import BibleWord from "./BibleWord"
import { ChapterId, OsisBook, VerseId, WordId } from "../../interop/bible"
import { parse_strongs, StrongsNumber } from "../../interop/bible/strongs"


export type StrongsClickedCallback = (pos: { top: number, left: number }, strongs: StrongsNumber) => void;
export type VerseWordClickedCallback = (pos: { top: number, left: number }, bible_id: string, word: WordId) => void;
export type VerseClickedCallback = (pos: { top: number, left: number }, verse: VerseId) => void;
export type ChapterClickedCallback = (pos: { top: number, left: number }, chapter: ChapterId) => void;
export type BookClickedCallback = (pos: { top: number, left: number }, book: OsisBook) => void;

export type BibleVerseProps = {
    render_data: VerseRenderData,
    on_strongs_clicked?: StrongsClickedCallback,
    on_verse_word_clicked?: VerseWordClickedCallback,
    sx?: SxProps<Theme>,
    verse_label?: string,
    show_strongs?: boolean,
}

export default function BibleVerse({
    render_data,
    sx,
    verse_label,
    show_strongs,
    on_strongs_clicked,
    on_verse_word_clicked,
}: BibleVerseProps): React.ReactElement
{
    const handle_verse_clicked = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const pos = { top: rect.top, left: rect.left };

        if (target.dataset.wordIndex)
        {
            const word_index = parseInt(target.dataset.wordIndex, 10);
            on_verse_word_clicked?.(pos, render_data.bible, {
                verse: render_data.id,
                word: word_index,
            });
        }

        if (target.dataset.strongsNumber)
        {
            const strongs_number = parse_strongs(target.dataset.strongsNumber);
            on_strongs_clicked?.(pos, strongs_number);
        }
    }

    return (
        <Typography
            component="div"
            variant="body1"
            onClick={handle_verse_clicked}
            sx={{
                display: "flex",
                alignContent: "flex-start",
                gap: 1,
                lineHeight: 1.8,
                marginBottom: 1,
                ...sx,
            }}
        >
            {verse_label && (
                <span className="bible-verse-label">{verse_label}</span>
            )}
            <span className="bible-verse-text">
                {render_data.words.length > 0 ? (
                    render_data.words.map((w, i) => (
                        <React.Fragment key={i}>
                            <BibleWord
                                render_data={w}
                                show_strongs={show_strongs ?? false}
                            />
                        {i < render_data.words.length - 1 && " "}
                        </React.Fragment>
                    ))
                ) : (
                    <em>[Verse omitted]</em>
                )}
            </span>
        </Typography>
    );
}