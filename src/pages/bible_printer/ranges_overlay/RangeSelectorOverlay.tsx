import OverlayModal from "@components/core/OverlayModal";
import { ImageButton } from "@components/index";
import { Box, Stack, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useReducer } from "react";
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

    type RangeAction = 
        | { type: 'set', payload: BiblePrintRange[] }
        | { type: 'update', index: number, payload: BiblePrintRange }
        | { type: 'add', payload: BiblePrintRange }
        | { type: 'duplicate', index: number }
        | { type: 'delete', index: number };

    const [staged_ranges, dispatch] = useReducer((state: BiblePrintRange[], action: RangeAction) => {
        switch(action.type) {
            case 'set':
                return action.payload;
            case 'update': {
                const copy = deep_copy(state);
                copy[action.index] = action.payload;
                return copy;
            }
            case 'add': {
                const copy = deep_copy(state);
                copy.push(action.payload);
                return copy;
            }
            case 'duplicate': {
                const copy = deep_copy(state);
                const range = deep_copy(copy[action.index]);
                copy.splice(action.index, 0, range);
                return copy;
            }
            case 'delete': {
                const copy = deep_copy(state);
                copy.splice(action.index, 1);
                return copy;
            }
            default:
                return state;
        }
    }, []);

    const handle_cancel = useCallback(() => {
        dispatch({ type: 'set', payload: deep_copy(ranges()) });
        on_close();
    }, [on_close, deep_copy, ranges]);

    const handle_apply = useCallback(() => {
        set_ranges(deep_copy(staged_ranges));
        on_close();
    }, [set_ranges, deep_copy, staged_ranges, on_close]);

    const handle_duplicate = useCallback((index: number) => {
        dispatch({ type: 'duplicate', index });
    }, []);

    const handle_range_change = useCallback((index: number, r: BiblePrintRange) => {
        dispatch({ type: 'update', index, payload: r });
    }, []);

    const handle_range_delete = useCallback((index: number) => {
        dispatch({ type: 'delete', index });
    }, []);

    useEffect(() => {
        dispatch({ type: 'set', payload: deep_copy(ranges()) });
    }, [ranges, deep_copy]);

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
                    <IndexedRangeSelector 
                        key={i}
                        range={range}
                        index={i}
                        can_delete={true}
                        on_change={handle_range_change}
                        on_delete={handle_range_delete}
                        on_duplicate={handle_duplicate}
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
                            dispatch({type: "set", payload: copy});
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

type IndexedRangeSelectorProps = {
    index: number,
    range: BiblePrintRange,
    on_change: (index: number, range: BiblePrintRange) => void,
    on_duplicate: (index: number) => void,
    on_delete: (index: number) => void,
    can_delete: boolean,
}

const IndexedRangeSelector = React.memo(function IndexedRangeSelector({
    index,
    range,
    on_change,
    on_duplicate,
    on_delete,
    can_delete,
}: IndexedRangeSelectorProps): React.ReactElement
{
    const handle_change = useCallback((range: BiblePrintRange) => {
        on_change(index, range);
    }, [index, on_change]);

    const handle_duplicate = useCallback(() => {
        on_duplicate(index);
    }, [index, on_duplicate]);

    const handle_delete = useCallback(() => {
        on_delete(index);
    }, [index, on_delete]);

    return (
        <RangeSelector
            range={range}
            can_delete={can_delete}
            on_change={handle_change}
            on_duplicate={handle_duplicate}
            on_delete={handle_delete}
        />
    );
});