import { ImageButton, SearchBar } from "@components/index";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";
import TopBar from "@components/TopBar";
import { Divider } from "@mui/material";
import React, { useMemo } from "react";
import * as images from "@assets";
import ClosestBibleViewHistoryButton from "@components/ClosestBibleViewHistoryButton";
import { ModuleWordSearchEntry } from "@interop/view_history";
import { backend_push_module_word_search_to_view_history, pretty_print_word_search_query } from "@interop/searching";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";

export type ModuleWordSearchToolbarProps = {
    entry: ModuleWordSearchEntry,
}

export default function ModuleWordSearchToolbar({
    entry,
}: ModuleWordSearchToolbarProps): React.ReactElement
{
    const view_history = use_view_history();
    const { get_bible_display_name, get_book_display_name } = use_bible_infos()

    const search_value = useMemo(() => {
        if (entry.raw !== null)
        {
            return entry.raw;
        }
        else 
        {
            return pretty_print_word_search_query(entry.query, get_book_display_name, get_bible_display_name);
        }
    }, [entry])

    return (
        <TopBar
            right_aligned={1}
        >
            <ClosestBibleViewHistoryButton />
            <Divider 
                orientation="vertical" 
                flexItem 
            />
            <SearchBar value={search_value} on_search={async (term: string) => { 
                const error = await backend_push_module_word_search_to_view_history(term, entry.searched_modules);
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
            }} />  
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