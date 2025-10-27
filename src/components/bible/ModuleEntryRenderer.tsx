import React, { useEffect, useState } from "react"
import { ModuleEntry } from "../../interop/module_entry"
import { Typography } from "@mui/material"
import RefIdRenderer, { format_ref_id } from "./RefIdRenderer"
import { fetch_backend_verse_render_data, OsisBook } from "../../interop/bible"
import { get_first_verse, RefId } from "../../interop/bible/ref_id"
import { HRefSrc, HtmlText, Node } from "../../interop/html_text"
import { HtmlTextRenderer } from "../HtmlTextRenderer"
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider"

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
    const [retrieved_values, set_retrieved_values] = useState<string[] | null>(null);
    const { bible_version_state: bible_version } = use_bible_display_settings();

    useEffect(() => {
        const retrieve = async () => {
            if (entry.type === "xref_directed")
            {
                const verses = await Promise.all(entry.targets.map(async t => {
                    const first_verse = get_first_verse(t);
                    const bible = t.bible ?? bible_version.bible_version;
                    return fetch_backend_verse_render_data([first_verse], bible).then(vs => vs[0].failed ? null : vs[0])
                }));

                const rendered = verses.map(v => {
                    if (v)
                    {
                        return v.words.map(w => (w.begin_punc ?? "") + w.word + (w.end_punc ?? "")).join(" ");
                    }
                    else 
                    {
                        return "";
                    }
                });

                set_retrieved_values(rendered);
            }
        };

        retrieve();

        return () => {}
    }, [entry.id, entry.module]);

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
        return (
            <HtmlTextRenderer 
                on_href_click={on_ref_clicked} 
                content={get_x_ref_directed_html(entry.targets, name_mapper, retrieved_values)}
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

function get_x_ref_directed_html(targets: RefId[], name_mapper: (osis: OsisBook) => string, verse_text: string[] | null): HtmlText
{
    let items = targets.map((v, i): Node => ({
        type: "list_item",
        content: [
            { type: "anchor", href: { type: "ref_id", value: v }, content: [{ type: "text", text: `[${format_ref_id(v, name_mapper)}]` }] },
            { type: "text", text: `: "${verse_text?.[i] ?? "..."}"` },
        ]
    }))

    return {
        nodes: [
            {
                type: "bold",
                content: [{type: "text", text: "References: "}],
            },
            {
                type: "list",
                ordered: false,
                items: items
            }
        ]
    }
}