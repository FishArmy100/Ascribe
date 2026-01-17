import { ImageButton, SearchBar } from "@components/index";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import TopBar from "@components/TopBar";
import { Divider } from "@mui/material";
import React from "react";
import * as images from "@assets";
import ClosestBibleViewHistoryButton from "@components/ClosestBibleViewHistoryButton";


export default function ModuleWordSearchToolbar(): React.ReactElement
{
    const view_history = use_view_history();

    return (
        <TopBar
            right_aligned={1}
        >
            <ClosestBibleViewHistoryButton />
            <Divider 
                orientation="vertical" 
                flexItem 
            />
            <SearchBar value="Hi there" on_search={async () => { return { is_error: false, error_message: null }; }} />  
            <Divider 
                orientation="vertical" 
                flexItem 
            />          
            <ImageButton
                image={images.arrow_turn_left}
                tooltip="To previous page"
                disabled={view_history.get_index() === 0}
                on_click={() => view_history.retreat()}
            />
            <ImageButton
                image={images.arrow_turn_right}
                tooltip="To next page"
                disabled={view_history.get_index() >= view_history.get_count() - 1}
                on_click={() => view_history.advance()}
            />
                
            <SubMenuDropdown />
        </TopBar>
    )
}