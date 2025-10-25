import React from "react";
import { Atom, RefId, RefIdInner } from "../../interop/bible/ref_id";
import { OsisBook } from "../../interop/bible";
import { Typography } from "@mui/material";

export type RefIdRendererProps = {
    ref_id: RefId,
    on_click: (id: RefId) => void,
    name_mapper: (osis: OsisBook) => string,
}

export default function RefIdRenderer({
    ref_id,
    on_click,
    name_mapper,
}: RefIdRendererProps): React.ReactElement
{
    return (
        <Typography
            sx={{
                color: theme => theme.palette.info.main,
                textDecoration: "underlined",
                transition: "color 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                    color: theme => theme.palette.info.dark,
                }
            }}
            onClick={() => on_click(ref_id)}
            component="span"
        >
            {`[${format_ref_id(ref_id, name_mapper)}]`}
        </Typography>
    )
}

export function format_ref_id(id: RefId, name_mapper: (osis: OsisBook) => string): string
{
    if (id.bible !== null)
    {
        return `${format_ref_id_inner(id.id, name_mapper)} ${id.bible}`;
    }

    return format_ref_id_inner(id.id, name_mapper)
}

function format_ref_id_inner(id: RefIdInner, name_mapper: (osis: OsisBook) => string): string
{
    if (id.type === "range")
    {
        const to = id.to;
        const from = id.from;
        if (to.type === "verse" && from.type === "verse")
        {
            if (to.book === from.book && to.chapter === from.chapter && to.verse !== from.verse)
            {
                return `${name_mapper(to.book)} ${to.chapter}:${from.verse}-${to.verse}`;
            }
        }
        else if (to.type === "chapter" && from.type === "chapter" && to.chapter !== from.chapter)
        {
            if (to.book === from.book)
            {
                return `${name_mapper(to.book)} ${from.chapter}-${to.chapter}`
            }
        }
        
        return `${format_atom(id.from, name_mapper)}-${format_atom(id.to, name_mapper)}`;
    }
    else if (id.type === "single")
    {
        return format_atom(id.atom, name_mapper);
    }
    else
    {
        return "";
    }
}

function format_atom(atom: Atom, name_mapper: (osis: OsisBook) => string): string 
{
    if (atom.type === "book")
    {
        return `${name_mapper(atom.book)}`
    }
    else if (atom.type === "chapter")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}`
    }
    else if (atom.type === "verse")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}:${atom.verse}`
    }
    else if (atom.type === "word")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}:${atom.verse}#${atom.word}`
    }
    else 
    {
        return "";
    }
}