
import { Slider as MuiSlider, SxProps, Theme, useTheme } from "@mui/material"
import { SystemStyleObject } from "@mui/system";
import Tooltip from "./Tooltip"

export type SliderProps = {
    value: number,
    max: number,
    min: number,
    step?: number,
    tooltip: string,
    on_change?: (n: number) => void,
    on_commit?: (n: number) => void,
    readonly?: boolean,
    sx?: SxProps<Theme>,
    slider_sx?: SystemStyleObject<Theme>,
    rail_sx?: SystemStyleObject<Theme>
}

export default function Slider({
    value,
    max,
    min,
    step,
    tooltip,
    on_change,
    on_commit,
    readonly,
    sx,
    slider_sx,
    rail_sx,
}: SliderProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <Tooltip tooltip={tooltip}>
            <MuiSlider
                value={value}
                max={max}
                min={min}
                step={step}
                onChange={(_e, value) => (!readonly) && on_change?.(value)}
                onChangeCommitted={(_e, value) => (!readonly) && on_commit?.(value)}
                sx={{
                    ml: theme.spacing(1),
                    mr: theme.spacing(1),
                    cursor: readonly ? "default" : "pointer",

                    "& .MuiSlider-thumb": {
                        backgroundColor: theme.palette.primary.light,
                        width: theme.spacing(2.5),
                        height: theme.spacing(2.5),
                        '&:focus, &:hover, &.Mui-focusVisible, &.Mui-active': {
                            boxShadow: 'none',
                        },
                        '&:before': {
                            display: 'none',
                        },
                    },
                    "& .MuiSlider-track": {
                        // border: `${theme.spacing(1 / 8)} solid ${theme.palette.divider}`
                        height: theme.spacing(0.5),
                        ...slider_sx
                    },
                    "& .MuiSlider-rail": {
                        backgroundColor: theme.palette.primary.main,
                        height: theme.spacing(0.5),
                        ...rail_sx
                    },
                    ...sx,
                }}
            />
        </Tooltip>
    )
}