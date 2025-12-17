import { ModuleInspectorEntry } from "@interop/view_history"
import { Box } from "@mui/material"
import React from "react"
import ModuleInspectorPageToolbar from "./ModuleInspectorPageToolbar"

export type ModuleInspectorPageProps = {
    entry: ModuleInspectorEntry
}

export default function ModuleInspectorPage({
    entry,
}: ModuleInspectorPageProps): React.ReactElement
{
    return (
        <Box>
           <ModuleInspectorPageToolbar /> 
        </Box>
    )
}