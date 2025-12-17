import { RenderedVerseContent } from "../../interop/bible/render";
import * as bible from "../../interop/bible";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { useEffect, useState, useMemo, useCallback, useRef, forwardRef, useLayoutEffect } from "react";
import React from "react";
import { BookClickedCallback, ChapterClickedCallback, StrongsClickedCallback, VerseClickedCallback, VerseWordClickedCallback } from "../../components/bible/BibleVerse";
import { Theme } from "@mui/material/styles";
import { SystemStyleObject } from "@mui/system";
import { RenderedVerse } from "../../components/bible/RenderedVerse";
import { use_settings } from "../../components/providers/SettingsProvider";

type ChapterContentProps = {
    verses: RenderedVerseContent[],
    button_space: number,
    chapter: bible.ChapterId,
    bible_info: bible.BibleInfo,
	on_strongs_clicked: StrongsClickedCallback,
	on_verse_word_clicked: VerseWordClickedCallback,
	on_verse_clicked: VerseClickedCallback,
	on_chapter_clicked: ChapterClickedCallback,
	on_book_clicked: BookClickedCallback,
    parallel_verses?: RenderedVerseContent[] | null,
    parallel_bible_info?: bible.BibleInfo | null,
    focused_range: { start: number, end: number } | null,
	audio_index: number | null,
};

export default function ChapterContent({
    verses,
    button_space,
    chapter,
    bible_info,
	on_strongs_clicked,
	on_verse_word_clicked,
	on_verse_clicked,
	on_chapter_clicked,
	on_book_clicked,
    parallel_verses,
    parallel_bible_info,
    focused_range,
	audio_index,
}: ChapterContentProps): React.ReactElement {
    const book_name = bible.get_book_info(bible_info, chapter.book).name;
    const chapter_number = chapter.chapter.toString();
    const [show_focused_verses, set_show_focused_verses] = useState(true);
	const [verses_loaded, set_verses_loaded] = useState(false);
	const { settings } = use_settings();

    useEffect(() => {
        set_show_focused_verses(true);
		set_verses_loaded(false);
    }, [focused_range, parallel_bible_info?.id, bible_info.id, chapter]);

	useEffect(() => {
        // Mark verses as loaded after they've been rendered
        if (verses.length > 0) {
            set_verses_loaded(true);
        }
    }, [verses]);

    const row_refs = useRef<{ [v: number]: HTMLDivElement | null }>({});
    
    // Track if we've already scrolled for this focused_range
    const last_scrolled_range = useRef<string | null>(null);

    useEffect(() => {
        if (focused_range !== null && show_focused_verses && verses_loaded)
        {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                const target_ref = row_refs.current[focused_range.start - 1];
                if (target_ref) 
                {
                    target_ref.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            });
        } 
		else 
		{
            // Reset when focused_range is cleared
            last_scrolled_range.current = null;
        }
    }, [focused_range, parallel_bible_info?.id, bible_info.id, chapter, show_focused_verses, verses_loaded]);

	const prev_audio_index = useRef<number | null>(null);
	useEffect(() => {
		if (audio_index !== null && audio_index !== prev_audio_index.current && settings.tts_settings.follow_text)
		{
			const target_ref = row_refs.current[audio_index];
			if (target_ref) 
			{
				target_ref.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}

			prev_audio_index.current = audio_index;
		}
	}, [audio_index])

	const handle_set_show_focused_verses = useCallback((v: boolean) => {
		set_show_focused_verses(v);
	}, []);

	const handle_chapter_click = (e: React.MouseEvent<HTMLElement>) => {
		const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const pos = { top: rect.top, left: rect.left };

		on_chapter_clicked(pos, chapter)
	}

	const handle_book_click = (e: React.MouseEvent<HTMLElement>) => {
		const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const pos = { top: rect.top, left: rect.left };

		on_book_clicked(pos, chapter.book)
	}

    return (
        <Paper
            sx={{
                borderRadius: 2,
                padding: 4,
                width: (theme) => `calc(100% - ${theme.spacing(button_space)})`,
                minWidth: (theme) => `calc(100% - ${theme.spacing(button_space)})`,
            }}
        >

            <Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				gap={(theme) => theme.spacing(1.5)}
			>
				<Typography
					textAlign="center"
					variant="h4"
					fontWeight="bold"
					mb={2}
					onClick={handle_book_click}
					className="animated-underline-thick"
					sx={{
						cursor: "pointer",
					}}
				>
					{book_name}
				</Typography>
				<Typography
					textAlign="center"
					variant="h4"
					fontWeight="bold"
					mb={2}
					onClick={handle_chapter_click}
					className="animated-underline-thick"
					sx={{
						cursor: "pointer",
					}}
				>
					{chapter_number}
				</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {parallel_verses && (
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 0 }}
                >
                    <Grid size={6} sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
                        <Typography variant="h6" textAlign="center" fontWeight="bold">
                            {bible_info.display_name}
                        </Typography>
                    </Grid>
                    <Grid size={6} sx={{ pl: 2 }}>
                        <Typography variant="h6" textAlign="center" fontWeight="bold">
                            {parallel_bible_info?.display_name}
                        </Typography>
                    </Grid>
                </Grid>
            )}

            {verses.map((_, index) => (
                <RowComponent
                    key={`${bible_info.id}-${chapter.book}-${chapter.chapter}-${index}`}
                    ref={(el) => { row_refs.current[index] = el; }}
                    index={index}
                    verses={verses}
                    parallel_verses={parallel_verses}
                    focused_range={focused_range}
                    show_focused_verses={show_focused_verses}
                    set_show_focused_verses={handle_set_show_focused_verses}
					on_strongs_clicked={on_strongs_clicked}
					on_verse_word_clicked={on_verse_word_clicked}
					on_verse_clicked={on_verse_clicked}
					is_audio_focused={audio_index === index}
                />
            ))}
        </Paper>
    );
}

type RowComponentProps = {
	index: number,
	verses: RenderedVerseContent[],
	parallel_verses?: RenderedVerseContent[] | null,
	focused_range: { start: number; end: number } | null,
	show_focused_verses: boolean,
	is_audio_focused: boolean,
	set_show_focused_verses: (v: boolean) => void,
	on_strongs_clicked: StrongsClickedCallback,
	on_verse_word_clicked: VerseWordClickedCallback,
	on_verse_clicked: VerseClickedCallback,
};

// --- forwardRef so parent can attach a ref ---
const RowComponentBase = forwardRef<HTMLDivElement, RowComponentProps>((
    {
		index,
		verses,
		parallel_verses,
		focused_range,
		show_focused_verses,
		is_audio_focused,
		set_show_focused_verses,
		on_strongs_clicked,
		on_verse_word_clicked,
		on_verse_clicked,
    },
    ref
	) => {
		const v = verses[index];
		const pv = parallel_verses?.[index];

		const is_focused = useMemo(() => {
			if (!show_focused_verses || !focused_range) 
				return false;
			return index + 1 >= focused_range.start && index + 1 <= focused_range.end;
		}, [index, show_focused_verses, focused_range]);

		const rounded_top = useMemo(() => {
			if (is_audio_focused)
				return true;

			if (!focused_range || !show_focused_verses || index === 0) 
				return true;
			return !(index > focused_range.start - 1 && index <= focused_range.end - 1);
		}, [index, focused_range, show_focused_verses, is_audio_focused]);

		const rounded_bottom = useMemo(() => {
			if (is_audio_focused)
				return true;

			if (!focused_range || !show_focused_verses || index === verses.length - 1) 
				return true;
			return !(index >= focused_range.start - 1 && index < focused_range.end - 1);
		}, [index, focused_range, verses.length, is_audio_focused]);

		const handle_click = useCallback(() => {
			if (is_focused && show_focused_verses) 
			{
				set_show_focused_verses(false);
			}
		}, [is_focused, show_focused_verses, set_show_focused_verses]);

		const verse_box_style = useCallback(
			(theme: Theme): SystemStyleObject<Theme> => ({
				padding: 1,
				borderTopLeftRadius: theme.spacing(rounded_top ? 1 : 0),
				borderTopRightRadius: theme.spacing(rounded_top ? 1 : 0),
				borderBottomLeftRadius: theme.spacing(rounded_bottom ? 1 : 0),
				borderBottomRightRadius: theme.spacing(rounded_bottom ? 1 : 0),
				borderLeftWidth: is_audio_focused ? theme.spacing(1) : undefined,
				borderLeftColor: is_audio_focused ? theme.palette.primary.main : undefined,
				borderLeftStyle: is_audio_focused ? "solid" : undefined,
				transition: "background-color 0.2s ease",
				backgroundColor: is_focused || is_audio_focused ? theme.palette.action.hover : undefined,

				display: "flex",
				flexDirection: "column",
				width: "100%",

				"&:hover": {
					backgroundColor: theme.palette.action.hover,
				},
			}),
			[rounded_top, rounded_bottom, is_focused, is_audio_focused]
		);

		return (
			<div ref={ref}>
				{parallel_verses ? (
					<Grid container spacing={2} alignItems="stretch">
						<Grid
							size={6}
							sx={{
								borderRight: 1,
								borderColor: "divider",
								pr: 2,
								display: "flex",
							}}
						>
							<Box onClick={handle_click} sx={verse_box_style}>
								<RenderedVerse 
									content={v} 
									verse_label={(index + 1).toString()} 
									on_strongs_clicked={on_strongs_clicked} 
									on_verse_word_clicked={on_verse_word_clicked}
									on_verse_label_clicked={on_verse_clicked}
								/>
							</Box>
						</Grid>
						<Grid size={6} sx={{ pl: 2, display: "flex" }}>
							{pv && (
								<Box onClick={handle_click} sx={verse_box_style}>
									<RenderedVerse 
										content={pv} 
										verse_label={(index + 1).toString()} 
										on_strongs_clicked={on_strongs_clicked} 
										on_verse_word_clicked={on_verse_word_clicked}
										on_verse_label_clicked={on_verse_clicked}
									/>
								</Box>
							)}
						</Grid>
					</Grid>
				) : (
					<Box onClick={handle_click} sx={verse_box_style}>
						<RenderedVerse 
							content={v} 
							verse_label={(index + 1).toString()} 
							on_strongs_clicked={on_strongs_clicked}
							on_verse_word_clicked={on_verse_word_clicked}
							on_verse_label_clicked={on_verse_clicked}
						/>
					</Box>
				)}
			</div>
		);
	}
);

export const RowComponent = React.memo(RowComponentBase, (prev, next) => {
    const same_focus =
        prev.show_focused_verses === next.show_focused_verses &&
        prev.focused_range?.start === next.focused_range?.start &&
        prev.focused_range?.end === next.focused_range?.end;

    const same_content =
        prev.verses[prev.index].html === next.verses[next.index].html &&
        prev.parallel_verses?.[prev.index]?.html === next.parallel_verses?.[next.index]?.html;

    const same_audio_index = prev.is_audio_focused === next.is_audio_focused;

    const is_same = same_focus && same_content && same_audio_index;
	return is_same;
});