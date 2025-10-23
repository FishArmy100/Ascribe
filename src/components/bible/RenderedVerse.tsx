import { SxProps, Typography } from "@mui/material"
import { RenderedVerseContent } from "../../interop/bible/render"
import { Theme } from "@mui/material/styles"
import React from "react"

export type RenderedVerseProps = {
    content: RenderedVerseContent,
    sx?: SxProps<Theme>,
    verse_label?: string,
}

export default function RenderedVerse({
    content,
    sx,
    verse_label,
}: RenderedVerseProps): React.ReactElement
{
    return (
        <Typography
            component="div"
            variant="body1"
            // onClick={handle_verse_clicked}
            sx={{
                display: "flex",
                alignContent: "flex-start",
                gap: 1,
                lineHeight: 1.8,
                marginBottom: 1,
                ...sx,
            }}
        >
            {verse_label && (
                <span className="bible-verse-label">{verse_label}</span>
            )}
            <span className="bible-verse-text">
                {
                    (content.word_count > 0) ? (
                        <span dangerouslySetInnerHTML={{ __html: content.html }}></span>
                    ): (
                        <em>[Verse omitted]</em>
                    )
                }
            </span>
        </Typography>
    );
}