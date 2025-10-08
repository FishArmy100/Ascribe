import { VerseRenderData } from "../../interop/bible/render";
import * as bible from "../../interop/bible";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import BibleVerse from "../../components/bible/BibleVerse";

import { List, RowComponentProps, useDynamicRowHeight } from "react-window";

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

    const row_height = useDynamicRowHeight({
        defaultRowHeight: 100,
    })

    return (
        <Paper
            sx={{
                borderRadius: 2,
                padding: 2,
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
            <Divider sx={{ mb: 2 }}/>

            {parallel_verses && (
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

            <List
                rowCount={verses.length}
                rowHeight={row_height}
                rowProps={{ verses, parallel_verses }}
                rowComponent={RowComponent}
                overscanCount={5}
            />
        </Paper>
    );
}

function RowComponent({
    index,
    verses,
    parallel_verses,
    style,
}: RowComponentProps<{
    verses: VerseRenderData[],
    parallel_verses?: VerseRenderData[] | null
}>): React.ReactElement
{
    const v = verses[index];
    const pv = parallel_verses?.[index];

    return (
        <div style={style}>
            {parallel_verses ? (
                <Grid container spacing={2}>
                    <Grid size={6} sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
                        <BibleVerse
                            render_data={v}
                            verse_label={(index + 1).toString()}
                        />
                    </Grid>
                    <Grid size={6} sx={{ pl: 2 }}>
                        {pv && (
                            <BibleVerse
                                render_data={pv}
                                verse_label={(index + 1).toString()}
                            />
                        )}
                    </Grid>
                </Grid>
            ) : (
                <BibleVerse
                    render_data={v}
                    verse_label={(index + 1).toString()}
                />
            )}
        </div>
    );
}