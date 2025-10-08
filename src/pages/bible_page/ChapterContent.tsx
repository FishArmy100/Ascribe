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
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={6} sx={{ borderRight: 1, borderColor: 'divider', pr: 2 }}>
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

                    {verses.map((v, i) => (
                        <Grid container spacing={2} key={i}>
                            <Grid size={6} sx={{ borderRight: 1, borderColor: 'divider', pr: 2 }}>
                                <BibleVerse render_data={v} verse_label={(i + 1).toString()} />
                            </Grid>

                            <Grid size={6} sx={{ pl: 2 }}>
                                <BibleVerse render_data={parallel_verses[i]} verse_label={(i + 1).toString()} />
                            </Grid>
                        </Grid>
                    ))}
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