import { WordSearchHistoryEntry } from "@interop/view_history"
import React, { useCallback, useEffect, useState } from "react"
import * as searching from "@interop/searching";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { SearchPageToolbar } from "src/pages/search_page/SearchPageToolbar";
import { LoadingSpinner } from "../LoadingSpinner";
import SearchPageContent from "./SearchPageContent";
import { Footer } from "@components/index";
import PopoverManager, { PopoverData } from "@components/popovers/PopoverManager";
import { BibleInfo, VerseId, WordId } from "@interop/bible";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import rfdc from "rfdc";
import { get_handle_ref_clicked_callback } from "../page_utils";
import { StrongsNumber } from "@interop/bible/strongs";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SearchPaginator from "./SearchPaginator";

const SEARCH_RESULT_DISPLAY_COUNT: number = 50;

export type SearchPageProps = {
    entry: WordSearchHistoryEntry
}

export default function SearchPage({
    entry
}: SearchPageProps): React.ReactElement
{
    const [rendered_content, set_rendered_content] = useState<searching.RenderedWordSearchResult | null>(null);
    const [popover_data, set_popover_data] = useState<PopoverData | null>(null);

    const { bible_infos, get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_display_settings, set_bible_display_settings } = use_bible_display_settings();
    const current_bible = bible_infos[bible_display_settings.bible_version];
    const view_history = use_view_history();

    useEffect(() => {
        let is_mounted = true;
        const render_query = async () => {
            const query = rfdc()(entry.query);

            if (entry.query.ranges.length === 0)
            {
                query.ranges = get_default_ranges(current_bible);
            }

            const rendered = await searching.backend_render_word_search_query({ 
                query: query,
                show_strongs: bible_display_settings.show_strongs,
                page_index: entry.page_index,
                page_size: SEARCH_RESULT_DISPLAY_COUNT,
                shown_modules: bible_display_settings.shown_modules
            });

            if (is_mounted)
            {
                set_rendered_content(rendered)
            }
        }

        render_query();

        return () => {
            is_mounted = false;
        }
    }, [entry, bible_display_settings]);

    const handle_strongs_click = useCallback((e: { top: number, left: number }, s: StrongsNumber) => {
            set_popover_data({
                type: "strongs",
                strongs_number: s,
                position: { top: e.top, left: e.left }
            })
    }, []);

    const handle_word_click = useCallback((e: { top: number, left: number }, bible_id: string, word: WordId) => {
        set_popover_data({
            bible_id,
            type: "word",
            word,
            position: e
        })
    }, []);

    let content;

    if (rendered_content === null)
    {
        content  = <LoadingSpinner/>
    }
    else if (rendered_content.hits.length > 0)
    {
        const raw = entry.raw ?? searching.pretty_print_word_search_query(
            entry.query, 
            get_book_display_name, 
            get_bible_display_name
        );

        const title = get_search_title(raw, rendered_content.hits.length)
        content = <>
            <Typography 
                variant="h5"
                textAlign="center"
                fontWeight="bold"
            >
                {title}
            </Typography>

            <Divider 
                orientation="horizontal"
                sx={{
                    mt: 1,
                    mb: 1,
                    ml: 3,
                    mr: 3,
                }}
            />

            <SearchPageContent
                verses={rendered_content.verses}
                on_strongs_clicked={handle_strongs_click}
                on_verse_word_clicked={handle_word_click}
            />
            
            {rendered_content.hits.length > SEARCH_RESULT_DISPLAY_COUNT && <>
                <Divider 
                    orientation="horizontal"
                    sx={{
                        mt: 1,
                        mb: 1,
                        ml: 3,
                        mr: 3,
                    }}
                />

                <SearchPaginator 
                    entry={entry}
                    hits={rendered_content.hits}
                    page_size={SEARCH_RESULT_DISPLAY_COUNT}
                />
            </>}
        </>
    }
    else if (rendered_content.hits.length === 0)
    {
        const raw = entry.raw ?? searching.pretty_print_word_search_query(
            entry.query, 
            get_book_display_name, 
            get_bible_display_name
        );

        const title = get_search_title(raw, rendered_content.hits.length);

        content = (
            <Box>
                <Typography 
                    variant="h5"
                    textAlign="center"
                    fontWeight="bold"
                >
                    {title}
                </Typography>
            </Box>
        )
    }

    const theme = useTheme();

    const handle_ref_clicked = get_handle_ref_clicked_callback(set_bible_display_settings, bible_display_settings, view_history, () => {
        set_popover_data(null)
    });

    const handle_popover_close = useCallback(() => {
        set_popover_data(null)
    }, []);

    return (
        <Box>
            <SearchPageToolbar entry={entry}/>
            <Box
                sx={{
                    mb: `calc(100vh - (${theme.spacing(14)}))`,
                    mt: theme.spacing(7),
                }}
            >
                {content}
            </Box>
            <Footer />
            <PopoverManager 
                data={popover_data}
                on_ref_clicked={handle_ref_clicked}
                on_close={handle_popover_close}
            />
        </Box>
    );
}

function get_search_title(raw: string, search_count: number): string
{
    if (search_count === 0)
    {
        return `No search results were found for: ${raw}`;
    }
    else if (search_count === 1)
    {
        return `Found a result for: ${raw}`;
    }
    else 
    {
        return `Found ${search_count} results for: ${raw}`;
    }
}

function get_default_ranges(bible: BibleInfo): searching.WordSearchRange[]
{
    const start: VerseId = { book: bible.books[0].osis_book, chapter: 1, verse: 1 };
    const last_book = bible.books[bible.books.length - 1];
    const end: VerseId = { 
        book: last_book.osis_book, 
        chapter: last_book.chapters.length, 
        verse: last_book.chapters[last_book.chapters.length - 1] 
    };

    return [{
        bible: bible.id,
        start,
        end
    }]
}