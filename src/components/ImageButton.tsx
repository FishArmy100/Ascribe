import React from "react";
import { Button, Tooltip } from "@mui/material";

export type ImageButtonProps = {
    image: string,
    tooltip: string,
    disabled?: boolean,
    active?: boolean,
    onClick: () => void,
}

export default function ImageButton({
    image,
    tooltip,
    disabled,
    active,
    onClick,
}: ImageButtonProps): React.ReactElement
{
    const TEST_SIZE = 48;
    return (
        <Tooltip title={tooltip}>
            <Button
                disabled={disabled}
                onClick={onClick}
                sx={{
                    width: `${TEST_SIZE}px`,
                    height: `${TEST_SIZE}px`,
                    padding: `0px`,
                    minWidth: `${TEST_SIZE}px`,
                    minHeight: `${TEST_SIZE}px`,
                    cursor: disabled ? "not-allowed" : "pointer",

                    "&.Mui-disabled": {
                        cursor: "not-allowed",
                        pointerEvents: "auto"
                    }
                }}

            >
                <img 
                    src={image} 
                    alt="" 
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                        boxSizing: "border-box",
                        opacity: disabled ? 0.5 : 1,
                        filter: disabled ? "grayscale(100%)" : "none"
                    }}
                />
            </Button>
        </Tooltip>
    )
}