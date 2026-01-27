import React from "react";
import { Button, useTheme } from "@mui/material";
import { use_settings } from "../providers/SettingsProvider";
import { AppSettings } from "../../interop/settings";
import { SxProps } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
import Tooltip from "./Tooltip";

export const BUTTON_SIZE = 4;
export const BUTTON_BORDER_RADIUS = 0.75;
export const BUTTON_PADDING = 3 / 8;

export type ImageButtonProps = {
    image: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    sx?: SxProps<Theme>,
}

export default function ImageButton({
    image,
    tooltip,
    disabled,
    active,
    on_click,
    sx,
}: ImageButtonProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <Tooltip
            tooltip={tooltip}
        >
            <span>
                <Button
                    disabled={disabled}
                    onClick={on_click}
                    sx={{
                        backgroundColor: active ? theme.palette.secondary.main : theme.palette.primary.light,
                        borderRadius: (theme) => theme.spacing(BUTTON_BORDER_RADIUS),
                        borderWidth: (theme) => theme.spacing(1 / 8),
                        borderColor: theme.palette.divider,
                        borderStyle: "solid",
                        width: (theme) => theme.spacing(BUTTON_SIZE),
                        height: (theme) => theme.spacing(BUTTON_SIZE),
                        minWidth: (theme) => theme.spacing(BUTTON_SIZE),
                        minHeight: (theme) => theme.spacing(BUTTON_SIZE),
                        cursor: disabled ? "not-allowed" : "pointer",
                        padding: BUTTON_PADDING,
                        "&.Mui-disabled": {
                            cursor: "not-allowed",
                            pointerEvents: "auto"
                        },
                        ...sx,
                    }}
                >
                    <img
                        src={image}
                        alt=""
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            boxSizing: "border-box",
                            opacity: disabled ? 0.5 : 1,
                            filter: disabled ? "grayscale(100%)" : "none"
                        }}
                    />
                </Button>
            </span>
        </Tooltip>
    )
}