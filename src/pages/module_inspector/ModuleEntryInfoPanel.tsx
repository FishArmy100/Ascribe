import { format_ref_id } from "@components/bible/RefIdRenderer";
import { format_strongs } from "@interop/bible/strongs";
import { HRefSrc } from "@interop/html_text";
import { CommentaryEntry, ModuleEntry } from "@interop/module_entry";
import React from "react";

export type ModuleEntryInfoPanelProps = {
    entry: ModuleEntry,
    on_href_clicked: (ref: HRefSrc) => void,
}

export default function ModuleEntryInfoPanel({
    entry,
    on_href_clicked
}: ModuleEntryInfoPanelProps): React.ReactElement
{
    if (entry.type === "commentary")
    {
        return <CommentaryEntryPanel entry={entry}/>
    }
    else 
    {
        console.error(`Unimplemented entry type ${entry.type}`)
        return <></>
    }
}

type CommentaryEntryPanelProps = {
    entry: CommentaryEntry
}

function CommentaryEntryPanel({
    entry
}: CommentaryEntryPanelProps): React.ReactElement
{
    return <></>
}

function DictionaryEntryPanel(): React.ReactElement
{
    return <></>
}