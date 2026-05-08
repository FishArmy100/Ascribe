import { TitleFormat } from "@interop/printing"
import { use_deep_copy } from "@utils/index";
import React from "react"
import { use_bible_printer_strings } from "../bible_printer_strings";
import { Stack, useTheme } from "@mui/material";
import TextFormatEditor from "../TextFormatEditor";
import OptionGroup from "@components/core/OptionGroup";
import LabeledNumberInput from "@components/core/LabeledNumberInput";
import TextAlignSelector from "../dropdowns/TextAlignSelector";
import BookFormatSelector from "../dropdowns/BookFormatSelector";

export type TitleFormatMenuProps = {
    format: TitleFormat,
    on_change: (format: TitleFormat) => void,
}

export default function TitleFormatMenu({
    format,
    on_change,
}: TitleFormatMenuProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const change_value = (f: (format: TitleFormat) => TitleFormat) => {
        const copy = deep_copy(format);
        const changed = f(copy);
        on_change(changed);
    };

    const strings = use_bible_printer_strings();
    const theme = useTheme();

    return (
        <Stack
            direction="column"
            gap={theme.spacing(2)}
        >
            <TextFormatEditor 
                label={strings.title_text_label}
                value={format.text_format}
                on_change={t => change_value(f => {
                    f.text_format = t;
                    return f;
                })}
            />
            <OptionGroup label={strings.title_spacing_group_label}>
                <Stack
                    direction="column"
                    gap={theme.spacing(2)}
                >
                    <LabeledNumberInput
                        label_props={{ variant: "body1", bold: true, sx: { minWidth: theme.spacing(16) } }}
                        label={strings.title_spacing_label}
                        tooltip={strings.title_spacing_tooltip}
                        value={format.title_spacing}
                        on_change={s => change_value(f => {
                            f.title_spacing = s;
                            return f;
                        })}
                        min={0}
                        max={72}
                        step={0.25}
                    />
                    <LabeledNumberInput
                        label_props={{ variant: "body1", bold: true, sx: { minWidth: theme.spacing(16) } }}
                        label={strings.title_line_height_label}
                        tooltip={strings.title_line_height_tooltip}
                        value={format.line_height}
                        on_change={h => change_value(f => {
                            f.line_height = h;
                            return f;
                        })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                </Stack>
            </OptionGroup>
            <OptionGroup label={strings.text_align_dropdown_label}>
                <TextAlignSelector 
                    value={format.text_align}
                    on_change={a => change_value(f => {
                        f.text_align = a;
                        return f;
                    })}
                />
            </OptionGroup>
            <OptionGroup label={strings.book_format_dropdown_label}>
                <BookFormatSelector
                    value={format.book_formatter}
                    on_change={b => change_value(f => {
                        f.book_formatter = b;
                        return f;
                    })}
                />
            </OptionGroup>
        </Stack>
    )
}