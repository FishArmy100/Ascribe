import { StrongsClickedCallback, VerseClickedCallback, VerseWordClickedCallback } from "@components/bible/BibleVerse";
import { RenderedVerseContent } from "@interop/bible/render";
import { Box, Stack } from "@mui/material";
import React from "react";
import SearchedVerse from "./SearchedVerse";

export type SearchPageContentProps = {
    verses: RenderedVerseContent[],
    
    on_strongs_clicked: StrongsClickedCallback,
    on_verse_word_clicked: VerseWordClickedCallback,
    on_display_verse_popover: VerseClickedCallback,
}

export default function SearchPageContent({
    verses,
    on_strongs_clicked,
    on_verse_word_clicked,
    on_display_verse_popover,
}: SearchPageContentProps): React.ReactElement
{
    return (
        <Box
            sx={{
                width: "%100",
                display: "flex",
                justifyContent: "center"
            }}
        >
            <Stack
                sx={{
                    width: "70%",
                }}
            >
                {verses.map((c, i) => (
                    <SearchedVerse
                        key={i}
                        render_data={c}
                        on_strongs_clicked={on_strongs_clicked}
                        on_verse_word_clicked={on_verse_word_clicked}
                        on_display_verse_popover={on_display_verse_popover}
                    />
                ))}
            </Stack>
        </Box>
    )
}