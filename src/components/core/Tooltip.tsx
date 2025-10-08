import React from "react";
import { Tooltip as MuiTooltip } from "@mui/material";

export type TooltipProps = {
    tooltip: string,
    children: React.ReactElement,
}

export default function Tooltip({
    tooltip,
    children,
}: TooltipProps): React.ReactElement
{
    return (
        <MuiTooltip 
            disableInteractive
            followCursor
            placement="bottom-start"
            title={tooltip}
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
            {children}
        </MuiTooltip>
    )
}