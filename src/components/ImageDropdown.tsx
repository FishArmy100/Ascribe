import { Box, Paper, Stack } from "@mui/material"
import React, { useState } from "react"
import ImageButton from "./ImageButton"
import { use_settings } from "./SettingsContext"

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
    const { settings } = use_settings();
    const [is_open, set_open] = useState(false);

    const dropdown_padding = 3 * settings.ui_scale;

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
                onClick={() => {
                    set_open(!is_open)
                }}
            />
            <Paper
                sx={{
                    position: "absolute",
                    top: `100% + ${dropdown_padding}px`,
                    left: `-${dropdown_padding}px`,
                    padding: `${dropdown_padding}px`,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease"
                }}
                className="dropdown-content"
            >
                <Stack 
                    direction="column"
                    gap={`${dropdown_padding}px`}
                >
                    {options.map((o, i) => {
                        return (
                            <ImageButton
                                key={i}
                                image={o.image}
                                tooltip={o.tooltip}
                                onClick={() => {
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