import { Box, CircularProgress, Popover, useTheme } from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import * as images from "../../assets"
import { use_view_history } from "../../components/providers/ViewHistoryProvider";
import * as bible from "../../interop/bible";
import { VerseRenderData } from "../../interop/bible/render";
import { use_top_bar_padding, TopBarSpacer, ImageButton, Footer } from "../../components";
import ChapterContent from "./ChapterContent";
import { BiblePageToolbar } from "./BiblePageToolbar";
import { BUTTON_SIZE } from "../../components/core/ImageButton";
import { use_bible_display_settings } from "../../components/providers/BibleDisplaySettingsProvider";
import { format_strongs, StrongsNumber } from "../../interop/bible/strongs";
import StrongsPopover from "../../components/bible/StrongsPopover";

export default function BiblePage(): React.ReactElement {
	const theme = useTheme();
	const view_history = use_view_history();
	const selected_bibles = bible.use_selected_bibles();
	const { show_strongs } = use_bible_display_settings().bible_version_state;

	const current_view = view_history.get_current().current;
	const current_chapter = current_view.chapter;
	const bible_name = selected_bibles.bible.name;
	const parallel_bible_name = selected_bibles.parallel?.name;

	const [verses, set_verses] = useState<VerseRenderData[] | null>(null);
	const [parallel_verses, set_parallel_verses] = useState<VerseRenderData[] | null>(null);
	const [strongs_popover_anchor_el, set_strongs_anchor_el] = useState<HTMLElement | null>(null);
	const [strongs_popover_number, set_strongs_popover_number] = useState<StrongsNumber | null>(null);

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

	// Fetch verses effect with proper cleanup
	useEffect(() => {
		let is_mounted = true;
		
		const verse_ids = bible.get_chapter_verse_ids(selected_bibles.bible, current_chapter);

		// Fetch main version
		bible.fetch_backend_verse_render_data(verse_ids, bible_name)
			.then(vs => {
				if (is_mounted) set_verses(vs);
			});

		if (parallel_bible_name) 
		{
			bible.fetch_backend_verse_render_data(verse_ids, parallel_bible_name)
				.then(vs => {
					if (is_mounted) set_parallel_verses(vs);
				});
		} 
		else 
		{
			set_parallel_verses(null);
		}

		return () => {
			is_mounted = false;
		};
	}, [current_chapter, bible_name, parallel_bible_name, selected_bibles.bible]);

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

	const handle_strongs_click = useCallback((e: HTMLElement, s: StrongsNumber) => {
		set_strongs_anchor_el(e);
		set_strongs_popover_number(s);
	}, []);

	const handle_strongs_popover_close = useCallback(() => {
		set_strongs_anchor_el(null);
		set_strongs_popover_number(null);
	}, []);

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
						show_strongs={show_strongs}
						on_strongs_clicked={handle_strongs_click}
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
				anchor={strongs_popover_anchor_el} 
				strongs={strongs_popover_number} 
				on_close={handle_strongs_popover_close}			
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
