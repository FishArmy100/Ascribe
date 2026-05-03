import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { Font, FONT_NAMES, FONT_VALUES, PAGE_NUMBER_NAMES, PAGE_NUMBER_TYPES, PageNumbers, PageNumberType } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"

export type PageNumberTypeSelectorProps = {
    value: PageNumberType,
    on_change: (value: PageNumberType) => void,
}

export default function PageNumberTypeSelector({
    value,
    on_change,
}: PageNumberTypeSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return PAGE_NUMBER_TYPES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<PageNumberType>[] => (
        PAGE_NUMBER_TYPES.map(v => ({
            text: PAGE_NUMBER_NAMES[v],
            tooltip: strings.select_page_numbers_type_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<PageNumberType>
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
            tooltip={strings.page_numbers_type_dropdown_tooltip} 
            label={strings.page_numbers_type_dropdown_label + ":"}        
        />
    )
}