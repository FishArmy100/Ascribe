import React, { useState } from "react";
import { ChapterId } from "../../interop/bible";
import * as images from "../../assets";
import { use_settings } from "../contexts/SettingsContext";
import { Box, Paper, Stack } from "@mui/material";
import ImageButton from "../ImageButton";

export type ChapterPickerProps = {
    on_select: (chapter: ChapterId) => void,
}

export default function ChapterPicker(): React.ReactElement
{
    const { settings } = use_settings();
    const [is_open, set_open] = useState(false);

    return (
        <Box
            sx={{
                position: "relative"
            }}
            className="dropdown-button"
        >
            <ImageButton
                image={images.books}
                tooltip="Select chapter"
                active={is_open}
                onClick={() => {
                    set_open(!is_open)
                }}
            />
            <Paper
                sx={{
                    position: "absolute",
                    top: `100%`,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease"
                }}
                className="dropdown-content"
            >
                <Stack 
                    direction="column"
                    
                >
                    
                </Stack>
            </Paper>
            <style>
                {`
                    .dropdown-button:hover .dropdown-content {
                        opacity: 1;
                        visibility: visible;
                        pointer-events: auto;
                    }
                `}
            </style>
        </Box>
    )
}