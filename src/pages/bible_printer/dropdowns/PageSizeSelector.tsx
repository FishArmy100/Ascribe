import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { Font, FONT_VALUES, PAGE_SIZE_NAMES, PAGE_SIZE_VALUES, PageSize, TEXT_ALIGN_NAMES, TEXT_ALIGN_VALUES, TextAlign } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"

export type PageSizeSelectorProps = {
    value: PageSize,
    on_change: (value: PageSize) => void,
}

export default function PageSizeSelector({
    value,
    on_change,
}: PageSizeSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return PAGE_SIZE_VALUES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<PageSize>[] => (
        PAGE_SIZE_VALUES.map(v => ({
            text: PAGE_SIZE_NAMES[v],
            tooltip: strings.select_page_size_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<PageSize>
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
            tooltip={strings.page_size_dropdown_tooltip} 
            label={strings.page_size_dropdown_label + ":"}        
        />
    )
}