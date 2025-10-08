import React from "react";
import { Button, useTheme } from "@mui/material";
import { use_settings } from "../providers/SettingsProvider";
import * as images from "../../assets";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "../core/ImageButton";
import Tooltip from "../core/Tooltip";


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

    return (
        <Tooltip
            tooltip={SEARCH_BUTTON_TOOLTIP}
        >
            <Button
                onClick={onClick}
                sx={{
                    backgroundColor: theme.palette.primary.light,
                    
                    borderTopRightRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderBottomRightRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderWidth: (theme) => theme.spacing(1 / 8),
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: (theme) => theme.spacing(BUTTON_SIZE),
                    height: (theme) => theme.spacing(BUTTON_SIZE),
                    minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                    minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                    padding: (theme) => theme.spacing(BUTTON_PADDING),

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