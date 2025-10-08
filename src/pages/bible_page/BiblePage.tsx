import { Box, CircularProgress, Divider, Paper, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import * as images from "../../assets"
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import { use_settings } from "../../components/providers/SettingsProvider";
import * as bible from "../../interop/bible";
import { ViewHistoryEntry } from "../../interop/view_history";
import { VerseRenderData } from "../../interop/bible/render";
import { TopBar, use_top_bar_padding, VersionSelector, ChapterPicker, SearchBar, ImageDropdown, TopBarSpacer, ImageButton, get_button_size, Footer } from "../../components";
import BibleVerse from "../../components/bible/BibleVerse";
import { push_search_to_view_history } from "../../interop/searching";
import ChapterContent from "./ChapterContent";
import BiblePageToolbar from "./BiblePageToolbar";


export default function BiblePage(): React.ReactElement
{
	const { settings } = use_settings();
	const button_width = get_button_size(settings) * 0.75;
	const button_height = button_width * 7;
	const theme = useTheme();
	
	const button_spacing = use_top_bar_padding(settings, theme);
	const button_space = button_width * 2 + button_spacing * 4;
	const view_history = use_view_history();
	const selected_bibles = bible.use_selected_bibles();

	const current_chapter = view_history.get_current().current.chapter;
	const bible_name = selected_bibles.bible.name;

	const [verses, set_verses] = useState<VerseRenderData[] | null>(null);
	const [parallel_verses, set_parallel_verses] = useState<VerseRenderData[] | null>(null);

	useEffect(() => {
		const chapter = view_history.get_current().current.chapter;
		const verse_ids = bible.get_chapter_verse_ids(selected_bibles.bible, chapter);

		// Fetch main version
		bible.fetch_backend_verse_render_data(verse_ids, selected_bibles.bible.name)
			.then(vs => set_verses(vs));

		// Fetch parallel version if available
		if (selected_bibles.parallel) 
		{
			bible.fetch_backend_verse_render_data(verse_ids, selected_bibles.parallel.name)
				.then(vs => set_parallel_verses(vs));
		} 
		else 
		{
			set_parallel_verses(null);
		}
	}, [current_chapter, bible_name, selected_bibles.parallel]);

	function on_chapter_button_click(type: "next" | "previous")
	{
		const current_page = view_history.get_current();
		if (current_page.current.type !== "verse" && current_page.current.type !== "chapter")
		{
			return;
		}

		let chapter = current_page.current.chapter;

		if (type === "next")
		{
			chapter = bible.increment_chapter(selected_bibles.bible, chapter);
			view_history.push({
				type: "chapter",
				chapter,
			})
		}

		if (type === "previous")
		{
			chapter = bible.decrement_chapter(selected_bibles.bible, chapter);
			view_history.push({
				type: "chapter",
				chapter,
			})
		}
	}

    return (
        <Box>
			<BiblePageToolbar/>
			<TopBarSpacer/>
			
			{/* Previous chapter button */}
			<ImageButton
				image={images.arrow_left}
				tooltip="To previous chapter"
				sx={{
					position: "fixed",
					top: `calc(50% - ${button_height / 2}px)`,
					left: `${button_spacing}px`,
					minHeight: `${button_height}px`,
					height: `${button_height}px`,
					minWidth: `${button_width}px`,
					width: `${button_width}px`,
				}}
				on_click={() => on_chapter_button_click("previous")}
			/>
			{/* Main content */}
			<Box
				sx={{
					mt: 5,
					mb: `calc(100vh - (14 * ${theme.spacing()}))`,
					display: "flex",
					justifyContent: "center",
					width: "100%",
				}}
			>
				{
					verses ? 
						<ChapterContent
							verses={verses}
							button_space={button_space}
							chapter={current_chapter}
							bible_info={selected_bibles.bible}
							parallel_bible_info={selected_bibles.parallel}
							parallel_verses={parallel_verses}
						/>
						:
						<CircularProgress 
							size={60} 
							thickness={4}
							sx={{
								position: "fixed",
								left: "calc(50vw - 30px)",
								top: "calc(50vh - 30px)"
							}}
						/>
				}
			</Box>
			<ImageButton
				image={images.arrow_right}
				tooltip="To next chapter"
				sx={{
					position: "fixed",
					top: `calc(50% - ${button_height / 2}px)`,
					right: `${button_spacing}px`,
					minHeight: `${button_height}px`,
					height: `${button_height}px`,
					minWidth: `${button_width}px`,
					width: `${button_width}px`,
				}}
				on_click={() => on_chapter_button_click("next")}
			/>
			<Footer/>
		</Box>
    )
}