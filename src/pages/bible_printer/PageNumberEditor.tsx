import OptionGroup from "@components/core/OptionGroup"
import { PageNumbers, TextFormat } from "@interop/printing"
import React, { useMemo } from "react"
import { use_bible_printer_strings } from "./bible_printer_strings"
import PageNumberTypeSelector from "./dropdowns/PageNumberTypeSelector"
import { bold, italic } from "@assets"
import { Box, Collapse, Divider } from "@mui/material"
import PrintFontSelector from "./dropdowns/PrintFontSelector"
import CheckboxWithLabel from "@components/core/CheckboxWithLabel"
import TextFormatEditor from "./TextFormatEditor"

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
    
    const text_format = useMemo((): TextFormat => {
        if (value.type !== "none")
        {
            return value;
        }
        else 
        {
            return {
                font: "liberation_sans",
                font_size: 12,
                bold: false,
                italic: false,
            }
        }
    }, [value])

    return (
        <OptionGroup label={strings.page_number_editor_label}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
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
            </Box>
            <Collapse in={expanded}>
                <Divider sx={{ my: 2 }}/>
                <TextFormatEditor 
                    label={null}
                    value={text_format}
                    on_change={format => {
                        on_change({
                            type: value.type,
                            ...format,
                        })
                    }}
                />
            </Collapse>
        </OptionGroup>
    )
}