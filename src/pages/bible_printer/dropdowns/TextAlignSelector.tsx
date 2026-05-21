import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { Font, FONT_VALUES, TEXT_ALIGN_NAMES, TEXT_ALIGN_VALUES, TextAlign } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"

export type TextAlignSelectorProps = {
    value: TextAlign,
    on_change: (value: TextAlign) => void,
}

export default function TextAlignSelector({
    value,
    on_change,
}: TextAlignSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return TEXT_ALIGN_VALUES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<TextAlign>[] => (
        TEXT_ALIGN_VALUES.map(v => ({
            text: TEXT_ALIGN_NAMES[v],
            tooltip: strings.select_text_align_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<TextAlign>
            label_props={{
                variant: "body1",
                bold: true
            }} dropdown_props={{
                variant: "body2",
                bold: true
            }} 
            selected={selected} 
            options={options} 
            on_change={on_change} 
            tooltip={strings.text_align_dropdown_tooltip} 
            label={strings.text_align_dropdown_label + ":"}        
        />
    )
}