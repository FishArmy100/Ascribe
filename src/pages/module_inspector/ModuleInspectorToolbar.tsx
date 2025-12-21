import { ImageButton, SearchBar } from "@components/index";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import TopBar from "@components/TopBar";
import { Divider } from "@mui/material";
import React, { useCallback } from "react";
import * as images from "@assets";


export default function ModuleInspectorToolbar(): React.ReactElement
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
            <Divider 
                orientation="vertical" 
                flexItem 
            />
            <SearchBar value="Hi there" on_search={async () => { return { is_error: false, error_message: null }; }} />
                
            <SubMenuDropdown />
        </TopBar>
    )
}