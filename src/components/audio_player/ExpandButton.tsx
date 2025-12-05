import { Box, useTheme } from "@mui/material";
import React from "react";
import ImageButton, { BUTTON_SIZE } from "../core/ImageButton";
import * as images from "../../assets";

export type ExpandButtonProps = {
    is_expanded: boolean,
    set_is_expanded: (v: boolean) => void,
}

export default function ExpandButton({
    is_expanded,
    set_is_expanded,
}: ExpandButtonProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <Box
            sx={{
                display: "flex",
                position: "absolute",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                top: theme.spacing(-BUTTON_SIZE / 2),
                left: 0,
            }}
        >
            <ImageButton
                image={is_expanded ? images.angle_down : images.angle_up}
                active={is_expanded}
                tooltip="Expand options"
                on_click={() => set_is_expanded(!is_expanded)}
                sx={{
                    position: "relative",
                    height: theme.spacing(BUTTON_SIZE / 2),
                    maxHeight: theme.spacing(BUTTON_SIZE / 2),
                    minHeight: theme.spacing(BUTTON_SIZE / 2),
                }}
            />
        </Box>
    )
}