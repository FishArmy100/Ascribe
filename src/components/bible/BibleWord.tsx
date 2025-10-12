import React from "react"
import { WordRenderData } from "../../interop/bible/render"
import { Box } from "@mui/material";
import { format_strongs } from "../../interop/bible/strongs";

export type BibleWordProps = {
    render_data: WordRenderData,
}

export default function BibleWord({
    render_data,
}: BibleWordProps): React.ReactElement
{
    const begin_punc = render_data.begin_punc ?? "";
    const end_punc = render_data.end_punc ?? "";

    let word = (
        <span
            style={{
                fontStyle: render_data.italics ? "italic" : "normal",
                color: render_data.red ? "#c00" : "inherit",
            }}
        >
            {begin_punc + render_data.word + end_punc}
        </span>
    );

    if (render_data.strongs.length > 0)
    {
        const joined_spans = render_data.strongs.map((s, i) => (
            <React.Fragment key={i}>
                <span>{format_strongs(s)}</span>
                {i < render_data.strongs.length - 1 && <span>;</span>}
            </React.Fragment>
        ))

        word = (
            <span style={{ position: "relative", display: "inline-block" }}>
                {word}
                <Box
                    component="span"
                    sx={{
                        position: "absolute",
                        top: "-0.6em",
                        right: "-0.2em",
                        fontSize: "0.65rem",
                        color: "text.secondary",
                        lineHeight: 1,
                    }}
                >
                    {joined_spans}
                </Box>
            </span>
        )
    }

    return (
        word
    );
}