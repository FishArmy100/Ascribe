import { VerseFormat } from "@interop/printing"
import { use_deep_copy } from "@utils/index";
import React from "react"
import { use_bible_printer_strings } from "../bible_printer_strings";
import { Stack, useTheme } from "@mui/material";
import VerseNumberEditor from "../VerseNumberEditor";
import TextFormatEditor from "../TextFormatEditor";
import OptionGroup from "@components/core/OptionGroup";
import LabeledNumberInput from "@components/core/LabeledNumberInput";

export type VerseFormatMenuProps = {
    format: VerseFormat,
    on_change: (format: VerseFormat) => void,
}

export default function VerseFormatMenu({
    format,
    on_change,
}: VerseFormatMenuProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const change_value = (f: (format: VerseFormat) => VerseFormat) => {
        const copy = deep_copy(format);
        const changed = f(copy);
        on_change(changed);
    };
    const strings = use_bible_printer_strings();
    const theme = useTheme();

    return (
        <Stack
            gap={theme.spacing(2)}
            direction="column"
        >
            {/* Text Format */}
            <TextFormatEditor 
                label={strings.verse_text_format_label}
                value={format.text_format}
                on_change={t => change_value(f => {
                    f.text_format = t;
                    return f;
                })}
            />

            {/* Alt Format */}
            <TextFormatEditor 
                label={strings.verse_alt_text_format_label}
                value={format.alt_text_format}
                on_change={t => change_value(f => {
                    f.text_format = t;
                    return f;
                })}
            />

            {/* Verse Number Format */}
            <VerseNumberEditor 
                value={format.verse_number_format}
                on_change={n => change_value(f => {
                    f.verse_number_format = n;
                    return f;
                })}
            />

            <OptionGroup label={strings.verse_spacing_group_label}>
                {/* Line Height */}
                <LabeledNumberInput 
                    label_props={{ variant: "body1", bold: true, sx: {minWidth: theme.spacing(16)} }}
                    label={strings.verse_line_height_label}
                    tooltip={strings.verse_line_height_tooltip}
                    max={2}
                    min={0}
                    step={0.05}
                    value={format.line_height}
                    on_change={h => change_value(f => {
                        f.line_height = h;
                        return f;
                    })}
                />
                
                {/* Word Spacing */}
                <LabeledNumberInput 
                    label_props={{ variant: "body1", bold: true, sx: {minWidth: theme.spacing(16)} }}
                    label={strings.verse_word_spacing_label}
                    tooltip={strings.verse_word_spacing_tooltip}
                    max={72}
                    min={0}
                    step={0.25}
                    value={format.word_spacing}
                    on_change={s => change_value(f => {
                        f.word_spacing = s;
                        return f;
                    })}
                />
                {/* Verse Spacing */}
                
                <LabeledNumberInput 
                    label_props={{ variant: "body1", bold: true, sx: {minWidth: theme.spacing(16)} }}
                    label={strings.verse_spacing_label}
                    tooltip={strings.verse_spacing_tooltip}
                    max={72}
                    min={0}
                    step={0.25}
                    value={format.verse_spacing}
                    on_change={s => change_value(f => {
                        f.verse_spacing = s;
                        return f;
                    })}
                />

                {/* Verse Indent */}
                <LabeledNumberInput 
                    label_props={{ variant: "body1", bold: true, sx: {minWidth: theme.spacing(16)} }}
                    label={strings.verse_indent_label}
                    tooltip={strings.verse_indent_tooltip}
                    max={72}
                    min={0}
                    step={0.25}
                    value={format.line_height}
                    on_change={i => change_value(f => {
                        f.verse_indent = i;
                        return f;
                    })}
                />
            </OptionGroup>

        </Stack>
    )
}