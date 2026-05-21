import { play_sfx, Sfx } from "@interop/sfx";
import { Box, Checkbox, FormControlLabel, SxProps, Theme, Typography, TypographyVariant } from "@mui/material";
import React from "react";
import Tooltip from "./Tooltip";

export type LabeledCheckboxProps = {
    label_props: { variant: TypographyVariant, bold?: boolean, sx?: SxProps<Theme> }
    tooltip: string,
    value: boolean,
    on_change: (v: boolean) => void,
    label: string,
    sfx?: Sfx | "none",
}

export default function LabeledCheckbox({
    label_props,
    tooltip,
    value,
    on_change,
    label,
    sfx = "click",
}: LabeledCheckboxProps): React.ReactElement
{
    return (
        <Box>
            <Tooltip
                tooltip={tooltip}
            >
                <FormControlLabel
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
                        <Checkbox
                            checked={value}
                            onChange={e => {
                                if (sfx !== "none") 
                                    play_sfx(sfx);
                                
                                on_change(e.target.checked)
                            }}
                        />
                    }
                    labelPlacement="start"
                />
            </Tooltip>
        </Box>
    )
}