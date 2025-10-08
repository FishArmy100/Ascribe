import { Box, Paper, Stack, useTheme } from "@mui/material"
import React, { useState } from "react"
import ImageButton from "./ImageButton"
import { use_settings } from "../providers/SettingsProvider"

export const DROPDOWN_PADDING = 0.4;

export type ImageDropdownOption<T> = {
    image: string,
    tooltip: string,
    value: T
}

export type ImageDropdownProps<T> = {
    image: string,
    tooltip: string,
    options: ImageDropdownOption<T>[],
    on_select: (value: T) => void,
}

export default function ImageDropdown<T>({
    image,
    tooltip,
    options,
    on_select,
}: ImageDropdownProps<T>): React.ReactElement
{
    const [is_open, set_open] = useState(false);

    return (
        <Box
            sx={{
                position: "relative"
            }}
            className="dropdown-button"
        >
            <ImageButton
                image={image}
                tooltip={tooltip}
                active={is_open}
                on_click={() => {
                    set_open(!is_open)
                }}
            />
            <Paper
                sx={{
                    position: "absolute",
                    top: (theme) => `calc(100% - ${theme.spacing(DROPDOWN_PADDING)})`,
                    left: -DROPDOWN_PADDING,
                    padding: DROPDOWN_PADDING,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease"
                }}
                className="dropdown-content"
            >
                <Stack 
                    direction="column"
                    gap={(theme) => theme.spacing(DROPDOWN_PADDING)}
                >
                    {options.map((o, i) => {
                        return (
                            <ImageButton
                                key={i}
                                image={o.image}
                                tooltip={o.tooltip}
                                on_click={() => {
                                    set_open(false);
                                    on_select(o.value);
                                }}
                            />
                        )
                    })}
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
    );
}