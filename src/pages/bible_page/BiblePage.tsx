import { Box, CircularProgress, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import * as images from "../../assets"
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import * as bible from "../../interop/bible";
import { VerseRenderData } from "../../interop/bible/render";
import { use_top_bar_padding, TopBarSpacer, ImageButton, Footer } from "../../components";
import ChapterContent from "./ChapterContent";
import BiblePageToolbar from "./BiblePageToolbar";
import { BUTTON_SIZE } from "../../components/core/ImageButton";
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";


export default function BiblePage(): React.ReactElement
{
	const button_width = BUTTON_SIZE * 0.75;
	const theme = useTheme();
	
	const button_spacing = use_top_bar_padding(theme);
	const button_space = button_width * 2 + button_spacing * 4;
	const view_history = use_view_history();
	const selected_bibles = bible.use_selected_bibles();
	const { show_strongs } = use_bible_display_settings().bible_version_state;

	const current_view = view_history.get_current().current;
	const current_chapter = current_view.chapter;
	const bible_name = selected_bibles.bible.name;

	let current_verses = null;

	if (current_view.type === "verse")
	{
		current_verses = {
			start: current_view.start,
			end: current_view.end ?? current_view.start,
		};
	}

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
					top: `calc(50% - 30vh / 2)`,
					left: theme.spacing(button_spacing),
					minHeight: "30vh",
					height: "30vh",
					minWidth: (theme) => theme.spacing(button_width),
					width: (theme) => theme.spacing(button_width),
				}}
				on_click={() => on_chapter_button_click("previous")}
			/>
			{/* Main content */}
			<Box
				sx={{
					mt: 5,
					mb: `calc(100vh - (${theme.spacing(14)}))`,
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
							focused_range={current_verses}
							show_strongs={show_strongs}
						/>
						:
						<CircularProgress 
							size={60} 
							thickness={4}
							sx={{
								position: "fixed",
								left: (theme) => `calc(50vw - ${theme.spacing(4)})`,
								top: (theme) => `calc(50vh - ${theme.spacing(4)})`
							}}
						/>
				}
			</Box>
			<ImageButton
				image={images.arrow_right}
				tooltip="To next chapter"
				sx={{
					position: "fixed",
					top: `calc(50% - 30vh / 2)`,
					right: theme.spacing(button_spacing),
					minHeight: "30vh",
					height: "30vh",
					minWidth: (theme) => theme.spacing(button_width),
					width: (theme) => theme.spacing(button_width),
				}}
				on_click={() => on_chapter_button_click("next")}
			/>
			<Footer/>
		</Box>
    )
}