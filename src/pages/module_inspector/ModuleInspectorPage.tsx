import { ModuleInspectorEntry } from "@interop/view_history"
import { Box, Divider, Stack, Theme, Typography, useTheme } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ModuleInspectorPageToolbar from "./ModuleInspectorToolbar"
import { use_module_infos } from "@components/providers/ModuleInfoProvider"
import { fetch_backend_entry_index, fetch_backend_module_entries, ModuleEntry } from "@interop/module_entry"
import { LoadingSpinner } from "../LoadingSpinner"
import { ModuleEntryInfoPanel } from "./ModuleEntryInfoPanel"
import { get_handle_ref_clicked_callback } from "../page_utils"
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider"
import { use_view_history } from "@components/providers/ViewHistoryProvider"
import ModuleInspectorPaginator from "./ModuleInspectorPaginator"
import { Footer } from "@components/index"
import { HRefSrc } from "@interop/html_text"
import { ModuleInfoMap } from "@interop/module_info"

export const MODULE_INSPECTOR_PAGE_SIZE = 50;

export type ModuleInspectorPageProps = {
    entry: ModuleInspectorEntry,
}

export function ModuleInspectorPage({
    entry
}: ModuleInspectorPageProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const theme = useTheme();

    const [entries, set_entries] = useState<ModuleEntry[] | null>(null);
    const { bible_version_state, set_bible_version_state } = use_bible_display_settings();
    const view_history = use_view_history();
    const [page_index, set_page_index] = useState<number | null>(null);
    
    useEffect(() => {
        const fetch_page_index = async () => {
            let index = 0;

            if (entry.selector?.type === "page") {
                index = entry.selector.index;
            } else if (entry.selector?.type === "entry") {
                const entry_index =
                    (await fetch_backend_entry_index(entry.module, entry.selector.id)) ?? 0;
                index = Math.floor(entry_index / MODULE_INSPECTOR_PAGE_SIZE);
            }

            set_page_index(index);
        };

        fetch_page_index();
    }, [entry.module, entry.selector]);

    useEffect(() => {
        if (page_index === null) return;

        let is_mounted = true;

        const fetch_entries = async () => {
            const fetched = await fetch_backend_module_entries(
                entry.module,
                MODULE_INSPECTOR_PAGE_SIZE,
                page_index
            );

            if (is_mounted) {
                set_entries(fetched);
            }
        };

        fetch_entries();

        return () => {
            is_mounted = false;
        };
    }, [entry.module, page_index]);


    const handle_ref_clicked = get_handle_ref_clicked_callback(set_bible_version_state, bible_version_state, view_history, () => {
        // set_popover_data(null)
    });

    const handle_ref_clicked_ref = useRef(handle_ref_clicked);
    useEffect(() => {
        handle_ref_clicked_ref.current = handle_ref_clicked;
    }, [handle_ref_clicked]);

    const ref_clicked_callback = useCallback((href: HRefSrc) => {
        handle_ref_clicked_ref.current(href)
    }, [handle_ref_clicked_ref]);

    return (
        <ModuleInspectorPageContent 
            entries={entries}
            module_infos={module_infos}
            handle_ref_clicked={ref_clicked_callback}
            theme={theme}
            inspector_entry={entry}
        />
    )
}

type ModuleInspectorPageContentProps = {
    entries: ModuleEntry[] | null,
    module_infos: ModuleInfoMap,
    handle_ref_clicked: (href: HRefSrc) => void,
    theme: Theme,
    inspector_entry: ModuleInspectorEntry,
}

const ModuleInspectorPageContent = React.memo(function ModuleInspectorPageContent({
    entries,
    module_infos,
    handle_ref_clicked,
    theme,
    inspector_entry,
}: ModuleInspectorPageContentProps): React.ReactElement
{
    return (
        <Box>
            <ModuleInspectorPageToolbar module={inspector_entry.module} />
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
                        {module_infos[inspector_entry.module]!.name}
                    </Typography>
                    <Divider />
                    {entries.map((e, i) => (
                        <ModuleEntryInfoPanel 
                            entry={e}
                            on_href_clicked={handle_ref_clicked}
                            key={i}
                        />
                    ))}
                    
                    <ModuleInspectorPaginator entry={inspector_entry}/>
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
           prev.handle_ref_clicked === next.handle_ref_clicked && 
           prev.module_infos === next.module_infos;
})