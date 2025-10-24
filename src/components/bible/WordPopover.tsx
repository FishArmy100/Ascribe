import React, { useEffect, useMemo, useRef, useState } from "react";
import { use_selected_bibles, WordId } from "../../interop/bible";
import { fetch_backend_word_entries, ModuleEntry } from "../../interop/module_entry";
import { Box, Collapse, Divider, ListItemButton, Popover, Stack, Typography } from "@mui/material";
import SmallerTextSection from "../SmallerTextSection";
import { fetch_backend_verse_render_data, VerseRenderData } from "../../interop/bible/render";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ModuleEntryRenderer from "./ModuleEntryRenderer";

export type WordPopoverProps = {
    word: WordId | null,
    pos: {top: number, left: number} | null,
    on_close: () => void,
}

export default function WordPopover({
    word,
    pos,
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

    // --- translate (px) to nudge Popover paper upward if it overflows bottom viewport
    const [paperTranslateY, setPaperTranslateY] = useState<number>(0);
    const paperRef = useRef<HTMLElement | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    
    // expose handleResize so child components can trigger it
    const handleResizeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // handler computes the needed translateY (negative moves up)
        const handleResize = () => {
            const node = paperRef.current;
            if (!node) return;

            const rect = node.getBoundingClientRect();
            const margin = 8; // px gap from viewport edges

            // how much the paper overflows the bottom viewport edge
            const overflowBottom = rect.bottom - (window.innerHeight - margin);

            let translateY = 0;
            if (overflowBottom > 0) {
                // move up by overflow amount
                translateY = -Math.ceil(overflowBottom);
            }

            // clamp so we don't push past the top margin
            const newTop = rect.top + translateY;
            if (newTop < margin) {
                // adjust translate toward zero so top >= margin
                translateY += (margin - newTop);
            }

            setPaperTranslateY((prev) => (prev === translateY ? prev : translateY));
        };

        // store in ref so children can call it
        handleResizeRef.current = handleResize;

        // disconnect previous observer if any
        if (roRef.current) {
            roRef.current.disconnect();
            roRef.current = null;
        }

        const node = paperRef.current;
        if (!node) return;

        // create and observe
        roRef.current = new ResizeObserver(() => {
            handleResize();
        });
        roRef.current.observe(node);

        // call once immediately to position correctly on open
        // use requestAnimationFrame to ensure layout is stable after render
        requestAnimationFrame(() => handleResize());

        // also respond to viewport changes
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleResize, true); // capture to respond to ancestor scrolling too

        return () => {
            if (roRef.current) {
                roRef.current.disconnect();
                roRef.current = null;
            }
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleResize, true);
            handleResizeRef.current = null;
        };
    }, [is_open, module_entries, word]); // reattach when content or open state changes

    // reset when closed or anchor changes
    useEffect(() => {
        if (!is_open) setPaperTranslateY(0);
    }, [is_open, pos]);

    return (
        <Popover
            key={module_entries?.length}
            open={is_open}
            anchorPosition={pos ?? undefined}
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
                    ref: (el) => {
                        paperRef.current = el;
                    },
                    sx: {
                        m: 2, // margin: adds spacing from viewport edges
                        maxWidth: "90vw", // optional: limit width
                        maxHeight: "80vh", // stays within viewport
                        display: "flex", // helps inner container fill available space
                        flexDirection: "column",

                        // animate the nudge so it doesn't feel abrupt
                        transition: "transform 160ms ease",
                        // apply the computed translateY (this will be "" when zero)
                        transform: `translateY(${paperTranslateY}px)`,
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
                            onCollapseChange={() => {
                                // trigger resize after collapse animation completes
                                setTimeout(() => {
                                    handleResizeRef.current?.();
                                }, 200); // matches MUI "auto" timeout
                            }}
                        />}
                    </Stack>
                </SmallerTextSection>
            </Box>
        </Popover>
    )
}

type WordPopoverContentProps = {
    entries: ModuleEntry[],
    onCollapseChange: () => void,
}

function WordPopoverContent({
    entries,
    onCollapseChange,
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
        onCollapseChange(); // notify parent that collapse state changed
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
                    {entries.map((e, i) => (
                        <ModuleEntryRenderer entry={e} key={i} />
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