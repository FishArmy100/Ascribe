import { TextSelectDropdownOption } from "@components/core/TextSelectDropdown"
import { VERSE_NUMBER_FORMAT_TYPES, VERSE_NUMBER_FORMAT_TYPE_NAMES, VerseNumberFormatType } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "../bible_printer_strings"
import LabeledTextSelectDropdown from "@components/core/LabeledTextSelectDropdown"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/system"

export type VerseNumberFormatTypeSelectorProps = {
    value: VerseNumberFormatType,
    on_change: (value: VerseNumberFormatType) => void,
    label_sx?: SxProps<Theme>
}

export default function VerseNumberFormatTypeSelector({
    value,
    on_change,
    label_sx,
}: VerseNumberFormatTypeSelectorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const selected = useMemo(() => {
        return VERSE_NUMBER_FORMAT_TYPES.indexOf(value);
    }, [value]);

    const options = useMemo((): TextSelectDropdownOption<VerseNumberFormatType>[] => (
        VERSE_NUMBER_FORMAT_TYPES.map(v => ({
            text: VERSE_NUMBER_FORMAT_TYPE_NAMES[v],
            tooltip: strings.select_verse_number_format_type_dropdown_tooltip(v),
            value: v,
        }))
    ), []);

    return (
        <LabeledTextSelectDropdown<VerseNumberFormatType>
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
            tooltip={strings.verse_number_format_type_dropdown_tooltip}
            label={strings.verse_number_format_type_dropdown_label + ":"}
        />
    )
}