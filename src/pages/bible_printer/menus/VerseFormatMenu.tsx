import { VerseFormat } from "@interop/printing"
import { use_deep_copy } from "@utils/index";
import React from "react"
import { use_bible_printer_strings } from "../bible_printer_strings";
import { Stack, useTheme } from "@mui/material";

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
            
            {/* Alt Format */}

            {/* Verse Title Format */}

            {/* Line Height */}
            {/* Word Spacing */}
            {/* Verse Spacing */}
            {/* Title Spacing */}
            {/* Verse Indent */}
        </Stack>
    )
}