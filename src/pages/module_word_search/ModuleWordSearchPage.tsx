import { ModuleWordSearchEntry } from "@interop/view_history"
import { Box, Divider, Stack, Theme, Typography } from "@mui/material";
import React from "react";
import ModuleWordSearchToolbar from "./ModuleWordSearchToolbar";
import { ModuleEntryInfoPanel } from "../module_inspector/ModuleEntryInfoPanel";
import { ModuleEntry } from "@interop/module_entry";
import { ModuleInfoMap } from "@interop/module_info";
import { HRefSrc } from "@interop/html_text";
import { LoadingSpinner } from "../LoadingSpinner";
import { Footer } from "@components/index";
import ModuleWordSearchPaginator from "./ModuleWordSearchPageinator";

export const MODULE_WORD_SEARCH_PAGE_SIZE = 50;

export type ModuleWordSearchPageProps = {
    entry: ModuleWordSearchEntry
}

export default function ModuleWordSearchPage({
    entry
}: ModuleWordSearchPageProps): React.ReactElement
{
    return (
        <Box>
            <ModuleWordSearchToolbar />
        </Box>
    )
}

type ModuleWordSearchPageContentProps = {
    entries: ModuleEntry[] | null,
    result_total_count: number,
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
    console.log("Painting Content...");
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
                    
                    <ModuleWordSearchPaginator entry={search_entry} result_total_count={0}/>
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

    console.log("Checking should paint...");

    return prev.entries === next.entries && 
           prev.handle_ref_clicked === next.handle_ref_clicked
})