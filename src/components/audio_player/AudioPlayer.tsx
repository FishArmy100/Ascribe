import { Box, Paper } from "@mui/material";
import React from "react";

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open
}: AudioPlayerProps): React.ReactElement
{
    return (
        <Box
            sx={{
                position: "fixed",
                display: "flex",
                justifyContent: "center",
                bottom: 0,
                right: 0,
                width: "100vw"
            }}
        >
            <Paper
                sx={{
                    width: "70%"
                }}
            >
                Hello There!
            </Paper>
        </Box>
    )
}