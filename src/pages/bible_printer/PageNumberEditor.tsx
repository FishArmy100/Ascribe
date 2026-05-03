import OptionGroup from "@components/core/OptionGroup"
import { PageNumbers } from "@interop/printing"
import React from "react"
import { use_bible_printer_strings } from "./bible_printer_strings"
import PageNumberTypeSelector from "./dropdowns/PageNumberTypeSelector"
import { bold, italic } from "@assets"
import { Collapse, Divider } from "@mui/material"
import PrintFontSelector from "./dropdowns/PrintFontSelector"
import LabeledCheckbox from "@components/core/LabeledCheckbox"

export type PageNumberEditorProps = {
    value: PageNumbers,
    on_change: (value: PageNumbers) => void,
}

export default function PageNumberEditor({
    value,
    on_change
}: PageNumberEditorProps): React.ReactElement
{
    const strings = use_bible_printer_strings();
    const expanded = value.type !== "none";

    return (
        <OptionGroup label={strings.page_number_editor_label}>
            <PageNumberTypeSelector 
                value={value.type}
                on_change={(v) => {
                    if (v === "none")
                    {
                        on_change({ type: "none" });
                    }
                    else
                    {
                        on_change({
                            type: v,
                            font_size: 1,
                            font: "liberation_sans",
                            bold: false,
                            italic: false,
                        })
                    }
                }}
            />
            <Collapse in={expanded}>
                <Divider sx={{ mt: 1 }}/>
                {value.type !== "none" && <>
                    <PrintFontSelector 
                        value={value.font}
                        on_change={v => on_change({
                            type: value.type,
                            font: v,
                            font_size: value.font_size,
                            bold: value.bold,
                            italic: value.italic,
                        })}
                    />
                </>}
            </Collapse>
        </OptionGroup>
    )
}