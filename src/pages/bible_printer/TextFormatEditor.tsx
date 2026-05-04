import OptionGroup from "@components/core/OptionGroup";
import WrapIf from "@components/core/WrapIf";
import { TextFormat } from "@interop/printing";
import React, { useCallback } from "react";
import { use_deep_copy } from "@utils/index";
import PrintFontSelector from "./dropdowns/PrintFontSelector";
import LabeledNumberInput from "@components/core/LabeledNumberInput";
import { use_bible_printer_strings } from "./bible_printer_strings";
import CheckboxWithLabel from "@components/core/CheckboxWithLabel";
import LabeledCheckbox from "@components/core/LabeledCheckbox";
import { Box, useTheme } from "@mui/material";

export type TextFormatEditorProps = {
    value: TextFormat,
    on_change: (value: TextFormat) => void,
    label: string | null,
}

export default function TextFormatEditor({
    value,
    on_change,
    label
}: TextFormatEditorProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const strings = use_bible_printer_strings();
    const theme = useTheme();

    const update_value = useCallback((f: (v: TextFormat) => TextFormat) => {
        const copy = deep_copy(value);
        on_change(f(copy));
    }, [value, on_change])

    return (
        <WrapIf 
            cond={label !== null}
            wrapper={OptionGroup}
            props={{ label: label! }}
        >
            {/* Font Selector */}
            <PrintFontSelector 
                value={value.font}
                on_change={f => update_value(tf => {
                    tf.font = f;
                    return tf;
                })}
                label_sx={{
                    minWidth: theme.spacing(10)
                }}
            />

            {/* Font Size Input */}
            <LabeledNumberInput 
                label_props={{ 
                    variant: "body1", 
                    bold: true, 
                    sx: { minWidth: theme.spacing(12) } 
                }}
                input_props={{ variant: "body1" }}
                label={strings.font_size_editor_label}
                tooltip={strings.font_size_editor_tooltip}
                value={value.font_size}
                min={5}
                max={400}
                step={0.25}
                on_change={s => update_value(v => {
                    v.font_size = s;
                    return v;
                })}
                sx={{
                    mt: 1,
                }}
            />

            {/* Bold Toggle */}
            <LabeledCheckbox 
                label_props={{ 
                    variant: "body1", 
                    bold: true, 
                    sx: { 
                        minWidth: theme.spacing(10),
                        textAlign: "left",
                    } 
                }}
                label={strings.bold_toggle_label}
                tooltip={strings.bold_toggle_tooltip}
                value={value.bold}
                on_change={bold => update_value(v => {
                    v.bold = bold;
                    return v;
                })}
            />

            {/* Italic Toggle */}
            <LabeledCheckbox 
                label_props={{ 
                    variant: "body1", 
                    bold: true, 
                    sx: { minWidth: theme.spacing(10) } 
                }}
                label={strings.italic_toggle_label}
                tooltip={strings.italic_toggle_tooltip}
                value={value.italic}
                on_change={italic => update_value(v => {
                    v.italic = italic;
                    return v;
                })}
            />
        </WrapIf>
    )
}