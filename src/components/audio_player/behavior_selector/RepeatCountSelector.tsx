import TextSelectDropdown, { TextSelectDropdownOption } from "@components/core/TextSelectDropdown";
import React, { useMemo } from "react";
import { useTheme } from "@mui/material";

export type RepeatCountSelectorProps = {
    count: number;
    onSelect: (count: number) => void;
    maxCount?: number;
};

export default function RepeatCountSelector({
    count,
    onSelect,
    maxCount = 10,
}: RepeatCountSelectorProps): React.ReactElement {
    const theme = useTheme();

    const options = useMemo((): TextSelectDropdownOption<number>[] => {
        return Array.from({ length: maxCount }, (_, i) => i + 1).map((i) => ({
            text: `${i}x`,
            tooltip: null,
            value: i,
        }));
    }, [maxCount]);

    const selectedIndex = Math.max(0, count - 1);

    return (
        <TextSelectDropdown
            options={options}
            on_select={onSelect}
            tooltip={null}
            selected={selectedIndex}
            variant="body2"
            button_sx={{
                padding: theme.spacing(0.5),
            }}
            option_sx={{
                padding: theme.spacing(0.5),
            }}
        />
    );
}
