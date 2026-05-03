import { Box, FormControlLabel, Typography, TypographyVariant, useTheme } from "@mui/material"
import TextSelectDropdown, { TextSelectDropdownOption } from "./TextSelectDropdown"
import React from "react"
import Tooltip from "./Tooltip";

export type LabeledTextSelectDropdownProps<T> = {
    label_props: { variant: TypographyVariant, bold?: boolean },
    dropdown_props: { variant: TypographyVariant, bold?: boolean },
    selected: number,
    options: TextSelectDropdownOption<T>[],
    on_change: (v: T) => void,
    tooltip: string,
    label: string, 
}

export default function LabeledTextSelectDropdown<T>({
    label_props,
    dropdown_props,
    selected,
    options,
    on_change,
    tooltip,
    label,
}: LabeledTextSelectDropdownProps<T>): React.ReactElement
{
    const theme = useTheme();

    return (
        <FormControlLabel
                labelPlacement="start"
                label={
                    <Tooltip tooltip={tooltip}>
                        <Typography
                                    variant={label_props.variant}
                                    component="span"
                                    sx={{
                                        display: "flex",
                                        alignItems: 'center',
                                        mr: theme.spacing(1),
                                        fontWeight: label_props.bold ? "bold" : undefined,
                                    }}
                                >
                                    {label}
                                </Typography>
                    </Tooltip>
                }
                control={
                    <TextSelectDropdown<T>
                        tooltip={null}
                        selected={selected}
                        on_select={v => on_change(v)}
                        options={options}
                        variant={dropdown_props.variant}
                        bold={dropdown_props.bold}
                    />
                }
            />
    )
}