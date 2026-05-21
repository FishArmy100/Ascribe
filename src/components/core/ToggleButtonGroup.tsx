import { SxProps, TypographyVariant } from "@mui/material"
import { Stack, Theme, useTheme } from "@mui/system"
import React from "react"
import TextButton from "./TextButton"
import { Sfx } from "@interop/sfx"

export type ToggleButtonGroupOption = {
    label: string,
    tooltip: string,
}

export type ToggleButtonGroupProps = {
    options: ToggleButtonGroupOption[],
    selected: number,
    on_selected: (i: number) => void,
    sfx?: Sfx | "none",
    sx?: SxProps<Theme>,
}

export default function ToggleButtonGroup({
    options,
    selected,
    on_selected,
    sfx,
    sx
}: ToggleButtonGroupProps): React.ReactElement
{
    const theme = useTheme();

    return (
        <Stack 
            direction="row"
            sx={sx}
        >
            {options.map((o, i) => {
                const left_flat = i !== 0;
                const right_flat = i !== options.length - 1
                return (
                    <span key={i} style={{ flex: 1, display: "flex" }}>
                        <TextButton
                            text_props={{
                                variant: "body1",
                                bold: true,
                            }}
                            text={o.label}
                            tooltip={o.tooltip}
                            on_click={() => on_selected(i)}
                            active={i === selected}
                            sfx={sfx}
                            sx={{
                                flex: 1,
                                borderTopRightRadius: right_flat ? 0 : theme.spacing(1),
                                borderBottomRightRadius: right_flat ? 0 : theme.spacing(1),
                                borderTopLeftRadius: left_flat ? 0 : theme.spacing(1),
                                borderBottomLeftRadius: left_flat ? 0 : theme.spacing(1),
                                minWidth: "unset !important",
                                width: "100%"
                            }}
                        />
                    </span>
                )
            })}
        </Stack>
    )
}