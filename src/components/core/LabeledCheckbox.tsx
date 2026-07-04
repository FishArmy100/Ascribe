import { play_sfx, Sfx } from "@interop/sfx";
import { Box, Checkbox, FormControlLabel, SxProps, Theme, Typography, TypographyVariant, useTheme } from "@mui/material";
import React from "react";
import Tooltip from "./Tooltip";

export type LabeledCheckboxProps = {
    label_props: { variant: TypographyVariant, bold?: boolean, sx?: SxProps<Theme> }
    checkbox_props?: { sx?: SxProps<Theme> }
    tooltip: string,
    value: boolean,
    on_change: (v: boolean) => void,
    label: string,
    sfx?: Sfx | "none",
}

export default function LabeledCheckbox({
    label_props,
    checkbox_props,
    tooltip,
    value,
    on_change,
    label,
    sfx = "click",
}: LabeledCheckboxProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <Box>
            <Tooltip
                tooltip={tooltip}
            >
                <FormControlLabel
                    labelPlacement="start"
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        m: 0,
                        gap: theme.spacing(1),
                    }}
                    label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography
                                variant={label_props.variant}
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
                    }
                    control={
                        <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                            <Checkbox
                                checked={value}
                                onChange={e => {
                                    if (sfx !== "none") 
                                        play_sfx(sfx);
                                    
                                    on_change(e.target.checked)
                                }}
                                sx={checkbox_props?.sx}
                            />
                        </Box>
                    }
                />
            </Tooltip>
        </Box>
    )
}