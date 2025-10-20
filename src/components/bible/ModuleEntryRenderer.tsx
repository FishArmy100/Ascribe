import React from "react"
import { ModuleEntry } from "../../interop/module_entry"
import { Typography } from "@mui/material"

export type ModuleEntryRendererProps = {
    entry: ModuleEntry
}

export default function ModuleEntryRenderer({
    entry
}: ModuleEntryRendererProps): React.ReactElement
{
    if (entry.type === "commentary")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "dictionary")
    {   
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "notebook_highlight")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "notebook_note")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "strongs_def")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "strongs_link")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "xref_directed")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "xref_mutual")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else
    {
        console.error(`Unknown variant ${(entry as any).type}`);
        return <></>
    }
}