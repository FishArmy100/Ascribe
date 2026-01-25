import { Button, SxProps, Theme, Typography, useTheme } from "@mui/material";
import React from "react";
import Tooltip from "./Tooltip";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING, BUTTON_SIZE } from "./ImageButton";

export type TextButtonProps = {
    text: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    on_click?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    sx?: SxProps<Theme>,
}

export default function TextButton({
    text,
    tooltip,
    disabled,
    active,
    on_click,
    sx,
}: TextButtonProps): React.ReactElement
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
                        width: "fit-content",
                        height: (theme) => theme.spacing(BUTTON_SIZE),
                        minWidth: "fit-content",
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
                    <Typography
                        variant="body1"
                        textAlign="center"
                        sx={{
                            color: theme.palette.common.black,
                            opacity: disabled ? 0.5 : 1,
                            filter: disabled ? "grayscale(100%)" : "none"
                        }}
                    >
                        {text}
                    </Typography>
                </Button>
            </span>
        </Tooltip>
    );
}