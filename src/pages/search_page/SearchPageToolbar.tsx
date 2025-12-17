import { Divider } from "@mui/material";
import { ChapterPicker, ImageButton, ImageDropdown, SearchBar, TopBar, VersionSelector } from "@components";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { ViewHistoryEntry, WordSearchHistoryEntry } from "@interop/view_history";
import * as bible from "@interop/bible"
import * as images from "@assets";
import * as searching from "@interop/searching"
import React, { useCallback } from "react";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import SubMenuDropdown from "@components/SubMenuDropdown";

export type SearchPageToolbarProps = {
    entry: WordSearchHistoryEntry
}

export const SearchPageToolbar = React.memo(function SearchPageToolbar({
    entry
}: SearchPageToolbarProps): React.ReactElement
{
    const view_history = use_view_history();
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const placeholder = entry.raw ?? searching.pretty_print_word_search_query(entry.query, get_book_display_name, get_bible_display_name)

    const on_select_callback = useCallback((c: bible.ChapterId) => {
        view_history.push({
            type: 'chapter',
            chapter: c,
        })
    }, [view_history]);

    return (
        <TopBar
                right_aligned={1}
            >
                <VersionSelector/>
                <ChapterPicker on_select={on_select_callback}/>
                <Divider 
                        orientation="vertical" 
                        flexItem 
                    />
                <SearchBar 
                    on_search={async (term) => {
                        const error = await searching.backend_push_search_to_view_history(term);

                        return {
                            is_error: error !== null,
                            error_message: error
                        }
                    }}
                    value={placeholder}
                />
                <Divider 
                    orientation="vertical" 
                    flexItem 
                />
                <ImageButton
                    image={images.arrow_turn_left}
                    tooltip="To previous page"
                    disabled={view_history.get_current().index === 0}
                    on_click={() => view_history.retreat()}
                />
                <ImageButton
                    image={images.arrow_turn_right}
                    tooltip="To next page"
                    disabled={view_history.get_current().index >= view_history.get_current().count - 1}
                    on_click={() => view_history.advance()}
                />
                <SubMenuDropdown />
            </TopBar>
    )
})