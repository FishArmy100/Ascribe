import { Backdrop, Box, Divider, Fade, Modal, Paper, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import ToggleButtonGroup from "@components/core/ToggleButtonGroup";
import PageFormatMenu from "./menus/PageFormatMenu";
import { backend_get_default_print_bible_format, PrintBibleFormat } from "@interop/printing";
import { use_deep_copy } from "@utils/index";
import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import PrinterSettingsButtons from "./PrinterSettingsButtons";
import VerseFormatMenu from "./menus/VerseFormatMenu";
import { use_bible_printer_strings } from "./bible_printer_strings";
import StrongsFormatMenu from "./menus/StrongsFormatMenu";
import TitleFormatMenu from "./menus/TitleFormatMenu";
import OverlayModal from "@components/core/OverlayModal";

const FORMAT_CATEGORIES = [ "page", "verse", "strongs", "title" ] as const;
type FormatCategory = typeof FORMAT_CATEGORIES[number];

export type PrinterSettingsOverlayProps = {
    show: boolean,
    on_close: () => void,
}

export default function PrinterSettingsOverlay({
    show,
    on_close
}: PrinterSettingsOverlayProps): React.ReactElement
{
    const theme = useTheme();
    const deep_copy = use_deep_copy();
    const [category, set_category] = useState<FormatCategory>("page");
    const { format, set_format } = use_bible_print_format();
    const [staged_print_format, set_staged_print_format] = useState<PrintBibleFormat>(deep_copy(format));
    const strings = use_bible_printer_strings();

    const handle_reset = useCallback(() => {
        backend_get_default_print_bible_format().then(f => {
            set_format(f);
            set_staged_print_format(f);
        })
    }, [set_staged_print_format]);
    
    const handle_cancel = useCallback(() => {
        set_staged_print_format(format());
        on_close();
    }, [on_close, deep_copy, format, set_staged_print_format]);

    const handle_apply = useCallback(() => {
        set_format(deep_copy(staged_print_format));
        on_close();
    }, [set_format, deep_copy, staged_print_format, on_close]);

    useEffect(() => {
        set_staged_print_format(format())
    }, [format]);

    return (
        <OverlayModal
            show={show}
            on_close={on_close}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                }}
            >
                <ToggleButtonGroup
                    options={
                        FORMAT_CATEGORIES.map(c => ({
                            label: strings.format_category_label(c),
                            tooltip: strings.format_category_tooltip(c),
                        }))
                    }
                    selected={FORMAT_CATEGORIES.indexOf(category)}
                    on_selected={i => set_category(FORMAT_CATEGORIES[i])}
                    sx={{
                        width: theme.spacing(40),
                    }}
                />
            </Box>
            {category === "page" && (
                <PageFormatMenu
                    format={staged_print_format}
                    on_change={f => set_staged_print_format(f)}
                />
            )}
            {category === "verse" && (
                <VerseFormatMenu
                    format={staged_print_format.verse_format}
                    on_change={f => {
                        const copy = deep_copy(staged_print_format);
                        copy.verse_format = f;
                        set_staged_print_format(copy);
                    }}
                />
            )}
            {category === "strongs" && (
                <StrongsFormatMenu
                    format={staged_print_format.strongs_format}
                    on_change={f => {
                        const copy = deep_copy(staged_print_format);
                        copy.strongs_format = f;
                        set_staged_print_format(copy);
                    }}
                />
            )}
            {category === "title" && (
                <TitleFormatMenu
                    format={staged_print_format.title_format}
                    on_change={f => {
                        const copy = deep_copy(staged_print_format);
                        copy.title_format = f;
                        set_staged_print_format(copy);
                    }}
                />
            )}
            <Divider sx={{ mt: 2, mb: 2 }}/>
            <PrinterSettingsButtons
                on_apply={handle_apply}
                on_cancel={handle_cancel}
                on_reset={handle_reset}
            />
        </OverlayModal>
    )
}