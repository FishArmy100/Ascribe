import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PopoverEntry, { PopoverEntryData, PopoverEntryProps } from "./PopoverEntry";
import { Box, Divider, Popover, Stack, Typography } from "@mui/material";
import SmallerTextSection from "@components/SmallerTextSection";


export type PopoverBaseProps = {
    title: string | null,
    on_title_click?: (() => void),
    pos: {top: number, left: number} | null,
    on_close: () => void,
    entries: PopoverEntryData[],
}

export default function PopoverBase({
    title,
    on_title_click,
    pos,
    on_close,
    entries,
}: PopoverBaseProps): React.ReactElement
{
    const popover_ref = useRef<HTMLDivElement>(null);
    const [corrected_pos, set_corrected_pos] = useState<{ top: number; left: number } | null>(pos);

    const [open_modules, set_open_modules] = useState<string[]>([]);

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
    }, [pos, entries]);
    
    const is_open = useMemo(() => {
        return pos !== null;
    }, [pos, entries]);

    const handle_close = useCallback(() => {
        set_open_modules([]);
        on_close();
    }, [on_close, set_open_modules]);
    
    return (
        <Popover
            open={is_open}
            anchorPosition={corrected_pos ?? pos ?? undefined}
            anchorReference="anchorPosition"
            onClose={handle_close}
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
                        <PopoverBaseTitle 
                            title={title ?? ""}
                            on_click={on_title_click}
                            key="title"
                        />
                        <Divider 
                            sx={{
                                mt: (theme) => theme.spacing(1),
                                mb: (theme) => theme.spacing(1),
                            }}
                            key="divider"
                        />
                        {
                            <WordPopoverContent
                                entries={entries}
                                open_modules={open_modules}
                                set_open_modules={set_open_modules}
                            />
                        }
                    </Stack>
                </SmallerTextSection>
            </Box>
        </Popover>
    )
}

type PopoverBaseTitleProps = {
    title: string,
    on_click: (() => void) | undefined,
}

function PopoverBaseTitle({
    title,
    on_click
}: PopoverBaseTitleProps): React.ReactElement
{
    if (on_click !== undefined)
    {
        return (
            <Box
                sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    mb: 1,
                }}
            >
                <Typography
                    variant="h5"
                    textAlign="center"
                    fontWeight="bold"
                    className="animated-underline"
                    sx={{
                        cursor: "pointer",
                        width: "min-content"
                    }}
                    onClick={on_click}
                >
                    {title}
                </Typography>
            </Box>
        );
    }
    else 
    {
        return (
            <Typography
                variant="h5"
                textAlign="center"
                fontWeight="bold"
            >
                {title}
            </Typography>
        )
    }
}

type WordPopoverContentProps = {
    entries: PopoverEntryData[],
    open_modules: string[],
    set_open_modules: (m: string[]) => void,
}

function WordPopoverContent({
    entries,
    open_modules,
    set_open_modules,
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
            width="40vw"
        >
            {
                entries.sort((a, b) => a.title.localeCompare(b.title)).map((entry, i) => {
                    return (
                        <PopoverEntry
                            data={entry}
                            key={i}
                            is_expanded={open_modules.includes(entry.title)}
                            on_click={on_click}
                        />
                    )
                })
            }
        </Stack>
    )
}