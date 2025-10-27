import { RenderedVerseContent, VerseRenderData } from "../../interop/bible/render";
import * as bible from "../../interop/bible";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { useEffect, useState, useMemo, useCallback, useRef, forwardRef, useLayoutEffect } from "react";
import React from "react";
import BibleVerseRaw, { StrongsClickedCallback, VerseWordClickedCallback } from "../../components/bible/BibleVerse";
import { SxProps, Theme } from "@mui/material/styles";
import { SystemStyleObject } from "@mui/system";
import RenderedVerse from "../../components/bible/RenderedVerse";

type ChapterContentProps = {
    verses: RenderedVerseContent[],
    button_space: number,
    chapter: bible.ChapterId,
    bible_info: bible.BibleInfo,
	on_strongs_clicked: StrongsClickedCallback,
	on_verse_word_clicked: VerseWordClickedCallback,
    parallel_verses?: RenderedVerseContent[] | null,
    parallel_bible_info?: bible.BibleInfo | null,
    focused_range: { start: number, end: number } | null,
};

export default function ChapterContent({
    verses,
    button_space,
    chapter,
    bible_info,
	on_strongs_clicked,
	on_verse_word_clicked,
    parallel_verses,
    parallel_bible_info,
    focused_range,
}: ChapterContentProps): React.ReactElement {
    const book_name = bible.get_book_info(bible_info, chapter.book).name;
    const chapter_name = `${book_name} ${chapter.chapter}`;
    const [show_focused_verses, set_show_focused_verses] = useState(true);

    useEffect(() => {
        set_show_focused_verses(true);
    }, [chapter, bible_info.name, parallel_bible_info?.name, focused_range]);

    const row_refs = useRef<{ [v: number]: HTMLDivElement | null }>({});
    
    // Track if we've already scrolled for this focused_range
    const last_scrolled_range = useRef<string | null>(null);

    useLayoutEffect(() => {
        if (focused_range !== null && show_focused_verses)
        {
            // Create a unique key for this scroll target
            const scroll_key = `${chapter.book}-${chapter.chapter}-${focused_range.start}-${focused_range.end}-${bible_info.name}-${parallel_bible_info?.name}`;
            
            // Only scroll if we haven't already scrolled to this exact location
            if (last_scrolled_range.current !== scroll_key) {
                console.log("Scrolling to verse:", focused_range.start);
                
                // Double requestAnimationFrame to ensure layout is complete
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const target_ref = row_refs.current[focused_range.start - 1];
                        if (target_ref) {
                            // Use a small timeout to let any layout shifts settle
                            setTimeout(() => {
                                target_ref.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                            }, 50);
                            last_scrolled_range.current = scroll_key;
                        }
                    });
                });
            }
        } else {
            // Reset when focused_range is cleared
            last_scrolled_range.current = null;
        }
    }, [focused_range, chapter, bible_info.name, parallel_bible_info?.name, show_focused_verses, verses]);

    return (
        <Paper
            sx={{
                borderRadius: 2,
                padding: 4,
                width: (theme) => `calc(100% - ${theme.spacing(button_space)})`,
                minWidth: (theme) => `calc(100% - ${theme.spacing(button_space)})`,
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
            <Divider sx={{ mb: 2 }} />

            {parallel_verses && (
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 0 }}
                >
                    <Grid size={6} sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
                        <Typography variant="h6" textAlign="center" fontWeight="bold">
                            {bible_info.name}
                        </Typography>
                    </Grid>
                    <Grid size={6} sx={{ pl: 2 }}>
                        <Typography variant="h6" textAlign="center" fontWeight="bold">
                            {parallel_bible_info?.name}
                        </Typography>
                    </Grid>
                </Grid>
            )}

            {verses.map((_, index) => (
                <RowComponent
                    key={`${bible_info.name}-${chapter.book}-${chapter.chapter}-${index}`}
                    ref={(el) => { row_refs.current[index] = el; }}
                    index={index}
                    verses={verses}
                    parallel_verses={parallel_verses}
                    focused_range={focused_range}
                    show_focused_verses={show_focused_verses}
                    set_show_focused_verses={set_show_focused_verses}
					on_strongs_clicked={on_strongs_clicked}
					on_verse_word_clicked={on_verse_word_clicked}
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
	set_show_focused_verses: (v: boolean) => void,
	on_strongs_clicked: StrongsClickedCallback,
	on_verse_word_clicked: VerseWordClickedCallback,
};

// --- forwardRef so parent can attach a ref ---
const RowComponentBase = forwardRef<HTMLDivElement, RowComponentProps>((
    {
		index,
		verses,
		parallel_verses,
		focused_range,
		show_focused_verses,
		set_show_focused_verses,
		on_strongs_clicked,
		on_verse_word_clicked,
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
			if (!focused_range || !show_focused_verses || index === 0) 
				return true;
			return !(index > focused_range.start - 1 && index <= focused_range.end - 1);
		}, [index, focused_range, show_focused_verses]);

		const rounded_bottom = useMemo(() => {
			if (!focused_range || !show_focused_verses || index === verses.length - 1) 
				return true;
			return !(index >= focused_range.start - 1 && index < focused_range.end - 1);
		}, [index, focused_range, verses.length]);

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
				transition: "background-color 0.2s ease",
				backgroundColor: is_focused ? theme.palette.action.selected : undefined,

				display: "flex",
				flexDirection: "column",
				width: "100%",

				"&:hover": {
					backgroundColor: theme.palette.action.hover,
				},
			}),
			[rounded_top, rounded_bottom, is_focused]
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
		prev.verses[prev.index] === next.verses[next.index] &&
		prev.parallel_verses?.[prev.index] === next.parallel_verses?.[next.index];

	return same_focus && same_content;
});