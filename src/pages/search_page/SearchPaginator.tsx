import Tooltip from "@components/core/Tooltip";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_format_verse_id, use_selected_bibles } from "@interop/bible";
import { SearchHit } from "@interop/searching"
import { WordSearchHistoryEntry } from "@interop/view_history";
import { Box, Typography, useTheme } from "@mui/material";
import React from "react"
import rfdc from "rfdc";

export type SearchPaginatorProps = {
    hits: SearchHit[],
    page_size: number,
    entry: WordSearchHistoryEntry,
}

export default function SearchPaginator({
    hits,
    page_size,
    entry,
}: SearchPaginatorProps): React.ReactElement
{
    const display_verse = use_format_verse_id();
    const bible = use_selected_bibles().bible;
    const theme = useTheme();
    const view_history = use_view_history();
    const page_index = entry.page_index;
    const deep_copy = rfdc();

    if (hits.length === 0)
    {
        return <></>
    }

    const chunks: SearchHit[][] = [[]];

    hits.forEach((h, i) => {
        if (Math.floor(i / page_size) === chunks.length)
        {
            chunks.push([]);
        }
        
        chunks[chunks.length - 1].push(h);
    });

    const chunk_ranges = chunks.map(c => ({ start: c[0].verse, end: c[c.length - 1].verse }))

    const handle_page_clicked = (i: number) => {
        const entry_copy = deep_copy(entry);
        entry_copy.page_index = i;
        view_history.push(entry_copy);
    }

    return (
        <Box
            sx={{
                boxSizing: "border-box",
                ml: 1,
                mr: 1,
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fill, minmax(${theme.spacing(22)}, 1fr))`,
                    gap: theme.spacing(1),
                    width: "100%"
                }}
            >
                {chunk_ranges.map((c, i) => {
                    const start_name = display_verse(c.start, bible.id);
                    const end_name = display_verse(c.end, bible.id);
                    const title = `${start_name}-${end_name}`;
                    return (
                        <Tooltip
                            key={i}
                            tooltip={`Select range ${title}`}
                        >
                            <Box
                                sx={{
                                    textAlign: "center",
                                    boxSizing: "border-box",
                                    borderRadius: theme.spacing(1),
                                    borderColor: theme.palette.grey[700],
                                    borderStyle: "solid",
                                    borderWidth: theme.spacing(1 / 8),
                                    padding: 0.5,
                                    cursor: "pointer",
                                    color: i === page_index ? theme.palette.common.white : theme.palette.primary.main,
                                    backgroundColor: i === page_index ? theme.palette.primary.main : undefined,
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: i == page_index ? theme.palette.primary.dark : theme.palette.action.hover,
                                    }
                                }}
                                onClick={() => handle_page_clicked(i)}
                            >
                                <Typography
                                    variant="body2"
                                >
                                    {title}
                                </Typography>
                            </Box>
                        </Tooltip>
                    )
                })}
            </Box>
        </Box>
    )
}