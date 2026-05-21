import { StrongsFormat } from "@interop/printing";
import { use_deep_copy } from "@utils/index";
import React from "react";
import { use_bible_printer_strings } from "../bible_printer_strings";
import { Collapse, Divider, useTheme } from "@mui/material";
import OptionGroup from "@components/core/OptionGroup";
import LabeledCheckbox from "@components/core/LabeledCheckbox";
import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import TextFormatEditor from "../TextFormatEditor";

export type StrongsFormatMenuProps = {
    format: StrongsFormat | null,
    on_change: (format: StrongsFormat | null) => void,
}

export default function StrongsFormatMenu({
    format,
    on_change,
}: StrongsFormatMenuProps): React.ReactElement
{
    const { default_format } = use_bible_print_format();
    const deep_copy = use_deep_copy();

    const strings = use_bible_printer_strings();

    return (
        <OptionGroup label={strings.strongs_option_group_label}>
            <LabeledCheckbox 
                label_props={{ variant: "body1", bold: true, }}
                label={strings.strongs_enabled_label}
                tooltip={strings.strongs_enabled_tooltip}
                value={format !== null}
                on_change={v => {
                    if (v)
                    {
                        const default_strongs = default_format().strongs_format;
                        on_change(default_strongs);
                    }
                    else
                    {
                        on_change(null)
                    }
                }}
            />
            <Collapse in={format !== null}>
                <Divider sx={{ my: 2 }}/>
                <TextFormatEditor 
                    label={null}
                    value={format ?? default_format().strongs_format!}
                    on_change={s => {
                        on_change(deep_copy(s))
                    }}
                />
            </Collapse>
        </OptionGroup>
    )
}