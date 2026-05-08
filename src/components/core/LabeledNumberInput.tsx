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
import React, { useState, useCallback, useEffect } from "react"
import Tooltip from "./Tooltip"

export type LabeledNumberInputProps = {
    label_props?: { bold?: boolean, variant?: TypographyVariant, sx?: SxProps<Theme> },
    input_props?: { variant?: TypographyVariant },
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
    label_props: { bold = true, variant: label_variant = "body1", sx: label_sx } = {},
    input_props = { variant: "body1" },
    tooltip,
    label,
    value,
    min,
    max,
    step,
    on_change,
    sx,
}: LabeledNumberInputProps): React.ReactElement {
    const precision = Math.max(0, -Math.floor(Math.log10(step)));
    const [input_value, set_input_value] = useState<string>(value.toFixed(precision));
    const [error, set_error] = useState<string | null>(null);
    const theme = useTheme();
    const label_font_size = theme.typography[input_props.variant ?? "body1"].fontSize;

    useEffect(() => {
        set_input_value(value.toFixed(precision));
    }, [value, precision]);

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
        if (parsed === null) 
        {
            set_error(`Must be a number between ${min} and ${max}`)
        } 
        else 
        {
            set_error(null);
        }
    }

    const handle_blur = () => {
        const parsed = validate(input_value)
        if (parsed === null)
        {
            set_input_value(value.toFixed(precision))
            set_error(null)
        }
        else
        {
            set_input_value(parsed.toFixed(precision));
            on_change(parsed)
        }
    }

    return (
        <Tooltip tooltip={tooltip}>
            <FormControlLabel
                labelPlacement="start"
                label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography
                            variant={label_variant}
                            component="span"
                            sx={{
                                fontWeight: bold ? "bold" : undefined,
                                whiteSpace: "nowrap",
                                ...label_sx,
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
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        error={!!error}
                        helperText={error}
                        type="number"
                        size="small"
                        fullWidth
                        slotProps={{
                            input: {
                                sx: { fontSize: label_font_size },
                            },
                            htmlInput: {
                                step: step,
                                min,
                                max,
                                onInvalid: (e: React.InputEvent<HTMLInputElement>) => e.preventDefault(),
                            }
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