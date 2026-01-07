import { Box, useTheme } from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import * as bible from "../../interop/bible";
import { RenderedVerseContent } from "../../interop/bible/render";
import { use_top_bar_padding, TopBarSpacer, Footer } from "../../components";
import ChapterContent from "./ChapterContent";
import { BUTTON_SIZE } from "../../components/core/ImageButton";
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";
import { StrongsNumber } from "../../interop/bible/strongs";
import AudioPlayer from "../../components/audio_player/AudioPlayer";
import { use_tts_player } from "../../components/providers/TtsPlayerProvider";
import PopoverManager, { PopoverData } from "@components/popovers/PopoverManager";
import { ChapterHistoryEntry, VerseHistoryEntry } from "@interop/view_history";
import { NavigationButton } from "./NavigationButton";
import { LoadingSpinner } from "../LoadingSpinner";
import { get_handle_ref_clicked_callback } from "../page_utils";
import { BiblePageToolbar } from "./BiblePageToolbar";

export type BiblePageProps = {
	entry: ChapterHistoryEntry | VerseHistoryEntry,
}

export default function BiblePage({
	entry
}: BiblePageProps): React.ReactElement {
	const theme = useTheme();
	const view_history = use_view_history();
	const selected_bibles = bible.use_selected_bibles();
	const { bible_version_state, set_bible_version_state } = use_bible_display_settings();
	const show_strongs = bible_version_state.show_strongs;

	const current_chapter = entry.chapter;
	const bible_name = selected_bibles.bible.id;
	const parallel_bible_name = selected_bibles.parallel?.id;

	const [verses, set_verses] = useState<RenderedVerseContent[] | null>(null);
	const [parallel_verses, set_parallel_verses] = useState<RenderedVerseContent[] | null>(null);
	
	const [popover_data, set_popover_data] = useState<PopoverData | null>(null);

	const [player_open, set_player_open] = useState(false);

	const [verse_index, set_verse_index] = useState<number | null>(null)
	const tts_player = use_tts_player();
	useEffect(() => {
		set_verse_index(tts_player.verse_index);
	}, [tts_player.verse_index]);

	const button_width = useMemo(() => BUTTON_SIZE * 0.75, []);
	const button_spacing = use_top_bar_padding(theme);
	const button_space = useMemo(
		() => button_width * 2 + button_spacing * 4,
		[button_width, button_spacing]
	);

	const current_verses = useMemo(() => {
		if (entry.type === "verse") {
			return {
				start: entry.start,
				end: entry.end ?? entry.start,
			};
		}
		return null;
	}, [entry]);

	useEffect(() => {
		let is_mounted = true;
		const verse_ids = bible.get_chapter_verse_ids(selected_bibles.bible, current_chapter);

		const fetch_verses = async () => {
			const verses_promise = bible.backend_render_verse_words(verse_ids, bible_name, show_strongs);
			const parallel_verses_promise = parallel_bible_name
				? bible.backend_render_verse_words(verse_ids, parallel_bible_name, show_strongs)
				: Promise.resolve(null);

			const [verses, parallel_verses] = await Promise.all([
				verses_promise,
				parallel_verses_promise,
			]);

			if (is_mounted)
			{
				set_verses(verses);
				set_parallel_verses(parallel_verses);
			}
		}

		fetch_verses();
		return () => {
			is_mounted = false;
		}

	}, [current_chapter, bible_name, parallel_bible_name, selected_bibles.bible, show_strongs]);

	const handle_chapter_navigation = useCallback((type: "next" | "previous") => {
		const current_page = view_history.get_current();
		if (current_page.type !== "verse" && current_page.type !== "chapter") {
			return;
		}

		const chapter = type === "next"
			? bible.increment_chapter(selected_bibles.bible, current_page.chapter)
			: bible.decrement_chapter(selected_bibles.bible, current_page.chapter);

		view_history.push({
			type: "chapter",
			chapter,
		});
	}, [view_history, selected_bibles.bible]);

	const handle_previous_chapter = useCallback(
		() => handle_chapter_navigation("previous"),
		[handle_chapter_navigation]
	);

	const handle_next_chapter = useCallback(
		() => handle_chapter_navigation("next"),
		[handle_chapter_navigation]
	);

	const handle_strongs_click = useCallback((e: { top: number, left: number }, s: StrongsNumber) => {
		set_popover_data({
			type: "strongs",
			strongs_number: s,
			position: { top: e.top, left: e.left }
		})
	}, []);

	const handle_word_click = useCallback((e: { top: number, left: number }, bible_id: string, word: bible.WordId) => {
		set_popover_data({
			bible_id,
			type: "word",
			word,
			position: e
		})
	}, []);

	const handle_verse_click = useCallback((e: { top: number, left: number }, verse: bible.VerseId) => {
		set_popover_data({
			type: "verse",
			verse,
			position: e
		})
	}, []);

	const handle_chapter_click = useCallback((e: { top: number, left: number }, chapter: bible.ChapterId) => {
		set_popover_data({
			type: "chapter",
			chapter,
			position: e
		})
	}, []);

	const handle_book_click = useCallback((e: { top: number, left: number }, book: bible.OsisBook) => {
		set_popover_data({
			type: "book",
			book,
			position: e
		})
	}, []);

	const handle_ref_clicked = get_handle_ref_clicked_callback(set_bible_version_state, bible_version_state, view_history, () => {
		set_popover_data(null)
	});

	const handle_popover_close = useCallback(() => {
		set_popover_data(null)
	}, [])

	const handle_player_button_click = useCallback(() => {
		set_player_open(prev => !prev);
	}, [])

	return (
		<Box>
			<BiblePageToolbar
				player_open={player_open}
				on_click_player={handle_player_button_click}
			/>
			
			<NavigationButton 
				direction="left"
				onClick={handle_previous_chapter}
				buttonWidth={button_width}
				buttonSpacing={button_spacing}
			/>

			<Box
				sx={{
					mt: 5,
					mb: `calc(100vh - (${theme.spacing(14)}))`,
					display: "flex",
					justifyContent: "center",
					width: "100%",
				}}
			>
				{verses ? (
					<ChapterContent
						verses={verses}
						button_space={button_space}
						chapter={current_chapter}
						bible_info={selected_bibles.bible}
						parallel_bible_info={selected_bibles.parallel}
						parallel_verses={parallel_verses}
						focused_range={current_verses}
						audio_index={verse_index}
						on_strongs_clicked={handle_strongs_click}
						on_verse_word_clicked={handle_word_click}
						on_verse_clicked={handle_verse_click}
						on_chapter_clicked={handle_chapter_click}
						on_book_clicked={handle_book_click}
					/>
				) : (
					<LoadingSpinner />
				)}
			</Box>

			<NavigationButton 
				direction="right"
				onClick={handle_next_chapter}
				buttonWidth={button_width}
				buttonSpacing={button_spacing}
			/>

			<Footer />

			<PopoverManager
				data={popover_data}
				on_ref_clicked={handle_ref_clicked}
				on_close={handle_popover_close}
			/>

			<AudioPlayer 
				open={player_open} 
				current_chapter={entry.chapter}
			/>
		</Box>
	);
}


