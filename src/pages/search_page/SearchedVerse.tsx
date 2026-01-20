import { StrongsClickedCallback, VerseClickedCallback, VerseWordClickedCallback } from "@components/bible/BibleVerse";
import { RenderedVerse } from "@components/bible/RenderedVerse";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { RenderedVerseContent } from "@interop/bible/render";
import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import React, { useCallback } from "react";

export type SearchedVerseProps = {
    render_data: RenderedVerseContent,

    on_strongs_clicked: StrongsClickedCallback,
    on_verse_word_clicked: VerseWordClickedCallback,
}

export default function SearchedVerse({
    render_data,
    on_strongs_clicked,
    on_verse_word_clicked,
}: SearchedVerseProps): React.ReactElement
{
    const theme = useTheme();
    const verse = render_data.id;
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_display_settings: bible_version_state } = use_bible_display_settings();
    const view_history = use_view_history();

    const book_name = get_book_display_name(render_data.bible, verse.book);
    let verse_title = `${book_name} ${verse.chapter}:${verse.verse}`;

    if (render_data.bible != bible_version_state.bible_version)
    {
        const bible_name = get_bible_display_name(render_data.bible);
        verse_title += ` (${bible_name})`;
    }

    const on_verse_clicked = useCallback(() => {
        view_history.push({
            type: "verse",
            chapter: { book: verse.book, chapter: verse.chapter },
            start: verse.verse,
            end: null,
        })
    }, [view_history]);

    return (
        <Box>
            <Paper
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: theme.spacing(1),
                    padding: theme.spacing(2),
                    mt: theme.spacing(2)
                }}
            >
                <RenderedVerse
                    content={render_data}
                    on_verse_word_clicked={on_verse_word_clicked}
                    on_strongs_clicked={on_strongs_clicked}
                />
                <Divider orientation="horizontal"/>
                <Box>
                    <Box 
                        sx={{
                            mt: 1,
                            fontWeight: "bold",
                            padding: 1,
                            borderRadius: theme.spacing(1),
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                            width: "fit-content",
                            "&:hover": {
                                backgroundColor: theme.palette.action.hover,
                            }
                        }}
                        onClick={on_verse_clicked}
                    >
                        {verse_title}
                    </Box>
                </Box>
            </Paper>
        </Box>
    )
}