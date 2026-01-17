import { fetch_backend_entry_index, fetch_backend_module_pages, ModuleEntry, ModulePage } from "@interop/module_entry";
import { ModuleInspectorEntry, ModuleWordSearchEntry } from "@interop/view_history";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Tooltip from "@components/core/Tooltip";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_deep_copy } from "@utils/index";
import { format_strongs } from "@interop/bible/strongs";
import { RefId, RefIdFormatter, use_format_ref_id } from "@interop/bible/ref_id";
import { ModuleConfigContextType, use_module_configs } from "@components/providers/ModuleConfigProvider";
import { MODULE_WORD_SEARCH_PAGE_SIZE } from "./ModuleWordSearchPage";

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

function format_entry_title(entry: ModuleEntry, formatter: RefIdFormatter, configs: ModuleConfigContextType): string 
{
    if (entry.type === "commentary")
    {
        return formatter(entry.references[0], configs.commentary_configs[entry.module].bible ?? null)
    }
    else if (entry.type === "dictionary")
    {
        return entry.term;
    }
    else if (entry.type === "notebook_highlight")
    {
        return entry.name;
    }
    else if (entry.type === "notebook_note")
    {
        return formatter(entry.references[0], configs.notebook_configs[entry.module].bible ?? null)
    }
    else if (entry.type === "readings")
    {
        return (entry.index + 1).toString()
    }
    else if (entry.type === "strongs_def")
    {
        return format_strongs(entry.strongs_ref);
    }
    else if (entry.type === "xref_directed")
    {
        return formatter(entry.source, configs.xref_configs[entry.module].bible ?? null)
    }
    else if (entry.type === "xref_mutual")
    {
        return formatter(entry.refs[0].id, configs.xref_configs[entry.module].bible ?? null)
    }
    else if (entry.type === "verse")
    {
        const verse_ref_id: RefId = {
            bible: null,
            id: {
                type: "single",
                atom: {
                    type: "verse",
                    book: entry.verse_id.book,
                    chapter: entry.verse_id.chapter,
                    verse: entry.verse_id.verse,
                }
            }
        }

        return formatter(verse_ref_id, configs.bible_configs[entry.module].id);
    }
    else 
    {
        console.error("Invalid entry type");
        return ""
    }
}