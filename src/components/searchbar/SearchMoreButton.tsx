import React from "react";
import { Button, useTheme } from "@mui/material";
import { use_settings } from "../providers/SettingsProvider";
import * as images from "../../assets";
import Tooltip from "../core/Tooltip";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "../core/ImageButton";


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

    return (
        <Tooltip 
            tooltip={SEARCH_MORE_BUTTON_TOOLTIP}
        >
            <Button
                onClick={onClick}
                sx={{
                    backgroundColor: theme.palette.primary.light,
                    
                    borderTopLeftRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderBottomLeftRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderWidth: (theme) => theme.spacing(1 / 8),
                    borderColor: theme.palette.grey[700],
                    borderStyle: "solid",
                    width: (theme) => theme.spacing(BUTTON_SIZE / 2),
                    height: (theme) => theme.spacing(BUTTON_SIZE),
                    minWidth: (theme) => theme.spacing(BUTTON_SIZE / 2),
                    minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                    padding: BUTTON_PADDING,

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