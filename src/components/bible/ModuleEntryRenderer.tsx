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
        console.log(entry);
        return <DictionaryEntryRenderer 
            definitions={entry.definitions} 
            on_ref_clicked={on_ref_clicked}
            aliases={entry.aliases}
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
            HtmlTextHelper.basic_heading(5, "Note:"),
            ...note.nodes,
        )
    }

    nodes.push(
        HtmlTextHelper.basic_heading(5, "References:"),
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

type DictionaryEntryRendererProps = {
    definitions: HtmlText[],
    on_ref_clicked: (id: HRefSrc) => void,
    aliases: string[] | null,
}

function DictionaryEntryRenderer({
    definitions,
    on_ref_clicked,
    aliases,
}: DictionaryEntryRendererProps): React.ReactElement
{
    const aliases_html = aliases && {
        nodes: [
            HtmlTextHelper.bold(HtmlTextHelper.text("Aliases: ")),
            HtmlTextHelper.text(aliases.join(", ")),
        ]
    };

    return (
        <>
            {definitions.map((d, i) => {
                return <HtmlTextRenderer 
                    on_href_click={on_ref_clicked}
                    content={d}
                    key={i}
                />
            })}
            {aliases_html}
        </>
    )
}