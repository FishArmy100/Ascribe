import React, { useEffect, useMemo, useRef, useState } from "react";
import { BibleInfo, get_book_display_name, use_selected_bibles, WordId } from "../../interop/bible";
import { fetch_backend_word_entries, ModuleEntry } from "../../interop/module_entry";
import { Box, Collapse, Divider, ListItemButton, Popover, Stack, Typography } from "@mui/material";
import SmallerTextSection from "../SmallerTextSection";
import { fetch_backend_verse_render_data, VerseRenderData } from "../../interop/bible/render";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ModuleEntryRenderer from "./ModuleEntryRenderer";
import { HRefSrc } from "../../interop/html_text";

export type WordPopoverProps = {
    word: WordId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

export default function WordPopover({
    word,
    pos,
    on_close,
    on_ref_clicked,
}: WordPopoverProps): React.ReactElement
{
    const [module_entries, set_module_entries] = useState<ModuleEntry[] | null>(null);
    const [verse_render_data, set_verse_render_data] = useState<VerseRenderData | null>(null);
    const { bible: bible_version } = use_selected_bibles();

    const popover_ref = useRef<HTMLDivElement>(null);
    const [corrected_pos, set_corrected_pos] = useState<{ top: number; left: number } | null>(pos);
    
    const [open_modules, set_open_modules] = useState<string[]>([]);

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

    useEffect(() => {
        if (!pos || !popover_ref.current) return;

        const check_and_correct_pos = () => {
            if (!popover_ref.current) return;
            
            const rect = popover_ref.current.getBoundingClientRect();
            const bottomOverflow = rect.bottom - window.innerHeight;

            if (bottomOverflow > 0) 
            {
                const newTop = Math.max(16, pos.top - bottomOverflow - 16);
                set_corrected_pos({ ...pos, top: newTop });
            } 
            else 
            {
                set_corrected_pos({ ...pos }); // need to create a new object here
            }
        };

        // Initial check
        check_and_correct_pos();

        // Watch for size changes
        const resize_observer = new ResizeObserver(() => {
            check_and_correct_pos();
        });

        resize_observer.observe(popover_ref.current);

        return () => {
            resize_observer.disconnect();
        };
    }, [pos, module_entries, verse_render_data, open_modules]);
    
    const is_open = useMemo(() => {
        return pos !== null && module_entries !== null && word !== null;
    }, [pos, module_entries, word]);

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
            anchorPosition={corrected_pos ?? pos ?? undefined}
            anchorReference="anchorPosition"
            onClose={on_close}
            disablePortal={false}
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
                    ref: popover_ref,
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                        maxHeight: "80vh", // stays within viewport
                        display: "flex", // helps inner container fill available space
                        flexDirection: "column",

                        // animate the nudge so it doesn't feel abrupt
                        transition: "transform 160ms ease",
                    },
                }
            }}
        >
            <Box
                sx={{
                    overflowY: "auto",
                    maxHeight: "80vh",
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
                        {module_entries && <WordPopoverContent 
                            entries={module_entries}
                            bible_info={bible_version}
                            open_modules={open_modules}
                            set_open_modules={set_open_modules}
                            on_ref_clicked={on_ref_clicked}
                        />}
                    </Stack>
                </SmallerTextSection>
            </Box>
        </Popover>
    )
}

type WordPopoverContentProps = {
    entries: ModuleEntry[],
    bible_info: BibleInfo,
    open_modules: string[],
    set_open_modules: (m: string[]) => void,
    on_ref_clicked: (href: HRefSrc) => void,
}

function WordPopoverContent({
    entries,
    bible_info,
    open_modules,
    set_open_modules,
    on_ref_clicked,
}: WordPopoverContentProps): React.ReactElement
{
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
                            bible_info={bible_info}
                            on_ref_clicked={on_ref_clicked}
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
    bible_info: BibleInfo,
    on_ref_clicked: (href: HRefSrc) => void,
}

function WordPopupItem({
    entries,
    module_name,
    open_modules,
    on_click,
    bible_info,
    on_ref_clicked
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
                    {entries.map((e, i) => (
                        <ModuleEntryRenderer 
                            entry={e} 
                            key={i} 
                            on_ref_clicked={on_ref_clicked}
                            name_mapper={b => get_book_display_name(b, bible_info)}
                        />
                    ))}
                </Stack>
                <Divider sx={{
                    mt: theme => theme.spacing(1),
                    mb: theme => theme.spacing(1),
                }}/>
            </Collapse>
        </>
    )
}