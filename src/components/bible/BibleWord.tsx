import React from "react"
import { WordRenderData } from "../../interop/bible/render"
import { Box } from "@mui/material";
import { format_strongs } from "../../interop/bible/strongs";

export type BibleWordProps = {
    render_data: WordRenderData,
    show_strongs: boolean,
}

export default function BibleWord({
    render_data,
    show_strongs,
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

    if (show_strongs && render_data.strongs.length > 0)
    {
        const joined_spans = render_data.strongs.map((s, i) => (
            <React.Fragment key={i}>
                <Box
                    component="span"
                    sx={{
                        cursor: "pointer",
                        "&:hover": {
                            textDecoration: "underline",
                        }
                    }}
                >
                    {format_strongs(s)}
                </Box>
                {i < render_data.strongs.length - 1 && <span>;</span>}
            </React.Fragment>
        ))

        word = (
            <span style={{ position: "relative", display: "inline-block" }}>
                {word}
                <Box
                    component="sup"
                    sx={{
                        fontSize: "0.65em",
                        color: "text.secondary",
                        ml: "0.15em",
                    }}
                >
                    [{joined_spans}]
                </Box>
            </span>
        )
    }

    return (
        word
    );
}