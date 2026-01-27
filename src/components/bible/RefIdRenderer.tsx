import React from "react";
import { Atom, RefId, RefIdInner, use_format_ref_id } from "../../interop/bible/ref_id";
import { OsisBook } from "../../interop/bible";
import { Typography } from "@mui/material";

export type RefIdRendererProps = {
    ref_id: RefId,
    on_click: (id: RefId) => void,
    bible: string | null,
}

export default function RefIdRenderer({
    ref_id,
    on_click,
    bible
}: RefIdRendererProps): React.ReactElement
{
    const formatter = use_format_ref_id();
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
            {`[${formatter(ref_id, bible)}]`}
        </Typography>
    )
}