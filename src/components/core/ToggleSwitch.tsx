import { play_sfx, Sfx } from "@interop/sfx";
import React, { useCallback } from "react";
import Tooltip from "./Tooltip";
import { Switch } from "@mui/material";

export type ToggleSwitchProps = {
    tooltip: string,
    value: boolean,
    on_change: (value: boolean) => void,
    sfx?: Sfx | "none",
}

export default function ToggleSwitch({
    tooltip,
    value,
    on_change,
    sfx = "click",
}: ToggleSwitchProps): React.ReactElement
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
            <Switch 
                checked={value} 
                onChange={handle_change}
            />
        </Tooltip>
    )
}