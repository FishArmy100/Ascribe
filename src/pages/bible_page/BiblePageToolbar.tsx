import { Divider } from "@mui/material";
import { ChapterPicker, ImageButton, ImageDropdown, SearchBar, TopBar, VersionSelector } from "../../components";
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import { ViewHistoryEntry } from "../../interop/view_history";
import { backend_push_search_to_view_history } from "../../interop/searching";
import * as bible from "../../interop/bible"
import * as images from "../../assets";
import * as tts from "../../interop/tts"
import React, { useCallback, useEffect } from "react";
import { listen_tts_event } from "../../interop/tts/events";
import SubMenuDropdown from "@components/SubMenuDropdown";

export type BiblePageToolbarProps = {
	player_open: boolean,
	on_click_player: () => void,
}

export const BiblePageToolbar = React.memo(function BiblePageToolbar({
	player_open,
	on_click_player,
}: BiblePageToolbarProps): React.ReactElement
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
					const error = await backend_push_search_to_view_history(term);

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
			<ImageButton
				image={images.volume_high}
				tooltip="Play audio"
				on_click={() => {
					// tts.backend_request_tts({
					// 	bible: "KJV",
					// 	chapter: {
					// 		book: "Gen",
					// 		chapter: 1,
					// 	},
					// 	verse_range: null,
					// });
					on_click_player();
				}}
				active={player_open}
			/>

			<SubMenuDropdown />
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