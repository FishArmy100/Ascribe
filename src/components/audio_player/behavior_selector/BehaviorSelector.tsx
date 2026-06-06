import { BibleReaderBehavior, RepeatBehavior } from "@interop/reader";
import { Stack, useTheme } from "@mui/material";
import React, { useState } from "react";
import { use_behavior_selector_strings } from "./behavior_selector_strings";
import RepeatBehaviorSelector from "./RepeatBehaviorSelector";

export type BehaviorSelectorProps = {
    behavior: BibleReaderBehavior,
    on_change: (behavior: BibleReaderBehavior) => void,
}

export default function BehaviorSelector({
    behavior,
    on_change,
}: BehaviorSelectorProps): React.ReactElement
{
    const theme = useTheme();
    const strings = use_behavior_selector_strings();
    const [repeat_behavior, set_repeat_behavior] = useState<RepeatBehavior>({
        type: "count",
        count: 1,
    })

    return (
        <Stack 
            direction="row"
            sx={{
                backgroundColor: theme.palette.background.default,
                padding: theme.spacing(0.5)
            }}
        >
            <RepeatBehaviorSelector 
                behavior={repeat_behavior}
                on_change={set_repeat_behavior}
            />
        </Stack>
    )
}