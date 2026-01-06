import { fetch_backend_entry_index, fetch_backend_module_pages, ModuleEntry, ModulePage } from "@interop/module_entry";
import { ModuleInspectorEntry } from "@interop/view_history";
import React, { useCallback, useEffect, useState } from "react";
import { MODULE_INSPECTOR_PAGE_SIZE } from "./ModuleInspectorPage";
import { Box, Typography, useTheme } from "@mui/material";
import Tooltip from "@components/core/Tooltip";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { use_deep_copy } from "@utils/index";
import { format_strongs } from "@interop/bible/strongs";
import { RefId, RefIdFormatter, use_format_ref_id } from "@interop/bible/ref_id";
import { ModuleConfigContextType, use_module_configs } from "@components/providers/ModuleConfigProvider";

export type ModuleInspectorPaginatorProps = {
    entry: ModuleInspectorEntry,
}

export default function ModuleInspectorPaginator({
    entry
}: ModuleInspectorPaginatorProps): React.ReactElement
{
    const [pages, set_pages] = useState<ModulePage[] | null>(null);
    const [page_index, set_page_index] = useState<number | null>(null);
    const view_history = use_view_history();
    const deep_copy = use_deep_copy();
    const formatter = use_format_ref_id();
    const configs = use_module_configs();
    const theme = useTheme();    

    const handle_page_clicked = useCallback((page: number) => {
        const copy = deep_copy(entry);
        copy.selector = { type: "page", index: page }
        view_history.push(copy)
    }, [view_history, entry]);

    useEffect(() => {
        let is_mounted = true;

        const fetch_pages = async () => {
            const pages = await fetch_backend_module_pages(entry.module, MODULE_INSPECTOR_PAGE_SIZE);

            if (is_mounted)
            {
                set_pages(pages)
            }
        }

        const fetch_page_index = async () => {
            let index = 0;
            if (entry.selector?.type === "page")
            {
                index = entry.selector.index;
            }
            else if (entry.selector?.type === "entry")
            {
                const entry_index = (await fetch_backend_entry_index(entry.module, entry.selector.id)) ?? 0;
                index = Math.floor(entry_index / MODULE_INSPECTOR_PAGE_SIZE)
            }

            set_page_index(index);
        }

        fetch_pages();
        fetch_page_index();

        return () => {
            is_mounted = false;
        }
    }, [entry]);

    if (!pages)
    {
        return <></>
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
                {pages.map((p, i) => {
                    const start_name = format_entry_title(p.start, formatter, configs);
                    const end_name = format_entry_title(p.end, formatter, configs);
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
        return "TODO:"
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