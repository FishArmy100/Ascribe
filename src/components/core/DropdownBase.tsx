import { Box, Paper, useTheme } from "@mui/material";
import React from "react"
import ImageButton from "./ImageButton";
import TextButton from "./TextButton";
import { DROPDOWN_PADDING } from "./ImageDropdown";

export type DropdownButton = {
    type: "image",
    src: string,
    tooltip: string,
}| {
    type: "text",
    text: string,
    tooltip: string,
}

export type DropdownBaseProps = {
    button: DropdownButton,
    is_open: boolean,
    on_click: () => void,
    children: React.ReactNode,
}

export default function DropdownBase({
    button,
    is_open,
    on_click,
    children,
}: DropdownBaseProps): React.ReactElement
{
    const theme = useTheme();

    let button_element: React.ReactElement;
    if (button.type === "image")
    {
        button_element = (
            <ImageButton
                image={button.src}
                tooltip={button.tooltip}
                active={is_open}
                on_click={on_click}
            />
        )
    }
    else
    {
        button_element = (
            <TextButton 
                text={button.text}
                tooltip={button.tooltip}
                active={is_open}
                on_click={on_click}
            />
        )
    }

    return (
        <Box
            sx={{
                position: "relative"
            }}
            className="dropdown-button"
        >
            {button_element}
            <Paper
                sx={{
                    position: "absolute",
                    top: `100%`,
                    left: (theme) => theme.spacing(-DROPDOWN_PADDING),
                    padding: DROPDOWN_PADDING,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease"
                }}
                className="dropdown-content"
            >
                {children}
            </Paper>
            <style>
                {`
                    .dropdown-button:hover .dropdown-content {
                        position: absolute;
                        opacity: 1;
                        visibility: visible;
                        pointer-events: auto;
                    }
                    .dropdown-content::before {
                        content: "";
                        position: absolute;
                        top: ${theme.spacing(1)};
                        left: 0;
                        right: 0;
                        height: ${theme.spacing(1)};
                    }
                `}
            </style>
        </Box>
    );
}