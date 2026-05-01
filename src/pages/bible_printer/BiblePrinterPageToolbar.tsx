import React, { useCallback, useState } from "react";
import { use_bible_printer_strings } from "./bible_printer_strings";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import TopBar from "@components/TopBar";
import { ImageButton } from "@components/index";
import * as images from "@assets";
import SubMenuDropdown from "@components/SubMenuDropdown";
import { Divider } from "@mui/material";
import LoadingOverlay from "@components/core/LoadingOverlay";
import { backend_download_pdf, BiblePrintRange } from "@interop/printing";
import PrinterSettingsOverlay from "./PrinterSettingsOverlay";

const range_a: BiblePrintRange = {
    bible: "kjv_eng",
    from: {
        book: "Gen",
        chapter: 1,
        verse: 1,
    },
    to: {
        book: "Gen",
        chapter: 1,
        verse: 31,
    }
}

const range_b: BiblePrintRange = {
    bible: "kjv_eng",
    from: {
        book: "Prov",
        chapter: 3,
        verse: 1,
    },
    to: {
        book: "Prov",
        chapter: 3,
        verse: 7,
    }
}

const ranges = [range_a, range_b];

export default function BiblePrinterPageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
    
    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    const strings = use_bible_printer_strings();
    const [show_loading, set_show_loading] = useState(false);
    const [show_printer_settings, set_show_printer_settings] = useState(false);

    const handle_close_printer_settings = useCallback(() => {
        set_show_printer_settings(false);
    }, [set_show_printer_settings])

    const handle_download = useCallback(() => {
        async function runner()
        {
            if (show_loading) return;

            set_show_loading(true);
            let response = await backend_download_pdf(ranges);
            set_show_loading(false);
        }

        runner();
    }, [set_show_loading]);

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
                    on_click={handle_download}
                />
                
                <ImageButton 
                    image={images.sliders}
                    tooltip={strings.settings_tooltip}
                    on_click={() => set_show_printer_settings(true)}
                    active={show_printer_settings}
                />

                <SubMenuDropdown />
            </TopBar>
            <LoadingOverlay show={show_loading}/>
            <PrinterSettingsOverlay 
                show={show_printer_settings}
                on_close={handle_close_printer_settings}
            />
        </>
    )
}