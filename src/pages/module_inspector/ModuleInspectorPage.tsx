import { ModuleInspectorEntry } from "@interop/view_history"
import { Box } from "@mui/material"
import React from "react"
import ModuleInspectorPageToolbar from "./ModuleInspectorToolbar"
import { use_module_infos } from "@components/providers/ModuleInfoProvider"

export type ModuleInspectorPageProps = {
    entry: ModuleInspectorEntry,
}

export default function ModuleInspectorPage({
    entry
}: ModuleInspectorPageProps): React.ReactElement
{
    const { module_infos } = use_module_infos();

    console.log(Object.keys(module_infos));
    console.log(entry);

    return (
        <Box>
            <ModuleInspectorPageToolbar />
        </Box>
    )
}