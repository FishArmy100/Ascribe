
import { Slider as MuiSlider, useTheme } from "@mui/material"
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
}

export default function Slider({
    value,
    max,
    min,
    step,
    tooltip,
    on_change,
    on_commit,
    readonly
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
                        width: theme.spacing(3),
                        height: theme.spacing(3),
                        '&:focus, &:hover, &.Mui-focusVisible, &.Mui-active': {
                            boxShadow: 'none',
                        },
                        '&:before': {
                            display: 'none',
                        },
                    },
                    "& .MuiSlider-track": {
                        backgroundColor: theme.palette.grey[100],
                    },
                    "& .MuiSlider-rail": {
                        backgroundColor: theme.palette.grey[100],
                    }
                }}
            />
        </Tooltip>
    )
}