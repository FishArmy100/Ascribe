import React from "react"
import { VerseRenderData } from "../../interop/bible/render"
import { SxProps } from "@mui/material/styles"
import { Theme } from "@mui/material/styles"
import { Box, Typography } from "@mui/material"
import BibleWord from "./BibleWord"


export type BibleVerseProps = {
    render_data: VerseRenderData,
    sx?: SxProps<Theme>,
    verse_label?: string,
}

export default function BibleVerse({
    render_data,
    sx,
    verse_label
}: BibleVerseProps): React.ReactElement
{
    let verse_content;
    if (render_data.words.length > 0)
    {
        verse_content = (
            <Box component="span" sx={{ flex: 1 }}>
                {render_data.words.map((w, i) => (
                    <React.Fragment key={i}>
                        <BibleWord render_data={w} />
                        {i < render_data.words.length - 1 && " "}
                    </React.Fragment>
                ))}
            </Box>
        )
    }
    else
    {
        verse_content = <em>[Verse omitted]</em>;
    }

    return (
        <Typography
            component="div"
            variant="body1"
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                lineHeight: 1.8,
                marginBottom: 1,
                ...sx,
            }}
        >
            {/* Verse number */}
            {
                verse_label && <Box
                    component="span"
                    sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mr: 0.5,
                        mt: "2px",
                        userSelect: "none",
                    }}
                >
                    {verse_label}
                </Box>
            }

            {/* Verse text */}
            {verse_content}
        </Typography>
    );
}