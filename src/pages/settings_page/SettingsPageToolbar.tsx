import { ImageButton } from "@components/index";
import TopBar from "@components/TopBar";
import * as images from "@assets";
import React, { useCallback } from "react";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";


export default function SettingsPageToolbar(): React.ReactElement
{
    const view_history = use_view_history();

    const handle_back_clicked = useCallback(() => {
        view_history.retreat()
    }, [view_history]);

    return (
        <TopBar
            right_aligned={1}
        >
            <ImageButton 
                image={images.backward}
                tooltip="Back"
                on_click={handle_back_clicked}
            />

            <SubMenuDropdown />
        </TopBar>
    )
}