import { ModuleInspectorEntry } from "@interop/view_history"
import { Box, Stack, useTheme } from "@mui/material"
import React, { useState } from "react"
import ModuleListPageToolbar from "./ModuleListPageToolbar"
import { get_handle_ref_clicked_callback } from "../../page_utils"
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider"
import { use_view_history } from "@components/providers/ViewHistoryProvider"
import { use_module_infos } from "@components/providers/ModuleInfoProvider"
import ModuleInfoPanel from "./ModuleInfoPanel"
import { Footer } from "@components/index"
import { ModuleDisplayOptions } from "./ModuleTypeDisplayDropdown"

export default function ModuleListPage(): React.ReactElement
{
    const { bible_version_state, set_bible_version_state } = use_bible_display_settings();
    const [display_options, set_display_options] = useState<ModuleDisplayOptions>({
        show_bibles: true,
        show_commentaries: true,
        show_cross_refs: true,
        show_notebooks: true,
        show_readings: true,
        show_strongs_defs: true,
        show_dictionaries: true,
    });

    const view_history = use_view_history();
    const { module_infos } = use_module_infos();
    const theme = useTheme();

    const modules = Object.values(module_infos)
        .filter(m => m !== undefined)
        .filter(m => {
            if (display_options.show_bibles && m.module_type === "bible")
            {
                return true;  
            } 
            else if (display_options.show_commentaries && m.module_type === "commentary")
            {
                return true
            }
            else if (display_options.show_cross_refs && m.module_type === "cross_refs")
            {
                return true;
            }
            else if (display_options.show_dictionaries && m.module_type === "dictionary")
            {
                return true;
            }
            else if (display_options.show_notebooks && m.module_type === "notebook")
            {
                return true;
            }
            else if (display_options.show_readings && m.module_type === "readings")
            {
                return true;
            }
            else if (display_options.show_strongs_defs && m.module_type === "strongs_defs")
            {
                return true;
            }
            else 
            {
                return false;
            }
        })
        .sort((a, b) => a.name.localeCompare(b.name))

    const handle_ref_clicked = get_handle_ref_clicked_callback(set_bible_version_state, bible_version_state, view_history, () => {});


    return (
        <Box>
            <ModuleListPageToolbar 
                display_options={display_options} 
                set_display_options={set_display_options}
            /> 

            <Stack
                gap={2}
                sx={{
                    mt: 7,
                    ml: 2,
                    mr: 2,
					mb: `calc(100vh - (${theme.spacing(14)}))`,
                }}
            >
                {modules.map((m, i) => (
                    <ModuleInfoPanel 
                        key={i}
                        info={m}
                        on_href_clicked={handle_ref_clicked}
                    />
                ))}
            </Stack>
            <Footer/>
        </Box>
    )
}