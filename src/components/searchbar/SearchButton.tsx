import React from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { use_settings } from "../contexts/SettingsContext";
import { get_button_border_radius, get_button_size } from "../ImageButton";
import * as images from "../../assets";


const SEARCH_BUTTON_TOOLTIP = "Search"

export type SearchButtonProps = {
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export default function SearchButton({
    on_click: onClick,
}: SearchButtonProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const button_size = get_button_size(settings);
    const border_size = `${get_button_border_radius(settings)}px`;

    return (
        <Tooltip 
            disableInteractive
            followCursor
            placement="bottom-start"
            title={SEARCH_BUTTON_TOOLTIP}
            enterDelay={500}
            disableHoverListener={false}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: "offset",
                            options: {
                                offset: [8, 8], // x, y distance from the anchor
                            },
                        },
                    ],
                },
            }}
        >
            <Button
                onClick={onClick}
                sx={{
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: `0px ${border_size} ${border_size} 0px`,
                    borderWidth: `${1}px`,
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: `${button_size}px`,
                    height: `${button_size}px`,
                    minWidth: `${button_size}px`,
                    minHeight: `${button_size}px`,
                    padding: `${5 * settings.ui_scale}px`,

                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
                    }
                }}

            >
                <img 
                    src={images.magnifying_glass} 
                    alt="" 
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                        boxSizing: "border-box",
                    }}
                />
            </Button>
        </Tooltip>
    )
}