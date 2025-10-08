import React, { useState } from "react";
import { ChapterId, OsisBook } from "../../interop/bible";
import * as images from "../../assets";
import { use_settings } from "../providers/SettingsProvider";
import { Box, Collapse, ListItemButton, ListItemText, Paper, Grid, Typography, useTheme, Button } from "@mui/material";
import ImageButton from "../core/ImageButton";
import { use_bible_infos } from "../providers/BibleInfoProvider";
import { use_bible_version_state } from "../providers/BibleVersionProvider";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import * as utils from "../../utils";
import { use_top_bar_padding } from "../TopBar";
import { AppSettings } from "../../interop/settings";

const GRID_ITEM_SIZE: number = 4;
const GRID_ITEM_COUNT_X: number = 6;
function get_grid_width(padding: number, settings: AppSettings): number
{
    return (GRID_ITEM_SIZE * settings.ui_scale * GRID_ITEM_COUNT_X) + (padding * (GRID_ITEM_COUNT_X + 1));
}

export type ChapterPickerProps = {
    on_select: (chapter: ChapterId) => void,
}

export default function ChapterPicker({
    on_select
}: ChapterPickerProps): React.ReactElement
{
    const { settings } = use_settings();
    const [is_open, set_open] = useState(false);
    const { bible_infos } = use_bible_infos();
    const { bible_version_state } = use_bible_version_state();
    const [expanded_book, set_expanded_book] = useState<OsisBook | null>(null);
    const theme = useTheme();
    const padding = use_top_bar_padding(theme);

    const bible_info = bible_infos[bible_version_state.bible_version];

    const options = bible_info.books.map(b => { return {
        id: b.osis_book,
        name: b.name,
        count: b.chapters.length,
    }});

    const handle_book_click = (id: OsisBook) => {
        set_expanded_book(expanded_book === id ? null : id);
    }

    let inner_on_select = (chapter: ChapterId) => {
        set_open(false);
        set_expanded_book(null);
        on_select(chapter);
    }

    const dropdown_width = get_grid_width(padding, settings);

    return (
        <Box
            sx={{
                position: "relative"
            }}
            className="dropdown-button"
        >
            <ImageButton
                image={images.books}
                tooltip="Select chapter"
                active={is_open}
                on_click={() => {
                    set_open(!is_open)
                }}
            />
            <Paper
                sx={{
                    position: "absolute",
                    top: `100%`,
                    visibility: is_open ? "visible" : "hidden",
                    opacity: is_open ? 1 : 0,
                    pointerEvents: is_open ? "all" : "none",
                    transition: "opacity 0.2s ease, visibility 0.2s ease",
                    overflowY: "auto",
                    maxHeight: (theme) => theme.spacing(300 / 8),
                    maxWidth: (theme) => theme.spacing(dropdown_width),
                    width: (theme) => theme.spacing(dropdown_width),

                    scrollbarGutter: "stable", // Reserves space for scrollbar
                    "&::-webkit-scrollbar": {
                        width: (theme) => theme.spacing(1),
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.action.active,
                        borderRadius: (theme) => theme.spacing(1 / 2),
                    }
                }}
                className="dropdown-content"
            >
                {options.map(o => (
                    <BookSelection
                        id={o.id}
                        name={o.name}
                        chapter_count={o.count}
                        expanded_id={expanded_book}
                        on_select={inner_on_select}
                        handle_book_click={handle_book_click}
                        key={o.id}
                    />
                    
                ))}
            </Paper>
            <style>
                {`
                    .dropdown-button:hover .dropdown-content {
                        opacity: 1;
                        visibility: visible;
                        pointer-events: auto;
                    }
                `}
            </style>
        </Box>
    )
}

type BookSelectionProps = {
    id: OsisBook,
    name: string,
    chapter_count: number,
    expanded_id: OsisBook | null,
    on_select: (chapter: ChapterId) => void,
    handle_book_click: (id: OsisBook) => void,
}

function BookSelection({
    id,
    name,
    chapter_count,
    expanded_id,
    on_select,
    handle_book_click,
}: BookSelectionProps): React.ReactElement
{
    const { settings } = use_settings();
    const theme = useTheme();
    const padding = use_top_bar_padding(theme);
    const is_expanded = expanded_id === id;

    return <React.Fragment key={id}>
        <ListItemButton onClick={() => handle_book_click(id)}>
            <ListItemText primary={name}/>
            {is_expanded ? <ExpandLess/> : <ExpandMore/>}
        </ListItemButton>
        <Collapse in={is_expanded} timeout="auto" unmountOnExit>
            <Grid container sx={{ padding: padding / 2 }}>  {/* container grid */}
                {utils.range_array(0, chapter_count).map(i => i + 1).map(chapter => (
                    <Grid key={chapter} size={12 / GRID_ITEM_COUNT_X} sx={{ padding: padding / 2 }}>  {/* each item */}
                        <Button
                            onClick={() => on_select({ chapter, book: id })}
                            sx={{
                                width: GRID_ITEM_SIZE * settings.ui_scale,
                                maxWidth: GRID_ITEM_SIZE * settings.ui_scale,
                                minWidth: GRID_ITEM_SIZE * settings.ui_scale,
                                height: GRID_ITEM_SIZE * settings.ui_scale,
                                maxHeight: GRID_ITEM_SIZE * settings.ui_scale,
                                minHeight: GRID_ITEM_SIZE * settings.ui_scale,
                                textAlign: "center",
                                cursor: "pointer",
                                borderRadius: 2,
                                transition: "0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxSizing: "border-box",
                                borderStyle: "solid",
                                borderWidth: (theme) => theme.spacing(1 / 8),
                                borderColor: theme.palette.grey[500],
                            }}
                        >
                            <Typography 
                                variant="body2"
                                textAlign="center"
                            >
                                {chapter}
                            </Typography>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Collapse>
    </React.Fragment>
}