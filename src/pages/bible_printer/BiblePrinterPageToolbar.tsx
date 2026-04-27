import React, { useCallback } from "react";
import { use_bible_printer_strings } from "./bible_printer_strings";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import TopBar from "@components/TopBar";
import { ImageButton } from "@components/index";
import * as images from "@assets";
import SubMenuDropdown from "@components/SubMenuDropdown";

export default function BiblePrinterPageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
    
    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    const strings = use_bible_printer_strings();

    return (
        <TopBar
            right_aligned={1}
        >
            <ImageButton 
                image={images.backward}
                tooltip={strings.back_tooltip}
                on_click={handle_back_clicked}
            />

            <SubMenuDropdown />
        </TopBar>
    )
}