import React from "react"
import { WordRenderData } from "../../interop/bible/render"

export type BibleWordProps = {
    render_data: WordRenderData,
}

export default function BibleWord({
    render_data,
}: BibleWordProps): React.ReactElement
{
    const begin_punc = render_data.begin_punc ?? "";
    const end_punc = render_data.end_punc ?? "";
    return (
        <span
            style={{
                fontStyle: render_data.italics ? "italic" : "normal",
                color: render_data.red ? "#c00" : "inherit",
            }}
        >
            {begin_punc + render_data.word + end_punc}
        </span>
    );
}