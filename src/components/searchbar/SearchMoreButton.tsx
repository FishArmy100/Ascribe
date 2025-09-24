import React from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import { use_settings } from "../SettingsContext";
import { get_button_border_radius, get_button_size } from "../ImageButton";
import * as images from "../../assets";


const SEARCH_MORE_BUTTON_TOOLTIP = "More search options"

export type SearchMoreButtonProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export default function SearchMoreButton({
    onClick,
}: SearchMoreButtonProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const button_size = get_button_size(settings);
    const border_size = `${get_button_border_radius(settings)}px`

    return (
        <Tooltip 
            disableInteractive
            followCursor
            placement="bottom-start"
            title={SEARCH_MORE_BUTTON_TOOLTIP}
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
                    borderRadius: `${border_size} 0px 0px ${border_size}`,
                    borderWidth: `${1}px`,
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: `${button_size / 2}px`,
                    height: `${button_size}px`,
                    minWidth: `${button_size / 2}px`,
                    minHeight: `${button_size}px`,
                    padding: `${5 * settings.ui_scale}px`,

                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
                    }
                }}

            >
                <img 
                    src={images.vertical_dots} 
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