import { SxProps, Typography } from "@mui/material"
import { RenderedVerseContent } from "../../interop/bible/render"
import { Theme } from "@mui/material/styles"
import React from "react"
import { parse_strongs, StrongsNumber } from "../../interop/bible/strongs";
import { WordId } from "../../interop/bible";
import { VerseClickedCallback } from "./BibleVerse";

export type StrongsClickedCallback = (pos: { top: number, left: number }, strongs: StrongsNumber) => void;
export type VerseWordClickedCallback = (pos: { top: number, left: number }, word: WordId) => void;


export type RenderedVerseProps = {
    content: RenderedVerseContent,
    verse_label?: string,
    on_strongs_clicked?: StrongsClickedCallback,
    on_verse_word_clicked?: VerseWordClickedCallback,
    on_verse_clicked?: VerseClickedCallback,
}

function RenderedVerseBase({
    content,
    on_strongs_clicked,
    on_verse_word_clicked,
    on_verse_clicked,
    verse_label,
}: RenderedVerseProps): React.ReactElement
{
    const handle_verse_clicked = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const pos = { top: rect.top, left: rect.left };

        if (target.dataset.wordIndex)
        {
            const word_index = parseInt(target.dataset.wordIndex, 10);
            on_verse_word_clicked?.(pos, {
                verse: content.id,
                word: word_index,
            });
        }

        if (target.dataset.strongsNumber)
        {
            const strongs_number = parse_strongs(target.dataset.strongsNumber);
            on_strongs_clicked?.(pos, strongs_number);
        }

        if (target.classList.contains("bible-verse-label"))
        {
            on_verse_clicked?.(pos, content.id);
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
            }}
        >
            {verse_label && (
                <span className="bible-verse-label">{verse_label}</span>
            )}
            <span className="bible-verse-text">
                {
                    (content.word_count > 0) ? (
                        <span dangerouslySetInnerHTML={{ __html: content.html }}></span>
                    ): (
                        <em>[Verse omitted]</em>
                    )
                }
            </span>
        </Typography>
    );
}

export const RenderedVerse = React.memo(RenderedVerseBase, (prev, next) => {
    return prev.content.html === next.content.html && 
    prev.on_strongs_clicked === next.on_strongs_clicked &&
    prev.on_verse_word_clicked === next.on_verse_word_clicked &&
    prev.verse_label === next.verse_label;
})