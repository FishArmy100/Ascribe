import { ImageButton, SearchBar } from "@components/index";
import TopBar from "@components/TopBar";
import * as images from "@assets";
import React from "react";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import { Divider } from "@mui/material";
import ModuleTypeDisplayDropdown, { ModuleDisplayOptions } from "./ModuleTypeDisplayDropdown";
import ClosestBibleViewHistoryButton from "@components/ClosestBibleViewHistoryButton";

export type ModuleListPageToolbarProps = {
    display_options: ModuleDisplayOptions,
    set_display_options: (options: ModuleDisplayOptions) => void,
    on_searching: (value: string) => void,
}

export default function ModuleListPageToolbar({
    display_options,
    set_display_options,
    on_searching,
}: ModuleListPageToolbarProps): React.ReactElement
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
            <SearchBar 
                placeholder="Search..."
                on_search={async (value: string) => {
                    on_searching(value);

                    return {
                        is_error: false,
                        error_message: null,
                    }
                }}
            />

            <ModuleTypeDisplayDropdown 
                options={display_options}
                set_options={set_display_options}
            />

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