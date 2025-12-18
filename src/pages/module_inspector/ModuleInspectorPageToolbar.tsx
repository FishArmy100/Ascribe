import { ImageButton, SearchBar } from "@components/index";
import TopBar from "@components/TopBar";
import * as images from "@assets";
import React, { useCallback } from "react";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import { Divider } from "@mui/material";
import ModuleTypeDisplayDropdown, { ModuleDisplayOptions } from "./ModuleTypeDisplayDropdown";

export type ModuleInspectorPageToolbarProps = {
    display_options: ModuleDisplayOptions,
    set_display_options: (options: ModuleDisplayOptions) => void,
}

export default function ModuleInspectorPageToolbar({
    display_options,
    set_display_options
}: ModuleInspectorPageToolbarProps): React.ReactElement
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

            <ModuleTypeDisplayDropdown 
                options={display_options}
                set_options={set_display_options}
            />
            <SubMenuDropdown />
        </TopBar>
    )
}