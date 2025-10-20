import React, { useEffect, useMemo, useState } from "react";
import { use_selected_bibles, WordId } from "../../interop/bible";
import { fetch_backend_word_entries, ModuleEntry } from "../../interop/module_entry";
import { Box, Collapse, Divider, ListItemButton, Popover, Stack, Typography } from "@mui/material";
import SmallerTextSection from "../SmallerTextSection";
import { fetch_backend_verse_render_data, VerseRenderData } from "../../interop/bible/render";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ModuleEntryRenderer from "./ModuleEntryRenderer";

export type WordPopoverProps = {
    word: WordId | null,
    anchor: HTMLElement | null,
    on_close: () => void,
}

export default function WordPopover({
    word,
    anchor,
    on_close,
}: WordPopoverProps): React.ReactElement
{
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const [verse_render_data, set_verse_render_data] = useState<VerseRenderData | null>(null);
    const { bible: bible_version } = use_selected_bibles();
    
    useEffect(() => {
        if (word !== null)
        {
            fetch_backend_word_entries(bible_version.name, word.verse, word.word).then(entries => {
                const filtered_entries = entries.filter(e => e.type !== "strongs_link")
                set_module_entries(filtered_entries);
            })

            fetch_backend_verse_render_data([word.verse], bible_version.name).then(v => {
                set_verse_render_data(v[0] ?? null);
            })
        }
    }, [word]);

    const is_open = useMemo(() => {
        return anchor !== null && module_entries !== null && word !== null;
    }, [anchor, module_entries, word]);

    const word_text = useMemo(() => {
        if (verse_render_data !== null && word !== null)
        {
            return verse_render_data.words[word.word - 1].word;
        }
        else
        {
            return null;
        }
    }, [verse_render_data]);

    return (
        <Popover
            key={module_entries?.length}
            open={is_open}
            anchorEl={anchor}
            onClose={on_close}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            marginThreshold={32}
            slotProps={{
                paper: {
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                        maxHeight: "80vh",
                        overflowY: "auto",
                    },
                }
            }}
        >
            <SmallerTextSection scale={0.75}>
                <Stack
                    direction="column"
                    sx={{
                        margin: 2,
                    }}
                >
                    {
                        word_text && (
                            <Typography
                                variant="h5"
                                textAlign="center"
                                fontWeight="bold"
                                key="title"
                            >
                                {`"${word_text}"`}
                            </Typography>
                        )
                    }
                    <Divider sx={{
                        mt: (theme) => theme.spacing(1),
                    }}/>
                    {module_entries && <WordPopoverContent entries={module_entries}/>}
                </Stack>
            </SmallerTextSection>
        </Popover>
    )
}

type WordPopoverContentProps = {
    entries: ModuleEntry[]
}

function WordPopoverContent({
    entries
}: WordPopoverContentProps): React.ReactElement
{
    const [open_modules, set_open_modules] = useState<string[]>([]);

    const on_click = (name: string) => {
        let copy = Array.from(open_modules)
        if (!copy.remove(name))
        {
            copy.push(name)
        }

        set_open_modules(copy)
    }

    return (
        <Stack
            maxWidth="200px"
        >
            {
                entries.group_py(e => e.module).sort(([a], [b]) => a.localeCompare(b)).map(([name, entries], i) => {
                    return (
                        <WordPopupItem
                            key={i}
                            entries={entries}
                            module_name={name}
                            open_modules={open_modules}
                            on_click={on_click}
                        />
                    )
                })
            }
        </Stack>
    )
}

type WordPopoverItemProps = {
    entries: ModuleEntry[],
    module_name: string,
    open_modules: string[],
    on_click: (name: string) => void,
}

function WordPopupItem({
    entries,
    module_name,
    open_modules,
    on_click,
}: WordPopoverItemProps): React.ReactElement
{
    const is_expanded = open_modules.find(p => p === module_name) ? true : false;
    return (
        <>
            <ListItemButton 
                onClick={() => on_click(module_name)}
                sx={{
                    mb: t => is_expanded ? t.spacing(1) : undefined,
                }}
            >
                <Typography component="h3" >{module_name}</Typography>
                {is_expanded? <ExpandLess/> : <ExpandMore/>}
            </ListItemButton>
            <Collapse in={is_expanded} timeout="auto" unmountOnExit>
                <Stack
                    sx={{
                        mr: 1,
                    }}
                >
                    {entries.map(e => (
                        <ModuleEntryRenderer entry={e} />
                    ))}
                </Stack>
                <Divider sx={{
                    mt: theme => theme.spacing(1),
                    mb: theme => theme.spacing(1),
                }} />
            </Collapse>
        </>
    )
}