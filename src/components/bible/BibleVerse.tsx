import React from "react"
import { VerseRenderData } from "../../interop/bible/render"
import { SxProps } from "@mui/material/styles"
import { Theme } from "@mui/material/styles"
import { Typography } from "@mui/material"
import BibleWord from "./BibleWord"


export type BibleVerseProps = {
    render_data: VerseRenderData,
    sx?: SxProps<Theme>,
}

export default function BibleVerse({
    render_data,
    sx,
}: BibleVerseProps): React.ReactElement
{
    return (
        <Typography
            component="p"
            variant="body1"
            sx={{
                marginBottom: 1,
                lineHeight: 1.8,
                ...sx,
            }}
        >
            {render_data.words.map((w, i) => (
                <React.Fragment key={i}>
                <BibleWord
                    render_data={w}
                />
                {/* Insert a real space after each word except the last */}
                {i < render_data.words.length - 1 && " "}
                </React.Fragment>
            ))}
        </Typography>
    );
}