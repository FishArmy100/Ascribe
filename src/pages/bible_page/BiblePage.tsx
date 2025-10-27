import { Box, CircularProgress, Popover, useTheme } from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import * as images from "../../assets"
import { use_view_history, ViewHistoryContextType } from "../../components/providers/ViewHistoryProvider";
import * as bible from "../../interop/bible";
import { WordId } from "../../interop/bible";
import { RenderedVerseContent, VerseRenderData } from "../../interop/bible/render";
import { use_top_bar_padding, TopBarSpacer, ImageButton, Footer } from "../../components";
import ChapterContent from "./ChapterContent";
import { BiblePageToolbar } from "./BiblePageToolbar";
import { BUTTON_SIZE } from "../../components/core/ImageButton";
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";
import { format_strongs, StrongsNumber } from "../../interop/bible/strongs";
import StrongsPopover from "../../components/bible/StrongsPopover";
import WordPopover from "../../components/bible/WordPopover";
import { HRefSrc } from "../../interop/html_text";
import { ViewHistoryInfo, ViewHistoryEntry } from "../../interop/view_history";

export default function BiblePage(): React.ReactElement {
	const theme = useTheme();
	const view_history = use_view_history();
	const selected_bibles = bible.use_selected_bibles();
	const { bible_version_state, set_bible_version_state } = use_bible_display_settings();
	const show_strongs = bible_version_state.show_strongs;

	const current_view = view_history.get_current().current;
	const current_chapter = current_view.chapter;
	const bible_name = selected_bibles.bible.name;
	const parallel_bible_name = selected_bibles.parallel?.name;

	const [verses, set_verses] = useState<RenderedVerseContent[] | null>(null);
	const [parallel_verses, set_parallel_verses] = useState<RenderedVerseContent[] | null>(null);

	const [strongs_popover_anchor_pos, set_strongs_strongs_anchor_el] = useState<{top: number, left: number} | null>(null);
	const [strongs_popover_number, set_strongs_popover_number] = useState<StrongsNumber | null>(null);

	const [word_popover_anchor_el, set_word_popover_anchor_pos] = useState<{top: number, left: number} | null>(null);
	const [word_popover_data, set_word_popover_data] = useState<WordId | null>(null);

	const button_width = useMemo(() => BUTTON_SIZE * 0.75, []);
	const button_spacing = use_top_bar_padding(theme);
	const button_space = useMemo(
		() => button_width * 2 + button_spacing * 4,
		[button_width, button_spacing]
	);

	const current_verses = useMemo(() => {
		if (current_view.type === "verse") {
			return {
				start: current_view.start,
				end: current_view.end ?? current_view.start,
			};
		}
		return null;
	}, [current_view]);

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
		if (current_page.current.type !== "verse" && current_page.current.type !== "chapter") {
			return;
		}

		const chapter = type === "next"
			? bible.increment_chapter(selected_bibles.bible, current_page.current.chapter)
			: bible.decrement_chapter(selected_bibles.bible, current_page.current.chapter);

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
		set_strongs_strongs_anchor_el(e);
		set_strongs_popover_number(s);
	}, []);

	const handle_strongs_popover_close = useCallback(() => {
		set_strongs_strongs_anchor_el(null);
		set_strongs_popover_number(null);
	}, []);

	const handle_word_click = useCallback((e: { top: number, left: number }, word: bible.WordId) => {
		set_word_popover_anchor_pos(e)
		set_word_popover_data(word);
	}, []);

	const handle_word_popover_close = useCallback(() => {
		set_word_popover_anchor_pos(null);
		set_word_popover_data(null);
	}, [])

	const handle_ref_clicked = get_handle_ref_clicked_fn(set_bible_version_state, bible_version_state, show_strongs, view_history, () => {
		set_word_popover_anchor_pos(null);
		set_word_popover_data(null);
	})

	return (
		<Box>
			<BiblePageToolbar />
			<TopBarSpacer />
			
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
						on_strongs_clicked={handle_strongs_click}
						on_verse_word_clicked={handle_word_click}
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

			<StrongsPopover 
				pos={strongs_popover_anchor_pos}
				strongs={strongs_popover_number} 
				on_close={handle_strongs_popover_close}			
			/>

			<WordPopover
				pos={word_popover_anchor_el}
				word={word_popover_data}
				on_close={(handle_word_popover_close)}
				on_ref_clicked={handle_ref_clicked}
			/>
		</Box>
	);
}

const NavigationButton = React.memo(({ 
	direction, 
	onClick, 
	buttonWidth, 
	buttonSpacing 
}: { 
	direction: 'left' | 'right'; 
	onClick: () => void;
	buttonWidth: number;
	buttonSpacing: number;
}) => {
	const theme = useTheme();
	const isLeft = direction === 'left';
	
	return (
		<ImageButton
			image={isLeft ? images.arrow_left : images.arrow_right}
			tooltip={`To ${isLeft ? 'previous' : 'next'} chapter`}
			sx={{
				position: "fixed",
				top: `calc(50% - 30vh / 2)`,
				[isLeft ? 'left' : 'right']: theme.spacing(buttonSpacing),
				minHeight: "30vh",
				height: "30vh",
				minWidth: (theme) => theme.spacing(buttonWidth),
				width: (theme) => theme.spacing(buttonWidth),
			}}
			on_click={onClick}
		/>
	);
});

NavigationButton.displayName = 'NavigationButton';

const LoadingSpinner = React.memo(() => (
	<CircularProgress 
		size={60} 
		thickness={4}
		sx={{
			position: "fixed",
			left: (theme) => `calc(50vw - ${theme.spacing(4)})`,
			top: (theme) => `calc(50vh - ${theme.spacing(4)})`
		}}
	/>
));

LoadingSpinner.displayName = 'LoadingSpinner';

function get_handle_ref_clicked_fn(
	set_bible_version_state: (s: bible.BibleDisplaySettings) => Promise<void>, 
	bible_version_state: bible.BibleDisplaySettings, 
	show_strongs: boolean, 
	view_history: ViewHistoryContextType,
	on_click: () => void,
) 
{
	return (href: HRefSrc) => {
		on_click();
		const update_bible_version = (bible: string | null) => {
			bible && set_bible_version_state({
				bible_version: bible,
				parallel_enabled: bible_version_state.parallel_enabled,
				parallel_version: bible_version_state.parallel_version,
				show_strongs: show_strongs,
			});
		};

		if (href.type === "ref_id") {
			const id = href.value.id;
			const bible = href.value.bible;

			if (id.type === "range") {
				if (id.from.type !== "book" &&
					id.to.type !== "book" &&
					id.from.book === id.to.book &&
					id.from.chapter === id.to.chapter) {
					let start_verse: number | null = null;
					if (id.from.type !== "chapter") {
						start_verse = id.from.verse;
					}

					let end_verse: number | null = null;
					if (id.to.type !== "chapter") {
						end_verse = id.to.verse;
					}

					const book = id.from.book;
					if (start_verse !== null) {
						const chapter = id.from.chapter;
						view_history.push({
							type: "verse",
							chapter: { book, chapter },
							start: start_verse,
							end: end_verse,
						});
						update_bible_version(bible);
					}

					else {
						view_history.push({
							type: "chapter",
							chapter: { book, chapter: 1 }
						});

						update_bible_version(bible);
					}
				}

				else {
					const atom = id.from;
					const book = atom.book;
					if (atom.type === "book") {
						view_history.push({
							type: "chapter",
							chapter: { book, chapter: 1 }
						});

						update_bible_version(bible);
					}
					else if (atom.type === "chapter") {
						const chapter = atom.chapter;
						view_history.push({
							type: "chapter",
							chapter: { book, chapter }
						});
						update_bible_version(bible);
					}

					else {
						const chapter = atom.chapter;
						const verse = atom.verse;
						view_history.push({
							type: "verse",
							chapter: { book, chapter },
							start: verse,
							end: null,
						});
						update_bible_version(bible);
					}
				}
			}

			else {
				const book = id.atom.book;
				if (id.atom.type === "book") {
					view_history.push({
						type: "chapter",
						chapter: { book, chapter: 1 }
					});

					update_bible_version(bible);
				}
				else if (id.atom.type === "chapter") {
					const chapter = id.atom.chapter;
					view_history.push({
						type: "chapter",
						chapter: { book, chapter }
					});
					update_bible_version(bible);
				}

				else {
					const chapter = id.atom.chapter;
					const verse = id.atom.verse;
					view_history.push({
						type: "verse",
						chapter: { book, chapter },
						start: verse,
						end: null,
					});
					update_bible_version(bible);
				}
			}
		}
	};
}

