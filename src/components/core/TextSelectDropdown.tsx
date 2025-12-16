import { Box, Paper, Stack, Typography, useTheme } from "@mui/material"
import React, { useState } from "react"
import ImageButton from "./ImageButton"
import Tooltip from "./Tooltip";
import { TypographyVariant } from "@mui/material/styles";

export const DROPDOWN_PADDING = 0.4;

export type TextSelectDropdownOption<T> = {
    text: string,
    tooltip: string,
    value: T
}

export type TextSelectDropdownProps<T> = {
    tooltip: string,
    options: TextSelectDropdownOption<T>[],
    selected: number,
    on_select: (value: T) => void,
    variant: TypographyVariant,
    bold: boolean,
}

export default function TextSelectDropdown<T>({
    tooltip,
    options,
    selected,
    on_select,
    variant,
    bold,
}: TextSelectDropdownProps<T>): React.ReactElement
{
    const [is_open, set_open] = useState(false);
    const theme = useTheme();
    const title = options[selected].text;

    return (
        <Box
            sx={{
                position: "relative"
            }}
            className="dropdown-button"
        >
            <Typography
                variant={variant}
                fontWeight={bold ? "bold" : undefined}
                sx={{
                    cursor: "pointer",
                    backgroundColor: is_open ? theme.palette.secondary.main : theme.palette.primary.light,
                    color: theme.palette.common.black,
                    padding: DROPDOWN_PADDING,
                    borderRadius: theme.spacing(DROPDOWN_PADDING),
                    transition: "background-color 0.3s ease",
                }}
                onClick={() => {
                    set_open(!is_open)
                }}
            >
                {title}
            </Typography>
            <Paper
                sx={{
                    position: "absolute",
                    top: `100%`,
                    left: (theme) => theme.spacing(-DROPDOWN_PADDING),
                    padding: DROPDOWN_PADDING,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease",
                    "&::before": {
                        display: 'none', // Remove the ::before element
                    },
                }}
                className="dropdown-content"
            >
                <Stack 
                    direction="column"
                    gap={(theme) => theme.spacing(DROPDOWN_PADDING)}
                    sx={{ paddingTop: 0 }}
                >
                    {options.map((o, i) => {
                        return (
                            <Tooltip 
                                tooltip={o.tooltip}
                                key={i}
                            >
                                <Typography
                                    variant={variant}
                                    fontWeight={bold ? "bold" : undefined}
                                    onClick={() => {
                                        set_open(false);
                                        on_select(o.value);
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        color: i === selected ? theme.palette.common.white : theme.palette.primary.main,
                                        backgroundColor: i === selected ? theme.palette.primary.main : undefined,
                                        transition: "background-color 0.3s ease",
                                        "&:hover": {
                                            backgroundColor: i === selected ? theme.palette.primary.dark : theme.palette.action.hover,
                                        },
                                        padding: DROPDOWN_PADDING,
                                        borderRadius: theme.spacing(DROPDOWN_PADDING),
                                    }}
                                >
                                    {o.text}
                                </Typography>
                            </Tooltip>
                        )
                    })}
                </Stack>
            </Paper>
            <style>
                {`
                    .dropdown-button:hover .dropdown-content {
                        position: absolute;
                        opacity: 1;
                        visibility: visible;
                        pointer-events: auto;
                    }
                `}
            </style>
        </Box>
    );
}