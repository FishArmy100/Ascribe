import React from "react";
import Tooltip from "../core/Tooltip";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "../core/ImageButton";
import use_audio_player_tooltips from "./audio_player_tooltips";

export type GenerationProgressIndicatorProps = {
    progress: number,
}

export default function GenerationProgressIndicator({
    progress
}: GenerationProgressIndicatorProps): React.ReactElement
{
    const theme = useTheme();
    const tooltips = use_audio_player_tooltips();

    return (
        <Tooltip tooltip={tooltips.percent_generated((progress * 100).toFixed(1))}>
            <Box
                sx={{
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderWidth: (theme) => theme.spacing(1 / 8),
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: (theme) => theme.spacing(BUTTON_SIZE),
                    height: (theme) => theme.spacing(BUTTON_SIZE),
                    minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                    minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                    padding: BUTTON_PADDING,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress
                    size={theme.spacing(BUTTON_SIZE - BUTTON_PADDING * 2)}
                    color="secondary"
                    variant="determinate"
                    value={progress * 100}
                    thickness={5}
                />
            </Box>
        </Tooltip>
    )
}