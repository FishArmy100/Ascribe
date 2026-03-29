import { ImageButton } from "@components/index";
import TopBar from "@components/TopBar";
import * as images from "@assets";
import React, { useCallback } from "react";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import use_settings_page_strings from "./settings_page_strings";


export default function SettingsPageToolbar(): React.ReactElement
{
    const view_history = use_view_history();

    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    const strings = use_settings_page_strings();

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