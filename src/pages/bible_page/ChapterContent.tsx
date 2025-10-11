import { VerseRenderData } from "../../interop/bible/render";
import * as bible from "../../interop/bible";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { useEffect, useState, useMemo, useCallback, useRef, forwardRef } from "react";
import React from "react";
import BibleVerseRaw from "../../components/bible/BibleVerse";
import { SxProps, Theme } from "@mui/material/styles";
import { SystemStyleObject } from "@mui/system";

type ChapterContentProps = {
    verses: VerseRenderData[],
    button_space: number,
    chapter: bible.ChapterId,
    bible_info: bible.BibleInfo,
    parallel_verses?: VerseRenderData[] | null,
    parallel_bible_info?: bible.BibleInfo | null,
    focused_range: { start: number, end: number } | null
};

// Memoized version of BibleVerse (to prevent re-rendering heavy components)
const BibleVerse = React.memo(BibleVerseRaw);

export default function ChapterContent({
    verses,
    button_space,
    chapter,
    bible_info,
    parallel_verses,
    parallel_bible_info,
    focused_range
}: ChapterContentProps): React.ReactElement {
    const book_name = bible.get_book_info(bible_info, chapter.book).name;
    const chapter_name = `${book_name} ${chapter.chapter}`;
    const [show_focused_verses, set_show_focused_verses] = useState(true);

    useEffect(() => {
        set_show_focused_verses(true);
    }, [chapter, bible_info.name, parallel_bible_info?.name, focused_range]);

    // Memoize verse arrays so they don't cause re-renders on shallow changes
    const memo_verses = useMemo(() => verses, [verses]);
    const memo_parallel_verses = useMemo(() => parallel_verses, [parallel_verses]);

    const row_refs = useRef<{ [v: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (focused_range !== null && show_focused_verses)
        {
            row_refs.current[focused_range.start - 1]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        }
    }, [focused_range, chapter, bible_info.name, parallel_bible_info?.name])

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

            {memo_parallel_verses && (
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 0 }}
                >
                    <Grid size={6} sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
                        <Typography variant="h6" textAlign="center">
                            {bible_info.name}
                        </Typography>
                    </Grid>
                    <Grid size={6} sx={{ pl: 2 }}>
                        <Typography variant="h6" textAlign="center">
                            {parallel_bible_info?.name}
                        </Typography>
                    </Grid>
                </Grid>
            )}

            {memo_verses.map((_, index) => (
                <RowComponent
                    key={`${bible_info.name}-${chapter.book}-${chapter.chapter}-${index}`}
                    ref={(el) => { row_refs.current[index] = el; }}
                    index={index}
                    verses={memo_verses}
                    parallel_verses={memo_parallel_verses}
                    focused_range={focused_range}
                    show_focused_verses={show_focused_verses}
                    set_show_focused_verses={set_show_focused_verses}
                />
            ))}
        </Paper>
    );
}

type RowComponentProps = {
  index: number;
  verses: VerseRenderData[];
  parallel_verses?: VerseRenderData[] | null;
  focused_range: { start: number; end: number } | null;
  show_focused_verses: boolean;
  set_show_focused_verses: (v: boolean) => void;
};

// --- forwardRef so parent can attach a ref ---
const RowComponentBase = forwardRef<HTMLDivElement, RowComponentProps>(
  (
    {
      index,
      verses,
      parallel_verses,
      focused_range,
      show_focused_verses,
      set_show_focused_verses,
    },
    ref
  ) => {
    const v = verses[index];
    const pv = parallel_verses?.[index];

    const is_focused = useMemo(() => {
      if (!show_focused_verses || !focused_range) return false;
      return index + 1 >= focused_range.start && index + 1 <= focused_range.end;
    }, [index, show_focused_verses, focused_range]);

    const rounded_top = useMemo(() => {
      if (!focused_range || !show_focused_verses || index === 0) return true;
      return !(index > focused_range.start - 1 && index <= focused_range.end - 1);
    }, [index, focused_range, show_focused_verses]);

    const rounded_bottom = useMemo(() => {
      if (!focused_range || !show_focused_verses || index === verses.length - 1) return true;
      return !(index >= focused_range.start - 1 && index < focused_range.end - 1);
    }, [index, focused_range, verses.length]);

    const handle_click = useCallback(() => {
      if (is_focused && show_focused_verses) {
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
                <BibleVerse render_data={v} verse_label={(index + 1).toString()} />
              </Box>
            </Grid>
            <Grid size={6} sx={{ pl: 2, display: "flex" }}>
              {pv && (
                <Box onClick={handle_click} sx={verse_box_style}>
                  <BibleVerse render_data={pv} verse_label={(index + 1).toString()} />
                </Box>
              )}
            </Grid>
          </Grid>
        ) : (
          <Box onClick={handle_click} sx={verse_box_style}>
            <BibleVerse render_data={v} verse_label={(index + 1).toString()} />
          </Box>
        )}
      </div>
    );
  }
);

// --- wrap with React.memo after forwardRef ---
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

