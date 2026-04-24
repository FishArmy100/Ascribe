import { play_sfx, Sfx } from "@interop/sfx";
import React, { useCallback } from "react";
import Tooltip from "./Tooltip";
import { FormControlLabel, Switch, Typography } from "@mui/material";

export type LabeledToggleSwitchProps = {
    label: string,
    tooltip: string,
    value: boolean,
    on_change: (value: boolean) => void,
    sfx?: Sfx | "none",
}

export default function LabeledToggleSwitch({
    label,
    tooltip,
    value,
    on_change,
    sfx = "click",
}: LabeledToggleSwitchProps): React.ReactElement
{
    const handle_change = useCallback((e: React.ChangeEvent, value: boolean) => {
        if (sfx && sfx !== "none")
        {
            play_sfx(sfx)
        }
        on_change(value);
    }, [on_change, sfx]);

    return (
        <Tooltip tooltip={tooltip}>
            <FormControlLabel 
                label={
                    <Typography
                        fontWeight="bold"
                    >
                        {label}
                    </Typography>
                }
                control={
                    <Switch 
                        checked={value} 
                        onChange={handle_change}
                    />
                }
                sx={{
                    width: "fit-content"
                }}
            />
        </Tooltip>
    )
}