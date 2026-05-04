import {
    TypographyVariant,
    Typography,
    TextField,
    Box,
    FormControlLabel,
    useTheme,
    SxProps,
    Theme,
} from "@mui/material"
import React, { useState, useCallback } from "react"
import Tooltip from "./Tooltip"

export type LabeledNumberInputProps = {
    label_props: { bold?: boolean, variant: TypographyVariant, sx?: SxProps<Theme> },
    input_props: { variant: TypographyVariant },
    tooltip: string,
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    on_change: (v: number) => void,
    sx?: SxProps<Theme>,
}

export default function LabeledNumberInput({
    label_props,
    input_props,
    tooltip,
    label,
    value,
    min,
    max,
    step,
    on_change,
    sx,
}: LabeledNumberInputProps): React.ReactElement {
    const [input_value, set_input_value] = useState<string>(value.toFixed(2));
    const [error, set_error] = useState<string | null>(null);
    const theme = useTheme();
    const label_font_size = theme.typography[input_props.variant].fontSize;

    const validate = useCallback(
        (raw: string): number | null => {
            let parsed = Number(raw)
            if (isNaN(parsed)) 
                return null;
            
            if (parsed < min)
                return min;

            if (parsed > max)
                return max;

            parsed = Math.round(parsed / step) * step;
            
            return parsed
        },
        [min, max, step]
    )

    const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        set_input_value(raw)

        const parsed = validate(raw)
        if (parsed === null) {
            set_error(`Must be a number between ${min} and ${max}`)
        } else {
            set_error(null)
            on_change(parsed)
        }
    }

    const handle_blur = () => {
        const parsed = validate(input_value)
        if (parsed === null) 
        {
            set_input_value(value.toFixed(2))
            set_error(null)
        }
        else
        {
            set_input_value(parsed.toFixed(2))
        }
    }

    return (
        <Tooltip tooltip={tooltip}>
            <FormControlLabel
                labelPlacement="start"
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
                    <TextField
                        value={input_value}
                        onChange={handle_change}
                        onBlur={handle_blur}
                        error={!!error}
                        helperText={error}
                        type="number"
                        size="small"
                        fullWidth
                        slotProps={{
                            htmlInput: { min, max, step },
                            input: {
                                sx: { fontSize: label_font_size },
                            },
                        }}
                    />
                }
                sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    ml: 0,
                    gap: theme.spacing(1),
                    ...sx,
                }}
            />
        </Tooltip>
    )
}