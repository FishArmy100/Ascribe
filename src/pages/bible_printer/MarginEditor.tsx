import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import { Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { use_bible_printer_strings } from "./bible_printer_strings";
import LabeledNumberInput from "@components/core/LabeledNumberInput";
import { Margin } from "@interop/printing";
import { use_deep_copy } from "@utils/index";
import OptionGroup from "@components/core/OptionGroup";

export type MarginEditorProps = {
    margin: Margin,
    on_change: (margin: Margin) => void,
}

export default function MarginEditor({
    margin,
    on_change,
}: MarginEditorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const copy = use_deep_copy();
    const theme = useTheme();

    return (
        <OptionGroup
            label={strings.edit_margin_label}
        >
            <Stack
                direction="column"
                gap={theme.spacing(1)}
            >
                {/* Top */}
                <MarginValueEditor
                    value={margin.top}
                    on_change={v => {
                        const m = copy(margin);
                        m.top = v;
                        on_change(m);
                    }}
                    tooltip={strings.edit_margin_value_tooltip("top")}
                    label={strings.edit_margin_value_label("top")}
                />
                {/* Bottom */}
                <MarginValueEditor
                    value={margin.bottom}
                    on_change={v => {
                        const m = copy(margin);
                        m.bottom = v;
                        on_change(m);
                    }}
                    tooltip={strings.edit_margin_value_tooltip("bottom")}
                    label={strings.edit_margin_value_label("bottom")}
                />
                {/* Left */}
                <MarginValueEditor
                    value={margin.left}
                    on_change={v => {
                        const m = copy(margin);
                        m.left = v;
                        on_change(m);
                    }}
                    tooltip={strings.edit_margin_value_tooltip("left")}
                    label={strings.edit_margin_value_label("left")}
                />
                {/* Right */}
                <MarginValueEditor
                    value={margin.right}
                    on_change={v => {
                        const m = copy(margin);
                        m.right = v;
                        on_change(m);
                    }}
                    tooltip={strings.edit_margin_value_tooltip("right")}
                    label={strings.edit_margin_value_label("right")}
                />
            </Stack>
        </OptionGroup>
    )
}

type MarginValueEditorProps = {
    value: number,
    on_change: (v: number) => void,
    tooltip: string,
    label: string,
}

function MarginValueEditor({
    value,
    on_change,
    tooltip,
    label
}: MarginValueEditorProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <LabeledNumberInput 
            label_props={{ 
                variant: "body1", 
                bold: true, 
                sx: {
                    minWidth: theme.spacing(12)
                } 
            }}
            input_props={{ variant: "body1" }}
            tooltip={tooltip}
            label={label}
            value={value}
            min={0}
            max={2}
            step={0.05}
            on_change={v => on_change(v * 72)}
        />
    )
}