import { WordSearchQuery } from "@interop/searching"
import { WordSearchHistoryEntry } from "@interop/view_history"
import React, { useCallback, useEffect, useState } from "react"
import * as searching from "@interop/searching";
import { RenderedVerseContent } from "@interop/bible/render";
import { Box, Stack } from "@mui/material";
import { SearchPageToolbar } from "src/pages/search_page/SearchPageToolbar";
import { LoadingSpinner } from "../LoadingSpinner";
import SearchedVerse from "./SearchedVerse";
import TopBarSpacer from "@components/TopBarSpacer";

export type SearchPageProps = {
    entry: WordSearchHistoryEntry
}

export default function SearchPage({
    entry
}: SearchPageProps): React.ReactElement
{
    const [rendered_content, set_rendered_content] = useState<RenderedVerseContent[] | string | null>(null);

    useEffect(() => {
        let is_mounted = true;
        const render_query = async () => {
            const rendered = await searching.backend_render_word_search_query({ 
                query: entry.query,
                show_strongs: false,
                page_index: 0,
                page_size: 20,
            });

            if (is_mounted)
            {
                if (rendered.type === "ok")
                {
                    set_rendered_content(rendered.verses);
                }
                else 
                {
                    set_rendered_content(rendered.error)
                }

                console.log(rendered);
            }
        }

        render_query();

        return () => {
            is_mounted = false;
        }
    }, [entry])

    let content = <LoadingSpinner/>

    if (typeof(rendered_content) === "string")
    {
        content = <Box>{rendered_content}</Box>
    }
    else if (rendered_content !== null)
    {
        content = (
            <Stack>
                {rendered_content.map((c, i) => (
                    <SearchedVerse
                        key={i}
                        render_data={c}
                        on_strongs_clicked={() => {}}
                        on_verse_clicked={() => {}}
                        on_verse_word_clicked={() => {}}
                    />
                ))}
            </Stack>
        )
    }


    return (
        <Box>
            <SearchPageToolbar entry={entry}/>
            <TopBarSpacer />
            {content}
        </Box>
    );
}