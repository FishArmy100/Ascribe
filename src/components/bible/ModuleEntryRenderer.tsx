import React from "react"
import { ModuleEntry, ReferenceData } from "@interop/module_entry"
import { Typography } from "@mui/material"
import { OsisBook } from "@interop/bible"
import { HRefSrc, HtmlText, HtmlTextHelper, Node } from "@interop/html_text"
import { HtmlTextRenderer } from "../HtmlTextRenderer"
import { Atom, RefId, RefIdFormatter, use_format_ref_id } from "@interop/bible/ref_id"
import { use_module_configs } from "@components/providers/ModuleConfigProvider"

export type ModuleEntryRendererProps = {
    entry: ModuleEntry,
    on_ref_clicked: (id: HRefSrc) => void,
}

export default function ModuleEntryRenderer({
    entry,
    on_ref_clicked,
}: ModuleEntryRendererProps): React.ReactElement
{
    const configs = use_module_configs();
    const formatter = use_format_ref_id();
    if (entry.type === "commentary")
    {
        return <ReferenceEntryRenderer
            note={entry.comment}
            references={entry.references}
            on_ref_clicked={on_ref_clicked}
            bible={configs.commentary_configs[entry.module].bible ?? null}
            name={null}
        />
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

        return <ReferenceEntryRenderer
            note={entry.content}
            references={entry.references}
            bible={configs.notebook_configs[entry.module].bible ?? null}
            on_ref_clicked={on_ref_clicked}
            name={entry.name}
        />
    }
    else if (entry.type === "strongs_def")
    {
        return <HtmlTextRenderer 
            on_href_click={on_ref_clicked}
            content={entry.definition}
        />
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
                content={get_x_ref_html(entry.targets, entry.note, formatter, configs.xref_configs[entry.module].bible ?? null)}
            />
        )
    }
    else if (entry.type === "xref_mutual")
    {
        return (
            <HtmlTextRenderer 
                on_href_click={on_ref_clicked} 
                content={get_x_ref_html(entry.refs, entry.note, formatter, configs.xref_configs[entry.module].bible ?? null)}
            />
        )
    }
    else
    {
        console.error(`Unknown variant ${(entry as any).type}`);
        return <></>
    }
}

function get_x_ref_html(targets: ReferenceData[], note: HtmlText | null, formatter: RefIdFormatter, bible: string | null): HtmlText
{
    let items = targets.map((v, i): Node => ({
        type: "list_item",
        content: [
            { type: "anchor", href: { type: "ref_id", id: v.id }, content: [{ type: "text", text: `[${formatter(v.id, bible)}]` }] },
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

type ReferenceEntryRendererProps = {
    name: string | null,
    note: HtmlText | null,
    references: RefId[],
    bible: string | null,
    on_ref_clicked: (id: HRefSrc) => void,
}

function ReferenceEntryRenderer({
    name,
    note,
    references,
    bible,
    on_ref_clicked,
}: ReferenceEntryRendererProps): React.ReactElement
{
    const formatter = use_format_ref_id();
    let content: HtmlText = {
        nodes: [
            ...references.map((r): Node => ({
                type: "anchor",
                content: [{ type: "text", text: `[${formatter(r, bible)}]` }],
                href: { type: "ref_id", id: r }
            }))
        ]
    }

    if (note)
    {
        content.nodes.unshift(
            ...note.nodes,
            { type: "horizontal_rule" },
        )
    }

    if (name)
    {
        content.nodes.unshift({
            type: "heading",
            level: 1,
            content: [{ type: "text", text: name }],
        })
    }

    return <HtmlTextRenderer
        content={content}
        on_href_click={on_ref_clicked}
    />
}