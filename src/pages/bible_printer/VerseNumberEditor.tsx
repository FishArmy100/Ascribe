import OptionGroup from "@components/core/OptionGroup"
import { VerseNumberFormat } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "./bible_printer_strings"
import { Box, Collapse, Divider } from "@mui/material"
import TextFormatEditor from "./TextFormatEditor"
import VerseNumberFormatTypeSelector from "./dropdowns/VerseNumberFormatTypeSelector"
import { use_deep_copy } from "@utils/index"

export type VerseNumberEditorProps = {
    value: VerseNumberFormat,
    on_change: (value: VerseNumberFormat) => void,
}

export default function VerseNumberEditor({
    value,
    on_change
}: VerseNumberEditorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const expanded = value.format_type !== "none";
    const deep_copy = use_deep_copy();
    
    const verse_number_format = useMemo((): VerseNumberFormat => {
        if (value.format_type !== "none")
        {
            return value;
        }
        else 
        {
            return {
                format_type: "short",
                text_format: {
                    font: "liberation_sans",
                    font_size: 12,
                    bold: false,
                    italic: false,
                },
                spacing: 18.0
            }
        }
    }, [value])

    return (
        <OptionGroup label={strings.verse_number_editor_label}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <VerseNumberFormatTypeSelector
                    value={value.format_type}
                    on_change={t => {
                        const copy = deep_copy(value);
                        copy.format_type = t;
                        on_change(value);
                    }}
                />
            </Box>
            <Collapse in={expanded}>
                <Divider sx={{ my: 2 }}/>
                <TextFormatEditor 
                    label={null}
                    value={verse_number_format.text_format}
                    on_change={f => {
                        const copy = deep_copy(verse_number_format);
                        copy.text_format = f;
                        on_change(copy);
                    }}
                />
            </Collapse>
        </OptionGroup>
    )
}