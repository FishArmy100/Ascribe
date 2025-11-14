import React from "react"
import { ModuleEntry, ReferenceData } from "../../interop/module_entry"
import { Typography } from "@mui/material"
import { format_ref_id } from "./RefIdRenderer"
import { OsisBook } from "../../interop/bible"
import { HRefSrc, HtmlText, HtmlTextHelper, Node } from "../../interop/html_text"
import { HtmlTextRenderer } from "../HtmlTextRenderer"

export type ModuleEntryRendererProps = {
    entry: ModuleEntry,
    name_mapper: (osis: OsisBook) => string,
    on_ref_clicked: (id: HRefSrc) => void,
}

export default function ModuleEntryRenderer({
    entry,
    name_mapper,
    on_ref_clicked,
}: ModuleEntryRendererProps): React.ReactElement
{
    if (entry.type === "commentary")
    {
        return <Typography>Not implemented yet</Typography>
    }
    else if (entry.type === "dictionary")
    {
        return <HtmlTextRenderer 
            on_href_click={on_ref_clicked}
            content={entry.definition}
        />
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
        return (
            <HtmlTextRenderer 
                on_href_click={on_ref_clicked} 
                content={get_x_ref_directed_html(entry.targets, entry.note, name_mapper)}
            />
        )
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

function get_x_ref_directed_html(targets: ReferenceData[], note: HtmlText | null, name_mapper: (osis: OsisBook) => string): HtmlText
{
    let items = targets.map((v, i): Node => ({
        type: "list_item",
        content: [
            { type: "anchor", href: { type: "ref_id", value: v.id }, content: [{ type: "text", text: `[${format_ref_id(v.id, name_mapper)}]` }] },
            { type: "text", text: `: "${v.preview_text}"` },
        ]
    }))

    let nodes: Node[] = [];

    if (note)
    {
        nodes.push(
            HtmlTextHelper.basic_heading(2, "Note:"),
            ...note.nodes,
        )
    }

    nodes.push(
        HtmlTextHelper.basic_heading(2, "References:"),
        {
            type: "list",
            ordered: false,
            items: items
        }
    )

    return {
        nodes
    }
}