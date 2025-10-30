import { Divider } from "@mui/material";
import { ChapterPicker, ImageButton, ImageDropdown, SearchBar, TopBar, VersionSelector } from "../../components";
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import { ViewHistoryEntry } from "../../interop/view_history";
import { push_search_to_view_history } from "../../interop/searching";
import * as bible from "../../interop/bible"
import * as images from "../../assets";
import React, { useCallback } from "react";

export const BiblePageToolbar = React.memo(function BiblePageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
	const { bible: selected_bible } = bible.use_selected_bibles()
	const placeholder = get_placeholder_text(view_history.get_current().current, selected_bible);

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
						const error = await push_search_to_view_history(term);

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
				<ImageDropdown 
					image={images.unordered_list}
					tooltip="Menu"
					on_select={(v) => {
						console.log(`Selected option: ${v}`);
					}}
					options={[
						{ image: images.gear_complex, tooltip: "Settings", value: 0 },
						{ image: images.note_plus, tooltip: "Notes", value: 1 },
						{ image: images.info, tooltip: "Help", value: 2 },
					]}
				/>
			</TopBar>
    )
})

function get_placeholder_text(entry: ViewHistoryEntry, bible_info: bible.BibleInfo): string 
{
	switch (entry.type)
	{
		case "chapter":
		{
			const book_name = bible.get_book_info(bible_info, entry.chapter.book).abbreviation;
			const chapter = entry.chapter.chapter;
			return `${book_name} ${chapter}`;
		}
		case "verse": 
		{
			const book_name = bible.get_book_info(bible_info, entry.chapter.book).abbreviation;
			const chapter = entry.chapter.chapter;
			if (entry.end !== null)
			{
				return `${book_name} ${chapter}:${entry.start}-${entry.end}`;
			}
			else
			{
				return `${book_name} ${chapter}:${entry.start}`;
			}
		}
		default:
			return "Not Supported"
	}
}