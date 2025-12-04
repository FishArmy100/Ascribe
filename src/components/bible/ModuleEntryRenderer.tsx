import React from "react"
import { ModuleEntry, ReferenceData } from "@interop/module_entry"
import { Typography } from "@mui/material"
import { format_ref_id } from "./RefIdRenderer"
import { OsisBook } from "@interop/bible"
import { HRefSrc, HtmlText, HtmlTextHelper, Node } from "@interop/html_text"
import { HtmlTextRenderer } from "../HtmlTextRenderer"
import { Atom, RefId } from "@interop/bible/ref_id"

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
        return <ReferenceEntryRenderer
            note={entry.comment}
            references={entry.references}
            name_mapper={name_mapper}
            on_ref_clicked={on_ref_clicked}
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
            name_mapper={name_mapper}
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
                content={get_x_ref_html(entry.targets, entry.note, name_mapper)}
            />
        )
    }
    else if (entry.type === "xref_mutual")
    {
        return (
            <HtmlTextRenderer 
                on_href_click={on_ref_clicked} 
                content={get_x_ref_html(entry.refs, entry.note, name_mapper)}
            />
        )
    }
    else
    {
        console.error(`Unknown variant ${(entry as any).type}`);
        return <></>
    }
}

function get_x_ref_html(targets: ReferenceData[], note: HtmlText | null, name_mapper: (osis: OsisBook) => string): HtmlText
{
    let items = targets.map((v, i): Node => ({
        type: "list_item",
        content: [
            { type: "anchor", href: { type: "ref_id", id: v.id }, content: [{ type: "text", text: `[${format_ref_id(v.id, name_mapper)}]` }] },
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
    name_mapper: (book: OsisBook) => string,
    on_ref_clicked: (id: HRefSrc) => void,
}

function ReferenceEntryRenderer({
    name,
    note,
    references,
    name_mapper,
    on_ref_clicked,
}: ReferenceEntryRendererProps): React.ReactElement
{
    let content: HtmlText = {
        nodes: [
            ...references.map((r): Node => ({
                type: "anchor",
                content: [{ type: "text", text: `[${pretty_print_ref_id(r, name_mapper)}]` }],
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

function pretty_print_ref_id(id: RefId, mapper: (book: OsisBook) => string): string 
{
    let inner = id.id;
    let bible = id.bible;
    let version_text = bible ? ` (${bible})` : "";

    if (inner.type === "single")
    {
        return pretty_print_atom(inner.atom, mapper) + version_text;
    }
    else 
    {
        let a = inner.from;
        let b = inner.to;
        if (a.type === "book" && b.type === "book" && a.book === b.book)
        {
            return mapper(a.book) + version_text;
        }
        else if (a.type === "chapter" && b.type === "chapter" && a.book === b.book)
        {
            return `${mapper(a.book)} ${a.chapter}-${b.chapter}` + version_text
        }
        else if (a.type === "verse" && b.type === "verse" || a.type === "word" && b.type === "word")
        {
            if (a.book === b.book && a.chapter === b.chapter)
            {
                return `${mapper(a.book)} ${a.chapter}:${a.verse}-${b.verse}` + version_text;
            }
            else if (a.book === b.book)
            {
                return `${mapper(a.book)} ${a.chapter}:${a.verse}-${b.chapter}:${b.verse}` + version_text;
            }
        }
        
        let a_str = pretty_print_atom(a, mapper);
        let b_str = pretty_print_atom(b, mapper);
        return `${a_str}-${b_str}` + version_text;
    }
}

function pretty_print_atom(atom: Atom, mapper: (book: OsisBook) => string): string
{
    if (atom.type === "book")
    {
        return mapper(atom.book)
    }
    else if (atom.type === "chapter")
    {
        return `${mapper(atom.book)} ${atom.chapter}`
    }
    else
    {
        return `${mapper(atom.book)} ${atom.chapter}:${atom.verse}`
    }
}