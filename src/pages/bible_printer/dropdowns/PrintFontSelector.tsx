import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { Font, FONT_NAMES, FONT_VALUES } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"

export type PrintFontSelectorProps = {
    value: Font,
    on_change: (value: Font) => void,
}

export default function PrintFontSelector({
    value,
    on_change,
}: PrintFontSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return FONT_VALUES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<Font>[] => (
        FONT_VALUES.map(v => ({
            text: FONT_NAMES[v],
            tooltip: strings.select_font_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<Font>
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
            tooltip={strings.font_dropdown_tooltip} 
            label={strings.font_dropdown_label + ":"}        
        />
    )
}