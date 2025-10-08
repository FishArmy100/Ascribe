import { Box, CircularProgress, Divider, Paper, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import * as images from "../assets"
import { use_view_history } from "../components/providers/ViewHistoryProvider";
import { use_settings } from "../components/providers/SettingsProvider";
import * as bible from "../interop/bible";
import { ViewHistoryEntry } from "../interop/view_history";
import { VerseRenderData } from "../interop/bible/render";
import { TopBar, use_top_bar_padding, VersionSelector, ChapterPicker, SearchBar, ImageDropdown, TopBarSpacer, ImageButton, get_button_size, Footer } from "../components";
import BibleVerse from "../components/bible/BibleVerse";
import { push_search_to_view_history } from "../interop/searching";


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
	useEffect(() => {
		const chapter = view_history.get_current().current.chapter;
		const verse_ids = bible.get_chapter_verse_ids(selected_bibles.bible, chapter);

		bible.fetch_backend_verse_render_data(verse_ids, selected_bibles.bible.name).then(vs => {
			set_verses(vs);
		});
	}, [current_chapter, bible_name])

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

type ChapterContentProps = {
	verses: VerseRenderData[],
	button_space: number,
	chapter: bible.ChapterId,
	bible_info: bible.BibleInfo,
}

function ChapterContent({
	verses,
	button_space,
	chapter,
	bible_info,
}: ChapterContentProps): React.ReactElement
{
	let book_name = bible.get_book_info(bible_info, chapter.book).name;
	let chapter_name = `${book_name} ${chapter.chapter}`;

	return (
		<Paper
			sx={{
				borderRadius: 2,
				padding: 2,
				width: `calc(100% - ${button_space}px)`,
				minWidth: `calc(100% - ${button_space}px)`,
			}}
		>
			<Typography
				textAlign="center"
				variant="h4"
				fontWeight="bold"
				mb={2}
			>
				{chapter_name}
			</Typography>
			<Divider/>
			<Box sx={{ p: 2 }}>
				{
					verses.map((v, i) => {
						return <BibleVerse key={i} render_data={v}/>
					})
				}
			</Box>
		</Paper>
	)
}

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

function BiblePageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
	const { bible: selected_bible } = bible.use_selected_bibles()
	const placeholder = get_placeholder_text(view_history.get_current().current, selected_bible);

    return (
        <TopBar
				right_aligned={1}
			>
				<VersionSelector/>
				<ChapterPicker on_select={(c) => view_history.push({
                    type: 'chapter',
                    chapter: c,
                })}/>
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
}