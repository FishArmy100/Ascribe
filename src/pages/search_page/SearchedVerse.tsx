import { StrongsClickedCallback, VerseClickedCallback, VerseWordClickedCallback } from "@components/bible/BibleVerse";
import { RenderedVerse } from "@components/bible/RenderedVerse";
import { RenderedVerseContent } from "@interop/bible/render";
import { Box } from "@mui/material";
import React from "react";

export type SearchedVerseProps = {
    render_data: RenderedVerseContent,

    on_strongs_clicked: StrongsClickedCallback,
    on_verse_word_clicked: VerseWordClickedCallback,
    on_verse_clicked: VerseClickedCallback,
}

export default function SearchedVerse({
    render_data,
    on_strongs_clicked,
    on_verse_word_clicked,
    on_verse_clicked,
}: SearchedVerseProps): React.ReactElement
{
    return (
        <Box>
            <RenderedVerse
                content={render_data}
                on_verse_word_clicked={on_verse_word_clicked}
                on_strongs_clicked={on_strongs_clicked}
            />
        </Box>
    )
}