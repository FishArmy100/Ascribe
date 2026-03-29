import { ModuleWordSearchEntry } from "@interop/view_history";
import React, { useCallback, useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Tooltip from "@components/core/Tooltip";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_deep_copy } from "@utils/index";
import { MODULE_WORD_SEARCH_PAGE_SIZE } from "./ModuleWordSearchPage";
import use_module_pages_strings from "../module_pages_strings";

export type ModuleWordSearchPaginatorProps = {
    entry: ModuleWordSearchEntry,
    result_total_count: number
}

export default function ModuleWordSearchPaginator({
    entry,
    result_total_count
}: ModuleWordSearchPaginatorProps): React.ReactElement
{
    const deep_copy  = use_deep_copy();
    const view_history = use_view_history();
    const theme = useTheme();
    const strings = use_module_pages_strings();

    const pages = useMemo(() => {
        const count = Math.floor(result_total_count / MODULE_WORD_SEARCH_PAGE_SIZE);
        const remainder = result_total_count % MODULE_WORD_SEARCH_PAGE_SIZE;

        const pages: { start: number, end: number }[] = [];
        for (let i = 0; i < count; i++)
        {
            pages.push({
                start: i * MODULE_WORD_SEARCH_PAGE_SIZE + 1,
                end: (i + 1) * MODULE_WORD_SEARCH_PAGE_SIZE
            })
        }

        if (remainder !== 0)
        {
            pages.push({
                start: count * MODULE_WORD_SEARCH_PAGE_SIZE + 1,
                end: count * MODULE_WORD_SEARCH_PAGE_SIZE + remainder,
            })
        }
        
        return pages;
    }, [result_total_count]);

    const handle_page_clicked = useCallback((page: number) => {
        const copy = deep_copy(entry);
        copy.page_index = page;
        view_history.push(copy)
    }, [view_history, entry]);

    if (pages.length === 1) return <></>

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
                {pages.map((p, i) => {
                    const title = `${p.start}-${p.end}`;
                    return (
                        <Tooltip
                            key={i}
                            tooltip={strings.select_range_tooltip(title)}
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
                                    color: i === entry.page_index ? theme.palette.common.white : theme.palette.primary.main,
                                    backgroundColor: i === entry.page_index ? theme.palette.primary.main : undefined,
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: i == entry.page_index ? theme.palette.primary.dark : theme.palette.action.hover,
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