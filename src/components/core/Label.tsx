import { Box, FormControlLabel, SxProps, Theme, Typography, TypographyVariant } from "@mui/material"
import React from "react"
import WrapIf from "./WrapIf"
import Tooltip from "./Tooltip"

export type LabelProps = {
    label: string,
    tooltip?: string
    label_props?: { bold?: boolean, variant?: TypographyVariant, sx?: SxProps<Theme> }
    children: React.ReactNode,
}

export default function Label({
    label,
    tooltip,
    label_props = { bold: true, variant: "body1" },
    children
}: LabelProps): React.ReactElement
{
    return (
        <FormControlLabel
            sx={{ width: "fit-content", m: 0 }}
            label={
                <WrapIf 
                    cond={tooltip !== undefined} 
                    wrapper={Tooltip} 
                    props={{ tooltip: tooltip! }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography
                            variant={label_props?.variant}
                            component="span"
                            sx={{
                                fontWeight: label_props.bold ? "bold" : undefined,
                                whiteSpace: "nowrap",
                                ...label_props.sx,
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                </WrapIf>
            }
            control={
                <Box sx={{ display: "contents" }}>{children}</Box>
            }
            labelPlacement="start"
        />
    )
}