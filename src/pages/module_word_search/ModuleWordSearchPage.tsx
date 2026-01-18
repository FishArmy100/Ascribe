import { ModuleWordSearchEntry } from "@interop/view_history"
import { Box, Divider, Stack, Theme, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ModuleWordSearchToolbar from "./ModuleWordSearchToolbar";
import { ModuleEntryInfoPanel } from "../module_inspector/ModuleEntryInfoPanel";
import { ModuleEntry } from "@interop/module_entry";
import { HRefSrc } from "@interop/html_text";
import { LoadingSpinner } from "../LoadingSpinner";
import { Footer } from "@components/index";
import ModuleWordSearchPaginator from "./ModuleWordSearchPageinator";
import { use_handle_href_clicked_callback } from "../page_utils";
import { run_backend_module_search_query } from "@interop/searching";

export const MODULE_WORD_SEARCH_PAGE_SIZE = 50;

export type ModuleWordSearchPageProps = {
    entry: ModuleWordSearchEntry
}

export default function ModuleWordSearchPage({
    entry
}: ModuleWordSearchPageProps): React.ReactElement
{
    const theme = useTheme();

    const [entries, set_entries] = useState<ModuleEntry[] | null>(null);
    const [total_entry_count, set_total_entry_count] = useState<number | null>(null);
    
    useEffect(() => {
        let is_mounted = true;

        const fetch_entries = async () => {
            const hits = await run_backend_module_search_query(entry.query, entry.searched_modules, "title", MODULE_WORD_SEARCH_PAGE_SIZE, entry.page_index)

            if (is_mounted) 
            {
                set_entries(hits.hits.map(h => h.entry));
                set_total_entry_count(hits.total_count);
            }
        };

        fetch_entries();

        return () => {
            is_mounted = false;
        };
    }, [entry]);

    const handle_ref_clicked = use_handle_href_clicked_callback();

    return (
        <ModuleWordSearchPageContent 
            entries={entries}
            result_total_count={total_entry_count}
            handle_ref_clicked={handle_ref_clicked}
            theme={theme}
            search_entry={entry}
        />
    )
}

type ModuleWordSearchPageContentProps = {
    entries: ModuleEntry[] | null,
    result_total_count: number | null,
    handle_ref_clicked: (href: HRefSrc) => void,
    theme: Theme,
    search_entry: ModuleWordSearchEntry,
}

const ModuleWordSearchPageContent = React.memo(function ModuleInspectorPageContent({
    entries,
    result_total_count,
    handle_ref_clicked,
    theme,
    search_entry,
}: ModuleWordSearchPageContentProps): React.ReactElement
{
    return (
        <Box>
            <ModuleWordSearchToolbar />
            {entries ? ( 
                <Stack
                    gap={2}
                    sx={{
                        mt: 7,
                        ml: 2,
                        mr: 2,
                        mb: `calc(100vh - (${theme.spacing(14)}))`,
                    }}
                >
                    <Typography 
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        sx={{
                            mt: 2,
                            mb: 2,
                        }}
                    >
                        {search_entry.raw}
                    </Typography>
                    <Divider />
                    {entries.map((e, i) => (
                        <ModuleEntryInfoPanel 
                            entry={e}
                            on_href_clicked={handle_ref_clicked}
                            key={i}
                        />
                    ))}
                    
                    <ModuleWordSearchPaginator entry={search_entry} result_total_count={result_total_count ?? 0}/>
                </Stack>
            ) : (
                <LoadingSpinner />
            )}
            
            <Footer />
        </Box>
    )
}, (prev, next) => {
    // The inspector entry is change, and the entries are changed. 
    // We do not need to include the inspector_entry in this check, as that is not the primary thing being rendered, 
    // and triggers too many re-renders

    return prev.entries === next.entries && 
           prev.handle_ref_clicked === next.handle_ref_clicked
})