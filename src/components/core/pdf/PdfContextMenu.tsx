import { ContextMenuOption } from "@components/context_menu/ContextMenu";
import { use_show_context_menu } from "@components/providers/ContextMenuProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { Box } from "@mui/material";
import React, { useMemo } from "react";
import * as images from "@assets";

export type PdfContextMenuProps = {
    children: React.ReactNode,
    on_zoom_in: () => void,
    on_zoom_out: () => void,
    on_download: () => void,
}

export default function PdfContextMenu({
    children,
    on_download,
    on_zoom_in,
    on_zoom_out,
}: PdfContextMenuProps): React.ReactElement
{
    const strings = useMemo(() => ({
        print_label: __t(
            "pages.bible_printer.pdf_context_menu.labels.download",
            "Download Pdf",
        ),
        print_tooltip: __t(
            "pages.bible_printer.pdf_context_menu.tooltips.download",
            "Download Pdf",
        ),
        zoom_in_label: __t(
            "pages.bible_printer.pdf_context_menu.labels.zoom_in",
            "Zoom In",
        ),
        zoom_in_tooltip: __t(
            "pages.bible_printer.pdf_context_menu.tooltips.zoom_in",
            "Zoom In",
        ),
        zoom_out_label: __t(
            "pages.bible_printer.pdf_context_menu.labels.zoom_out",
            "Zoom Out",
        ),
        zoom_out_tooltip: __t(
            "pages.bible_printer.pdf_context_menu.tooltips.zoom_out",
            "Zoom Out",
        ),
    }), []);

    const options = useMemo((): (ContextMenuOption | "divider")[] => [
        {
            label: strings.print_label,
            tooltip: strings.print_tooltip,
            on_click: on_download,
            image: images.download,
        },
        "divider",
        {
            label: strings.zoom_in_label,
            tooltip: strings.zoom_in_tooltip,
            on_click: on_zoom_in,
            image: images.zoom_in,
        },
        {
            label: strings.zoom_out_label,
            tooltip: strings.zoom_out_tooltip,
            on_click: on_zoom_out,
            image: images.zoom_out,
        }
    ], [on_zoom_in, on_zoom_out, on_download]);

    const show_context_menu = use_show_context_menu();

    return (
        <Box
            onContextMenu={e => {
                show_context_menu(e, options);
            }}
            sx={{
                display: "contents"
            }}
        >
            {children}
        </Box>
    )
}