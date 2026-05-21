import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { BOOK_FORMAT_NAMES, BOOK_FORMAT_VALUES, BookFormat, Font, FONT_NAMES, FONT_VALUES } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/system"

export type BookFormatSelectorProps = {
    value: BookFormat,
    on_change: (value: BookFormat) => void,
    label_sx?: SxProps<Theme>
}

export default function BookFormatSelector({
    value,
    on_change,
    label_sx,
}: BookFormatSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return BOOK_FORMAT_VALUES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<BookFormat>[] => (
        BOOK_FORMAT_VALUES.map(v => ({
            text: BOOK_FORMAT_NAMES[v],
            tooltip: strings.select_book_format_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<BookFormat>
            label_props={{
                variant: "body1",
                bold: true,
                sx: label_sx,

            }} dropdown_props={{
                variant: "body2",
                bold: true
            }} 
            selected={selected} 
            options={options} 
            on_change={on_change} 
            tooltip={strings.book_format_dropdown_tooltip} 
            label={strings.book_format_dropdown_label + ":"}        
        />
    )
}