import { VerseRenderData } from "../../interop/bible/render";
import * as bible from "../../interop/bible"
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import BibleVerse from "../../components/bible/BibleVerse";

type ChapterContentProps = {
    verses: VerseRenderData[],
    button_space: number,
    chapter: bible.ChapterId,
    bible_info: bible.BibleInfo,
    parallel_verses?: VerseRenderData[] | null,
    parallel_bible_info?: bible.BibleInfo | null,
}

export default function ChapterContent({
    verses,
    button_space,
    chapter,
    bible_info,
    parallel_verses,
    parallel_bible_info,
}: ChapterContentProps): React.ReactElement {
    const book_name = bible.get_book_info(bible_info, chapter.book).name;
    const chapter_name = `${book_name} ${chapter.chapter}`;

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

            {parallel_verses ? (
                <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" textAlign="center" mb={1}>
                            {bible_info.name}
                        </Typography>
                        {verses.map((v, i) => (
                            <BibleVerse key={i} render_data={v} verse_label={(i + 1).toString()} />
                        ))}
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" textAlign="center" mb={1}>
                            {parallel_bible_info?.name}
                        </Typography>
                        {parallel_verses.map((v, i) => (
                            <BibleVerse key={i} render_data={v} verse_label={(i + 1).toString()} />
                        ))}
                    </Box>
                </Box>
            ) : (
                <Box sx={{ p: 2 }}>
                    {verses.map((v, i) => (
                        <BibleVerse key={i} render_data={v} verse_label={(i + 1).toString()} />
                    ))}
                </Box>
            )}
        </Paper>
    );
}