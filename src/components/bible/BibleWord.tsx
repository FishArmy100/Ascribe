import React from "react"
import { WordRenderData } from "../../interop/bible/render"
import { Box, Typography } from "@mui/material";
import { format_strongs, StrongsNumber } from "../../interop/bible/strongs";

export type StrongsClickedCallback = (el: HTMLElement, strongs: StrongsNumber) => void;
export type WordClickedCallback = (el: HTMLElement, index: number) => void;

export type BibleWordProps = {
    render_data: WordRenderData,
    show_strongs: boolean,
    on_strongs_clicked?: StrongsClickedCallback,
    on_word_clicked?: WordClickedCallback,
}

export default function BibleWord({
    render_data,
    show_strongs,
    on_strongs_clicked,
    on_word_clicked,
}: BibleWordProps): React.ReactElement
{
    const begin_punc = render_data.begin_punc ?? "";
    const end_punc = render_data.end_punc ?? "";

    let click_handler: ((e: React.MouseEvent<HTMLElement>) => void) | undefined = undefined;
    
    if (render_data.has_data && on_word_clicked)
    {
        click_handler = e => {
            on_word_clicked(e.currentTarget, render_data.index);
        }
    }

    let can_click = render_data.has_data;

    let word = (
        <Typography
            onClick={click_handler}
            component="span"
            sx={{
                fontStyle: render_data.italics ? "italic" : "normal",
                color: render_data.red ? "#c00" : "inherit",
                cursor: can_click ? "pointer" : "default",
                "&:hover": {
                    backgroundColor: (theme) => can_click ? theme.palette.action.hover : undefined,
                }
            }}
        >
            {begin_punc + render_data.word + end_punc}
        </Typography>
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
                    onClick={(e) => on_strongs_clicked && on_strongs_clicked(e.currentTarget, s)}
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