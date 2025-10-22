import React from "react";
import { Atom, RefId } from "../../interop/bible/ref_id";

export type RefIdRendererProps = {
    ref_id: RefId,

    on_click: (id: RefId) => void,
}

export default function RefIdRenderer({

}: RefIdRendererProps): React.ReactElement
{
    return <></>
}

function format_ref_id(id: RefId): string
{
    if (id.id.type === "range")
    {
        
    }
    else if (id.id.type === "single")
    {

    }
    else
    {
        return "";
    }

    return ""
}

function format_atom(atom: Atom): string 
{
    return "";
}