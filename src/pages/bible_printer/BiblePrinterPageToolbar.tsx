import React, { useCallback, useState } from "react";
import { use_bible_printer_strings } from "./bible_printer_strings";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import TopBar from "@components/TopBar";
import { ImageButton } from "@components/index";
import * as images from "@assets";
import SubMenuDropdown from "@components/SubMenuDropdown";
import { Divider } from "@mui/material";
import LoadingOverlay from "@components/core/LoadingOverlay";
import { backend_download_pdf, backend_get_print_ranges, BiblePrintRange } from "@interop/printing";
import PrinterSettingsOverlay from "./PrinterSettingsOverlay";
import RangeSelectorOverlay from "./ranges_overlay/RangeSelectorOverlay";

export type BiblePrinterPageToolbarProps = {
    on_download: () => void,
}

export default function BiblePrinterPageToolbar({
    on_download
}: BiblePrinterPageToolbarProps): React.ReactElement
{
    const view_history = use_view_history();
    
    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    const strings = use_bible_printer_strings();
    const [show_printer_settings, set_show_printer_settings] = useState(false);
    const [show_printer_sections, set_show_printer_sections] = useState(false); 

    const handle_close_printer_settings = useCallback(() => {
        set_show_printer_settings(false);
    }, [set_show_printer_settings]);

    const handle_close_printer_sections = useCallback(() => {
        set_show_printer_sections(false);
    }, [set_show_printer_sections]);

    return (
        <>
            <TopBar
                right_aligned={1}
            >
                <ImageButton 
                    image={images.backward}
                    tooltip={strings.back_tooltip}
                    on_click={handle_back_clicked}
                />

                <Divider 
                    orientation="vertical"
                    flexItem
                />

                <ImageButton 
                    image={images.download}
                    tooltip={strings.download_tooltip}
                    on_click={on_download}
                />
                
                <ImageButton 
                    image={images.sliders}
                    tooltip={strings.settings_tooltip}
                    on_click={() => set_show_printer_settings(true)}
                    active={show_printer_settings}
                />

                <ImageButton
                    image={images.quotes}
                    tooltip={strings.sections_tooltip}
                    on_click={() => set_show_printer_sections(true)}
                    active={show_printer_sections}
                />

                <SubMenuDropdown />
            </TopBar>
            <PrinterSettingsOverlay 
                show={show_printer_settings}
                on_close={handle_close_printer_settings}
            />
            <RangeSelectorOverlay 
                show={show_printer_sections}
                on_close={handle_close_printer_sections}
            />
        </>
    )
}