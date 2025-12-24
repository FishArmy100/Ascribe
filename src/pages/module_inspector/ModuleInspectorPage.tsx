import { ModuleInspectorEntry } from "@interop/view_history"
import { Box, Stack, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import ModuleInspectorPageToolbar from "./ModuleInspectorToolbar"
import { use_module_infos } from "@components/providers/ModuleInfoProvider"
import { fetch_backend_module_entries, ModuleEntry } from "@interop/module_entry"
import { LoadingSpinner } from "../LoadingSpinner"
import ModuleEntryInfoPanel from "./ModuleEntryInfoPanel"
import { get_handle_ref_clicked_callback } from "../page_utils"
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider"
import { use_view_history } from "@components/providers/ViewHistoryProvider"

export const MODULE_INSPECTOR_PAGE_SIZE = 50;

export type ModuleInspectorPageProps = {
    entry: ModuleInspectorEntry,
}

export default function ModuleInspectorPage({
    entry
}: ModuleInspectorPageProps): React.ReactElement
{
    const { module_infos } = use_module_infos();
    const theme = useTheme();

    const [entries, set_entries] = useState<ModuleEntry[] | null>(null);
    const { bible_version_state, set_bible_version_state } = use_bible_display_settings();
    const view_history = use_view_history();
    

    useEffect(() => {
        let is_mounted = true;
        const fetch_entries = async () => {
            const fetched = await fetch_backend_module_entries(entry.module, MODULE_INSPECTOR_PAGE_SIZE, 0);

            if (is_mounted)
            {
                set_entries(fetched)
            }
        }

        fetch_entries();

        return () => {
            is_mounted = false;
        }
    });

    const handle_ref_clicked = get_handle_ref_clicked_callback(set_bible_version_state, bible_version_state, view_history, () => {
        // set_popover_data(null)
    });

    return (
        <Box>
            <ModuleInspectorPageToolbar />
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
                    {entries.map((e, i) => (
                        <ModuleEntryInfoPanel 
                            entry={e}
                            on_href_clicked={handle_ref_clicked}
                            key={i}
                        />
                    ))}
                </Stack>
            ) : (
                <LoadingSpinner />
            )}
        </Box>
    )
}