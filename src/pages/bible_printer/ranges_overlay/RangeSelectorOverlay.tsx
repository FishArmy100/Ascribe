import OverlayModal from "@components/core/OverlayModal";
import { ImageButton } from "@components/index";
import { Box, Stack, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import * as images from "@assets";
import { use_bible_printer_strings } from "../bible_printer_strings";
import RangeSelector, { use_default_bible_range } from "./RangeSelector";
import { BiblePrintRange } from "@interop/printing";
import { use_deep_copy } from "@utils/index";
import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import TextButton from "@components/core/TextButton";

export type RangeSelectorOverlayProps = {
    show: boolean,
    on_close: () => void,
}

export default function RangeSelectorOverlay({
    show,
    on_close,
}: RangeSelectorOverlayProps): React.ReactElement
{
    const theme = useTheme();
    const strings = use_bible_printer_strings();
    const default_range = use_default_bible_range();
    const { set_ranges, ranges } = use_bible_print_ranges();
    const deep_copy = use_deep_copy();

    const [staged_ranges, set_staged_ranges] = useState<BiblePrintRange[]>([]);

    const handle_cancel = useCallback(() => {
        set_staged_ranges(ranges());
        on_close();
    }, [on_close, deep_copy, ranges, set_staged_ranges]);

    const handle_apply = useCallback(() => {
        set_ranges(deep_copy(staged_ranges));
        on_close();
    }, [set_ranges, deep_copy, staged_ranges, on_close]);

    useEffect(() => {
        set_staged_ranges(ranges);
    }, [ranges]);

    return (
        <OverlayModal
            show={show} 
            on_close={on_close}
        >
            <Stack 
                direction="column"
                gap={theme.spacing(1)}
            >
                {staged_ranges.map((range, i) => (
                    <RangeSelector 
                        key={i}
                        range={range}
                        can_delete={true}
                        on_change={(r) => {
                            const copy = deep_copy(staged_ranges);
                            copy[i] = r;
                            set_staged_ranges(copy)
                        }}
                        on_delete={() => {
                            const copy = deep_copy(staged_ranges);
                            copy.remove_at(i);
                            set_staged_ranges(copy);
                        }}
                    />
                ))}
            </Stack>
            <Box
                sx={{
                    width: "100%",
                    bottom: 0,
                    right: 0,
                    top: 0,
                    boxSizing: "border-box",
                    zIndex: 10000,
                    mt: 2,
                }}
            >
                <Stack 
                    direction="row"
                    sx={{
                        alignItems: "center",
                        justifyContent: "center",
                        gap: theme.spacing(1)
                    }}
                >
                    <ImageButton 
                        image={images.plus}
                        tooltip={strings.add_section_tooltip}
                        on_click={() => {
                            const copy = deep_copy(staged_ranges);
                            copy.push(default_range());
                            set_staged_ranges(copy);
                        }}
                    />
                    <TextButton
                        text={strings.apply_changes}
                        tooltip={strings.apply_changes_tooltip}
                        on_click={handle_apply}
                        text_props={{ bold: true }}
                    />
                    <TextButton
                        text={strings.cancel_changes}
                        tooltip={strings.cancel_changes_tooltip}
                        on_click={handle_cancel}
                        text_props={{ bold: true }}
                    />
                </Stack>
            </Box>
        </OverlayModal>
    )
}