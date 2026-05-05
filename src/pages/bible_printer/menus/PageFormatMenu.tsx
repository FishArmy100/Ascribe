import { PrintBibleFormat } from "@interop/printing"
import { Box, Stack, useTheme } from "@mui/material";
import { use_deep_copy } from "@utils/index"
import React from "react"
import MarginEditor from "../MarginEditor";
import PageNumberEditor from "../PageNumberEditor";
import PageSizeSelector from "../dropdowns/PageSizeSelector";
import LabeledCheckbox from "@components/core/LabeledCheckbox";
import { use_bible_printer_strings } from "../bible_printer_strings";
import OptionGroup from "@components/core/OptionGroup";

export type PageFormatMenuProps = {
    format: PrintBibleFormat,
    on_change: (format: PrintBibleFormat) => void,
}

export default function PageFormatMenu({
    format,
    on_change,
}: PageFormatMenuProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const change_value = (f: (format: PrintBibleFormat) => PrintBibleFormat) => {
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
            <MarginEditor 
                margin={format.margin}
                on_change={m => change_value(f => {
                    f.margin = m;
                    return f;
                })}
            />
            <PageNumberEditor 
                value={format.page_numbers}
                on_change={pn => change_value(f => {
                    f.page_numbers = pn;
                    return f;
                })}
            />
            <OptionGroup label={strings.page_size_dropdown_label}>
                <PageSizeSelector
                    value={format.page_size}
                    on_change={s => change_value(f => {
                        f.page_size = s;
                        return f;
                    })}
                />
            </OptionGroup>
            <OptionGroup label={strings.new_page_per_section_label}>
                
                <LabeledCheckbox
                    label_props={{ variant: "body1", bold: true }}
                    label={strings.new_page_per_section_label}
                    tooltip={strings.new_page_per_section_tooltip}
                    value={format.new_page_per_section}
                    on_change={np => change_value(f => {
                        f.new_page_per_section = np;
                        return f;
                    })}
                />
            </OptionGroup>
        </Stack>
    )
}