import { ImageButton, SearchBar } from "@components/index";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import TopBar from "@components/TopBar";
import { Divider } from "@mui/material";
import React from "react";
import * as images from "@assets";
import ClosestBibleViewHistoryButton from "@components/ClosestBibleViewHistoryButton";
import use_module_pages_strings from "../module_pages_strings";

export type ModuleInspectorPageToolbarProps = {
    module: string,
}

export default function ModuleInspectorToolbar({
    module,
}: ModuleInspectorPageToolbarProps): React.ReactElement
{
    const view_history = use_view_history();
    const strings = use_module_pages_strings();

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
                value={""} 
                placeholder={strings.search_placeholder}
                on_search={async (term: string) => { 
                    const error = await view_history.push_mod_word_search(term, [module]);
                    if (error !== null)
                    {
                        return {
                            is_error: true,
                            error_message: error
                        }
                    }
                    else 
                    {
                        return {
                            is_error: false,
                            error_message: null,
                        }
                    }
                }} 
            />  
            <Divider 
                orientation="vertical" 
                flexItem 
            />          
            <ImageButton
                image={images.arrow_turn_left}
                tooltip={strings.previous_page}
                disabled={view_history.can_go_back}
                on_click={() => view_history.back()}
            />
            <ImageButton
                image={images.arrow_turn_right}
                tooltip={strings.next_page}
                disabled={view_history.can_go_forward}
                on_click={() => view_history.forward()}
            />
                
            <SubMenuDropdown />
        </TopBar>
    )
}